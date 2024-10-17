from tokenize import TokenError
from django.forms import ValidationError
from rest_framework import viewsets, status, permissions
from .models import CustomUser, Region, Report, Evidence, Investigation, Contribution, CaseReport, UserActivity, Badge, UserProfile
from .serializers import CustomUserSerializer, RegionSerializer, ReportSerializer, EvidenceSerializer, InvestigationSerializer, ContributionSerializer, CaseReportSerializer, UserProfileSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page
from django_ratelimit.decorators import ratelimit
from weasyprint import HTML
from .utils import generate_report_content, enhanced_content_moderation, generate_report_pdf, generate_report_docx
from .permissions import IsOwnerOrReadOnly, CanManageInvestigation, CanGenerateCaseReport, CanVerifyContribution, CanManageUserProfile
from core import serializers
from io import BytesIO


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
        return Response({
            'user': CustomUserSerializer(user).data,
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
            return Response({"detail": "Logout successful."}, status=200)
        except Exception as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


'''
    @action(detail=False, methods=['post'], url_path='logout')
    def logout(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if not refresh_token:
                return Response({'error': 'Refresh token is required.'}, status=status.HTTP_400_BAD_REQUEST)
            
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Logout successful.'}, status=status.HTTP_200_OK)
        except TokenError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': 'An unexpected error occurred.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
'''

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanManageUserProfile]

    @action(detail=True, methods=['get'])
    def get_level(self, request, pk=None):
        profile = self.get_object()
        level, next_level_threshold = profile.calculate_level()
        return Response({
            'current_level': level,
            'next_level_threshold': next_level_threshold,
            'current_reputation': profile.reputation_score
        })
    
    @action(detail=True, methods=['post'])
    def update_privacy(self, request, pk=None):
        profile = self.get_object()
        privacy_settings = request.data.get('privacy_settings', {})
        profile.update_privacy_settings(privacy_settings)
        return Response({'status': 'Privacy settings updated successfully.'})

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
    
    @transaction.atomic
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
    
    @action(detail=False, methods=['post'])
    @transaction.atomic
    def submit_anonymously(self, request):
        request.data['anonymous'] = True
        return self.create(request)
    
    @method_decorator(ratelimit(key='user', rate='5/m', method='POST', block=True))
    def create (self, request, *args, **kwargs):
        try:
            if not enhanced_content_moderation(request.data.get('description', '')):
                return Response({'detail': 'Your report contains inappropriate content.'}, status=status.HTTP_400_BAD_REQUEST)
            
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except ValidationError as e:
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, CanManageInvestigation]

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

''' 
    @action(detail=True, methods=['get'])
    def award_to_user(self, request, pk=None):
        badge = self.get_object()
        username = request.query_params.get('username')
        if username is None:
            return Response({'detail': 'Username not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserProfile.objects.get(user__username=username)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        user.badges.add(badge)
        user.save()
        
        return Response({'detail': f'Badge {badge.name} awarded to {username} successfully.'})
    
    @action(detail=True, methods=['get'])
    def remove_from_user(self, request, pk=None):
        badge = self.get_object()
        username = request.query_params.get('username')
        if username is None:
            return Response({'detail': 'Username not provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = UserProfile.objects.get(user__username=username)
        except UserProfile.DoesNotExist:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        
        user.badges.remove(badge)
        user.save()
        
        return Response({'detail': f'Badge {badge.name} removed from {username} successfully.'})
    
    @action(detail=True, methods=['get'])
    def list_users(self, request, pk=None):
        badge = self.get_object()
        users = UserProfile.objects.filter(badges=badge)
        serializer = serializers.UserProfileSerializer(users, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def list_badges(self, request, pk=None):
        badge = self.get_object()
        users = UserProfile.objects.filter(badges=badge)
        serializer = serializers.UserProfileSerializer(users, many=True)
        return Response(serializer.data)
'''