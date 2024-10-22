import datetime
from tokenize import TokenError
from django.forms import ValidationError
from django.db.models.functions import TruncDate
from rest_framework import viewsets, status, permissions
from .models import CustomUser, Region, Report, Evidence, Investigation, Contribution, CaseReport, UserActivity, Badge, UserProfile, UserRole, Notification, Comment
from .serializers import CustomUserSerializer, RegionSerializer, ReportSerializer, EvidenceSerializer, InvestigationSerializer, ContributionSerializer, CaseReportSerializer, UserProfileSerializer, NotificationSerializer, CommentSerializer, UserRoleSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.db.models import Q, Count, Min, F
from django.http import HttpResponse, QueryDict
from django.core.paginator import Paginator, EmptyPage
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.utils import timezone
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from weasyprint import HTML
from .utils import generate_report_content, enhanced_content_moderation, generate_report_pdf, generate_report_docx
from .permissions import IsOwnerOrReadOnly, CanManageInvestigation, CanGenerateCaseReport, CanVerifyContribution, CanManageUserProfile, IsAdminUser, IsModeratorUser
from core import serializers
from io import BytesIO
from dateutil.relativedelta import relativedelta
import logging

from core import models

logger = logging.getLogger(__name__)


class CustomUserViewSet(viewsets.ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'login', 'logout']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        return Response({
            'user': CustomUserSerializer(user).data,
            'access': access_token,
            'message': 'User created successfully.'
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if email is None or password is None:
            return Response({'detail': 'Please provide both username and password.'}, status=status.HTTP_400_BAD_REQUEST)
        
        user = CustomUser.objects.filter(email=email).first()
        if user is None:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        if not user.check_password(password):
            return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_400_BAD_REQUEST)

        refresh = RefreshToken.for_user(user)
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': CustomUserSerializer(user).data
        })

    @action(detail=False, methods=['post'])
    def logout(self, request):
        refresh_token = request.data.get('refresh_token')
        if refresh_token is None:
            return Response({'detail': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()  # Blacklist the refresh token
            return Response({'detail': 'Logout successful.'}, status=200)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanManageUserProfile]
    lookup_field = 'user__username'
    lookup_url_kwarg = 'username'

    def get_object(self):
        username = self.kwargs.get(self.lookup_url_kwarg)
        if username == 'me' or username is None:
            return self.request.user.profile
        return super().get_object()
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user.profile)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def get_level(self, request, username=None):
        profile = self.get_object()
        level, next_level_threshold = profile.calculate_level()
        return Response({
            'current_level': level,
            'next_level_threshold': next_level_threshold,
            'current_reputation': profile.reputation_score
        })
    
    @action(detail=True, methods=['post'])
    def update_privacy(self, request, username=None):
        profile = self.get_object()
        privacy_settings = request.data.get('privacy_settings', {})
        profile.update_privacy_settings(privacy_settings)
        return Response({'status': 'Privacy settings updated successfully.'})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_role(request):
    try:
        role = request.user.role.role
    except AttributeError:
        role = 'user'  # Default role if none exists
    return Response({'role': role})

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = Report.objects.all()
        search = self.request.query_params.get('search', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        status = self.request.query_params.get('status', None)
        region = self.request.query_params.get('region', None)

        if search:
            queryset = queryset.filter(Q(title__icontains=search) | Q(description__icontains=search))
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__lte=end_date)
        if status:
            queryset = queryset.filter(status=status)
        if region:
            queryset = queryset.filter(region__id=region)

        return queryset
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        report = self.get_object()
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user, report=report)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    @method_decorator(ratelimit(key='user', rate='5/m', method='POST', block=True))
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        logger.info(f'Received report submission: {request.data}')

        mutable_data = request.data.copy() if isinstance(request.data, QueryDict) else request.data

        try:
            if not enhanced_content_moderation(mutable_data.get('description')):
                logger.warning(f'Report submission blocked due to inappropriate content: {request.data}')
                return Response({'detail': 'Your report contains inappropriate content.'}, status=status.HTTP_400_BAD_REQUEST)
            
            if mutable_data.get('anonymous') == 'true':
                mutable_data['anonymous'] == True
                mutable_data['user'] = None
            else:
                mutable_data['anonymous'] == False
                mutable_data['user'] = request.user.id
            
            serializer = self.get_serializer(data=mutable_data)
            serializer.is_valid(raise_exception=True)
            logger.info(f'Report submission passed content moderation: {request.data}')
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            logger.info(f'Report created successfully')
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            logger.error(f'Validation error: {str(e)}')
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error(f'An error occurred: {str(e)}')
            return Response({'detail': 'An error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def perform_create(self, serializer):
        logger.info('Perfoming report creation')
        serializer.save()
        logger.info('Report created successfully')

    @method_decorator(cache_page(60 * 15))
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated]


class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all()
    serializer_class = InvestigationSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageInvestigation]

    def get_queryset(self):
        queryset = Investigation.objects.all()
        search = self.request.query_params.get('search', None)
        start_date = self.request.query_params.get('start_date', None)
        end_date = self.request.query_params.get('end_date', None)
        status = self.request.query_params.get('status', None)
        region = self.request.query_params.get('region', None)


        if search:
            queryset = queryset.filter(Q(report__title__icontains=search) | Q(report__description__icontains=search))
        if start_date:
            start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
            queryset = queryset.filter(created_at__lte=end_date)
        if status:
            queryset = queryset.filter(status=status)
        if region:
            queryset = queryset.filter(report__region__id=region)

        return queryset
    
    @action(detail=True, methods=['post'])
    @transaction.atomic
    def start_investigation(self, request, pk=None):
        report = Report.objects.get(pk=pk)
        if hasattr(report, 'investigation'):
            return Response({'detail': 'Investigation already exists for this report'}, status=status.HTTP_400_BAD_REQUEST)
        
        investigation = Investigation.objects.create(report=report)
        serializer = self.get_serializer(investigation)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        investigation = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Investigation.STATUS_CHOICES).keys():
            return Response({'detail': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)

        investigation.status = new_status
        investigation.save()
        serializer = self.get_serializer(investigation)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def vote_contribution(self, request, pk=None):
        investigation = self.get_object()
        contribution_id = request.data.get('contribution_id')
        vote = request.data.get('vote')
        
        try:
            contribution = Contribution.objects.get(id=contribution_id, investigation=investigation)
            contribution.votes += vote
            contribution.save()
            return Response({'status': 'Vote recorded successfully.'})
        except Contribution.DoesNotExist:
            return Response({'detail': 'Contribution not found.'}, status=status.HTTP_404_NOT_FOUND)
        
    @action(detail=True, methods=['post'])
    def assign_role(self, request, pk=None):
        investigation = self.get_object()
        user_id = request.data.get('user_id')
        role = request.data.get('role')
        
        try:
            investigation.assign_role(user_id, role)
            return Response({'status': 'Role assigned successfully.'})
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
    @action(detail=True, methods=['post'])
    def create_task(self, request, pk=None):
        investigation = self.get_object()
        task_data = request.data

        task = investigation.create_task(task_data)
        return Response({'status': 'Task created successfully.', 'task_id': task.id})

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsOwnerOrReadOnly]

    @action(detail=True, methods=['post'], permission_classes=[CanVerifyContribution])
    def verify(self, request, pk=None):
        contribution = self.get_object()
        contribution.verified = True
        contribution.save()

        # Update user's reputation for verified contribution
        if contribution.user:
            profile = contribution.user.profile
            profile.reputation_score += 10
            profile.save()

        serializer = self.get_serializer(contribution)
        return Response(serializer.data)

    @action(detail=False, methods=['post'])
    def contribute_anonymously(self, request):
        request.data['anonymous'] = True
        return self.create(request)
    
    @transaction.atomic
    def perform_create(self, serializer):
        contribution = serializer.save(user=self.request.user)

        # Update user's reputation
        profile = self.request.user.profile
        profile.reputation_score += 5
        profile.save()
    
