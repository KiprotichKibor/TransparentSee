from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core.views import RegionViewSet, ReportViewSet, InvestigationViewSet, ContributionViewSet, EvidenceViewSet
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

router = DefaultRouter()
router.register(r'regions', RegionViewSet)
router.register(r'reports', ReportViewSet)
router.register(r'evidence', EvidenceViewSet)
router.register(r'investigations', InvestigationViewSet)
router.register(r'contributions', ContributionViewSet)

schema_view = get_schema_view(
   openapi.Info(
      title="TransparenSee API",
      default_version='v1',
      description="API for TransparenSee platform",
   ),
   public=True,
   permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api-auth/', include('rest_framework.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]