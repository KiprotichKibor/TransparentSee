from rest_framework import viewsets, status, permissions
from .models import Region, Report, Evidence, Investigation, Contribution
from .serializers import RegionSerializer, ReportSerializer, EvidenceSerializer, InvestigationSerializer, ContributionSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .utils import moderate_content
from core import serializers

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