from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import (
    CustomUserViewSet,
    UserProfileViewSet,
    RegionViewSet,
    ReportViewSet,
    InvestigationViewSet,
    ContributionViewSet,
    EvidenceViewSet,
    CaseReportViewSet,
    BadgeViewSet,
)
from rest_framework_simplejwt.views import TokenObtainPairView

router = DefaultRouter()
router.register(r'users', CustomUserViewSet)
router.register(r'profiles', UserProfileViewSet)
router.register(r'regions', RegionViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'evidence', EvidenceViewSet)
router.register(r'investigations', InvestigationViewSet)
router.register(r'contributions', ContributionViewSet)
router.register(r'case-reports', CaseReportViewSet)
router.register(r'badges', BadgeViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
]