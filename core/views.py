from rest_framework import viewsets, status
from .models import Region, Report, Evidence, Investigation, Contribution
from .serializers import RegionSerializer, ReportSerializer, EvidenceSerializer, InvestigationSerializer, ContributionSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction

class RegionViewSet(viewsets.ModelViewSet):
    queryset = Region.objects.all()
    serializer_class = RegionSerializer
    permission_classes = [AllowAny]

class ReportViewSet(viewsets.ModelViewSet):
    queryset = Report.objects.all()
    serializer_class = ReportSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [AllowAny]
        else:
            permission_classes = [IsAuthenticated]
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
    permission_classes = [IsAuthenticated]

class ContributionViewSet(viewsets.ModelViewSet):
    queryset = Contribution.objects.all()
    serializer_class = ContributionSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=False, methods=['post'])
    def contribute_anonymously(self, request):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=None, anonymous=True)
        return Response(serializer.data)