class CaseReportViewSet(viewsets.ModelViewSet):
    queryset = CaseReport.objects.all()
    serializer_class = CaseReportSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanGenerateCaseReport]

    @action(detail=False, methods=['POST'])
    @transaction.atomic
    def generate(self, request):
        investigation_id = request.data.get('investigation')
        investigation = Investigation.objects.get(pk=investigation_id)

        content = generate_report_content(investigation)

        case_report = CaseReport.objects.create(
            investigation=investigation,
            generated_by=request.user,
            content=content
        )

        # Generate PDF
        html_string = render_to_string('core/case_report_template.html', {'content': content})
        html = HTML(string=html_string)
        result = html.write_pdf()
        
        # Save PDF to case_report
        pdf_file = BytesIO(result)
        case_report.pdf_file.save(f'case_report_{case_report.id}.pdf', pdf_file)
        
        serializer = self.get_serializer(case_report)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'])
    def download_pdf(self, request, pk=None):
        case_report = self.get_object()
        if case_report.pdf_file:
            response = HttpResponse(case_report.pdf_file, content_type='application/pdf')
            response['Content-Disposition'] = f'attachment; filename="{case_report.pdf_file.name}"'
            return response
        else:
            return Response({'detail': 'PDF not found.'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['post'])
    def generate_report(self, request, pk=None):
        case_report = self.get_object()
        template = request.data.get('template', 'default')

        content = generate_report_content(case_report, template)
        case_report.content = content
        case_report.save()

        return Response({'status': 'Report generated successfully.'})
    
    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        case_report = self.get_object()
        case_report.status = CaseReport.STATUS_PENDING
        case_report.save()
        return Response({'status': 'Case report submitted for review.'})
    
    @action(detail=True, methods=['get'])
    def export_report(self, request, pk=None):
        case_report = self.get_object()
        export_format = request.query_params.get('format', 'pdf')

        if export_format == 'pdf':
            file_content = generate_report_pdf(case_report)
            content_type = 'application/pdf'
            file_name = f'report_{case_report.id}.pdf'
        elif export_format == 'docx':
            file_content = generate_report_docx(case_report)
            content_type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            file_name = f'report_{case_report.id}.docx'
        else:
            return Response({'detail': 'Unsupported format.'}, status=status.HTTP_400_BAD_REQUEST)

        response = HttpResponse(file_content, content_type=content_type)
        response['Content-Disposition'] = f'attachment; filename="{file_name}"'
        return response



class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all()
    serializer_class = serializers.BadgeSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAdminUser]
        return [permission() for permission in permission_classes]

class NotificationViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user, read=False)
    
    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.read = True
        notification.save()
        return Response({'status': 'Notification marked as read.'})
    
class AdminViewSet(viewsets.ViewSet):
    permission_classes = [IsAdminUser]

    @action(detail=False, methods=['get'])
    def stats (self, request):
        stats = {
            'total_users': CustomUser.objects.count(),
            'total_reports': Report.objects.count(),
            'total_investigations': Investigation.objects.count(),
            'total_case_reports': CaseReport.objects.count(),
            'total_contributions': Contribution.objects.count(),
            'total_badges': Badge.objects.count()
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def users(self, request):
        users = CustomUser.objects.all()
        serializer = CustomUserSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_user_role(self, request, pk=None):
        user = CustomUser.objects.get(pk=pk)
        new_role = request.data.get('role')
        if new_role in dict(UserRole.ROLE_CHOICES).keys():
            user.role = new_role
            user.save()
            return Response({'status': 'User role updated successfully.'})
        return Response({'error': 'Invalid role.'}, status=status.HTTP_400_BAD_REQUEST)

class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return UserRole.objects.all()
        return UserRole.objects.filter(user=self.request.user)

    @action(detail=False, methods=['GET'])
    def my_role(self, request):
        user_role = UserRole.objects.get(user=request.user)
        serializer = self.get_serializer(user_role)
        return Response(serializer.data)

    @action(detail=True, methods=['POST'], permission_classes=[IsAdminUser])
    def set_role(self, request, pk=None):
        user_role = self.get_object()
        new_role = request.data.get('role')
        if new_role not in dict(UserRole.ROLE_CHOICES).keys():
            return Response({'error': 'Invalid role'}, status=status.HTTP_400_BAD_REQUEST)
        user_role.role = new_role
        user_role.save()
        return Response({'status': 'role updated'})

    def update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().update(request, *args, **kwargs)

    def partial_update(self, request, *args, **kwargs):
        if not request.user.is_staff:
            return Response({'error': 'You do not have permission to perform this action.'},
                            status=status.HTTP_403_FORBIDDEN)
        return super().partial_update(request, *args, **kwargs)
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_stats(request):
    # Get counts for reports by status
    reports_by_status = Report.objects.values('status').annotate(count=Count('id'))

    # Get counts for reports by region
    reports_by_region = Report.objects.values('region__name').annotate(count=Count('id'))                                                 

    # Get counts for investigations by status
    investigations_by_status = Investigation.objects.values('status').annotate(count=Count('id'))

    # Get Reports over time (last 30 days)
    end_date = timezone.now().date()
    start_date = end_date - datetime.timedelta(days=30)
    reports_over_time = (
        Report.objects
        .filter(created_at__date__range=[start_date, end_date])
        .annotate(date=TruncDate('created_at'))
        .values('date')
        .annotate(count=Count('id'))
        .order_by('date')
    )

    # User activity over time (last 30 days)
    user_reports = (
        Report.objects
        .filter(created_at__date__range=[start_date, end_date])
        .annotate(date=TruncDate('created_at'))
        .values('date', 'user')
    )
    user_contributions = (
        Contribution.objects
        .filter(created_at__date__range=[start_date, end_date])
        .annotate(date=TruncDate('created_at'))
        .values('date', 'user')
    )
    user_activity = {}
    for item in user_reports.union(user_contributions).order_by('date'):
        date_str = item['date'].strftime('%Y-%m-%d')
        if date_str not in user_activity:
            user_activity[date_str] = {
                'newUsers': set(),
                'activeUsers': set()
            }
        user_activity[date_str]['activeUsers'].add(item['user'])
        user_activity[date_str]['newUsers'].add(item['user'])

    
    # Count new users
    all_users = set()
    for date in sorted(user_activity.keys()):
        new_users = user_activity[date]['newUsers'] - all_users
        user_activity[date]['newUsers'] = len(new_users)
        user_activity[date]['activeUsers'] = len(user_activity[date]['activeUsers'])
        all_users.update(new_users)

    user_activity_list = [
        {'date': date, 'newUsers': data['newUsers'], 'activeUsers': data['activeUsers']}
        for date, data in user_activity.items()
    ]

    return Response({
        'reportsByStatus': list(reports_by_status),
        'reportsByRegion': list(reports_by_region),
        'investigationsByStatus': list(investigations_by_status),
        'reportsOverTime': list(reports_over_time),
        'userActivityOverTime': user_activity_list
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_reports(request):
    page = int(request.GET.get('page', 1))
    search = request.GET.get('search', '')

    reports = Report.objects.all()
    if search:
        reports = reports.filter(Q(title__icontains=search) | Q(description__icontains=search))

    paginator = Paginator(reports, 10)

    try:
        reports_page = paginator.page(page)
    except EmptyPage:
        reports_page = paginator.page(paginator.num_pages)

    serializer = ReportSerializer(reports_page, many=True)
    return Response({
        'results': serializer.data,
        'count': paginator.count,
        'num_pages': paginator.num_pages,
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_reports(request):
    limit = int(request.GET.get('limit', 5))
    reports = Report.objects.order_by('-created_at')[:limit]
    serializer = ReportSerializer(reports, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recent_investigations(request):
    limit = int(request.GET.get('limit', 5))
    investigations = Investigation.objects.order_by('-created_at')[:limit]
    serializer = InvestigationSerializer(investigations, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_stats(request, user_id):
    print(f"Fetching stats for user_id: {user_id}")
    try:
        user = CustomUser.objects.get(id=user_id)
        
        # Get total reports
        total_reports = Report.objects.filter(user=user).count()
        
        # Get total contributions
        total_contributions = Contribution.objects.filter(user=user).count()
        
        # Get reputation score
        reputation_score = getattr(user, 'reputation_score', 0)
        
        # Get badges earned
        badges_earned = 0
        if hasattr(user, 'badges'):
            badges_earned = user.badges.count()
        elif hasattr(user, 'userprofile') and hasattr(user.profile, 'badges'):
            badges_earned = user.userprofile.badges.count()
        else:
            # badges_earned = Badge.objects.filter(user=user).count()
            pass

        stats = {
            'totalReports': total_reports,
            'totalContributions': total_contributions,
            'reputationScore': reputation_score,
            'badgesEarned': badges_earned
        }
        print(f"User stats: {stats}")
        return Response(stats)
    except CustomUser.DoesNotExist:
        return Response({'error': f'User with id {user_id} not found'}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        print(f"Error in get_user_stats: {str(e)}")
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def start_investigation(request, pk):
    try:
        report = Report.objects.get(pk=pk)
        investigation = Investigation.objects.create(report=report)
        return Response({'message': 'Investigation started', 'id': investigation.id}, status=status.HTTP_201_CREATED)
    except Report.DoesNotExist:
        return Response({'error': 'Report not found'}, status=status.HTTP_404_NOT_FOUND)