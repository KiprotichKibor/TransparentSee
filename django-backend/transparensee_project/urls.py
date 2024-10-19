from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from core import views
from core.views import CustomUserViewSet, RegionViewSet, ReportViewSet, InvestigationViewSet, ContributionViewSet, EvidenceViewSet, CaseReportViewSet, UserProfileViewSet, BadgeViewSet, get_stats
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

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
    path('api/', include('core.urls')),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/register/', CustomUserViewSet.as_view({'post': 'create'}), name='register'),
    path('api/users/', CustomUserViewSet.as_view({'get': 'list'}), name='users'),
    path('api/users/<int:pk>/', CustomUserViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='user'),
    path('api/user-role/', views.get_user_role, name='user-role'),
    path('api/login/', CustomUserViewSet.as_view({'post': 'login'}), name='login'),
    path('api/logout/', CustomUserViewSet.as_view({'post': 'logout'}), name='logout'),
    path('api/profile/', UserProfileViewSet.as_view({'get': 'retrieve', 'put': 'update'}), name='profile'),
    path('api/regions/', RegionViewSet.as_view({'get': 'list'}), name='regions'),
    path('api/reports/', ReportViewSet.as_view({'get': 'list', 'post': 'create'}), name='reports'),
    path('api/reports/<int:pk>/', ReportViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='report'),  
    path('api/investigations/', InvestigationViewSet.as_view({'get': 'list', 'post': 'create'}), name='investigations'),
    path('api/investigations/<int:pk>/', InvestigationViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='investigation'),
    path('api/contributions/', ContributionViewSet.as_view({'get': 'list', 'post': 'create'}), name='contributions'),
    path('api/contributions/<int:pk>/', ContributionViewSet.as_view({'get': 'retrieve', 'put': 'update', '   delete': 'destroy'}), name='contribution'),
    path('api/evidence/', EvidenceViewSet.as_view({'get': 'list', 'post': 'create'}), name='evidence'),
    path('api/evidence/<int:pk>/', EvidenceViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='evidence'),
    path('api/case-reports/', CaseReportViewSet.as_view({'get': 'list', 'post': 'create'}), name='case-reports'),
    path('api/case-reports/<int:pk>/', CaseReportViewSet.as_view({'get': 'retrieve', 'put': 'update', '   delete': 'destroy'}), name='case-report'),
    path('api/badges/', BadgeViewSet.as_view({'get': 'list', 'post': 'create'}), name='badges'),
    path('api/badges/<int:pk>/', BadgeViewSet.as_view({'get': 'retrieve', 'put': 'update', 'delete': 'destroy'}), name='badge'),
    path('api/stats/', get_stats, name='stats'),
    path('api-auth/', include('rest_framework.urls')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]