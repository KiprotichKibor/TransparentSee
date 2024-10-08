from rest_framework import viewsets, status, permissions
from .models import Region, Report, Evidence, Investigation, Contribution, CaseReport, UserProfile, Badge, ContributionEvidence
from .serializers import RegionSerializer, ReportSerializer, EvidenceSerializer, InvestigationSerializer, ContributionSerializer, CaseReportSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from django.http import HttpResponse
from django.template.loader import render_to_string
from weasyprint import HTML
from .utils import moderate_content, generate_case_report_content
from core import serializers
from io import BytesIO

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [permissions.AllowAny]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
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

class EvidenceViewSet(viewsets.ModelViewSet):
    queryset = Evidence.objects.all()
    serializer_class = EvidenceSerializer
    permission_classes = [IsAuthenticated]

class InvestigationViewSet(viewsets.ModelViewSet):
    queryset = Investigation.objects.all()
    serializer_class = InvestigationSerializer
    permission_classes = [permissions.IsAuthenticated]

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

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        if not moderate_content(serializer.validated_data.get('content', '')):
            raise serializers.ValidationError('Your contribution contains inappropriate content.')
        
        if serializer.validated_data.get('anonymous', False):
            serializer.save(user=None)
        else:
            serializer.save(user=self.request.user)

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        contribution = self.get_object()
        contribution.verified = True
        contribution.save()
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

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        contribution = self.get_object()
        contribution.verified = True
        contribution.save()

        # Update user's reputation for verified contributuion
        if contribution.user:
            profile = contribution.user.profile
            profile.reputation_score += 10
            profile.save()

        serializer = self.get_serializer(contribution)
        return Response(serializer.data)
    
class CaseReportViewSet(viewsets.ModelViewSet):
    queryset = CaseReport.objects.all()
    serializer_class = CaseReportSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=False, methods=['POST'])
    @transaction.atomic
    def generate(self, request):
        investigation_id = request.data.get('investigation')
        investigation = Investigation.objects.get(pk=investigation_id)

        content = generate_case_report_content(investigation)

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
        
class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = serializers.UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action in ['retrieve', 'list']:
            permission_classes = [permissions.AllowAny]
        else:
            permission_classes = [permissions.IsAuthenticated]
        return [permission() for permission in permission_classes]
    
    def get_queryset(self):
        queryset = UserProfile.objects.all()
        username = self.request.query_params.get('username', None)
        if username is not None:
            queryset = queryset.filter(user__username=username)
        return queryset

    @action(detail=True, methods=['post'])
    def award_badge(self, request, pk=None):
        profile = self.get_object()
        badge_id = request.data.get('badge_id')

        try:
            badge = Badge.objects.get(pk=badge_id)
        except Badge.DoesNotExist:
            return Response({'detail': 'Badge not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile.badges.add(badge)
        profile.save()

        return Response({'detail': f'Badge {badge.name} awarded successfully.'})

    @action(detail=True, methods=['post'])
    def remove_badge(self, request, pk=None):
        profile = self.get_object()
        badge_id = request.data.get('badge_id')

        try:
            badge = Badge.objects.get(pk=badge_id)
        except Badge.DoesNotExist:
            return Response({'detail': 'Badge not found.'}, status=status.HTTP_404_NOT_FOUND)

        profile.badges.remove(badge)
        profile.save()

        return Response({'detail': f'Badge {badge.name} removed successfully.'})
    
    @action(detail=True, methods=['post'])
    def update_reputation(self, request, pk=None):
        profile = self.get_object()
        score_change = request.data.get('score_change', 0)

        profile.reputation_score += score_change
        profile.save()

        return Response({'detail': 'Reputation updated successfully.', 'new_score': profile.reputation_score})
    
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
    
    @action(detail=True, methods=['get'])
    def list_badges(self, request, pk=None):