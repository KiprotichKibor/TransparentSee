from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, UserProfile, Region, Report, Investigation, Contribution, CaseReport, Badge

class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'profile'

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'is_staff', 'get_reputation_score']
    fieldsets = UserAdmin.fieldsets + (
        ('Extra fields', {'fields': ('bio', 'location', 'reputation_score', 'privacy_settings')}),
    )

    def get_reputation_score(self, obj):
        return obj.profile.reputation_score
    get_reputation_score.short_description = 'Reputation Score'

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Region)
admin.site.register(Report)
admin.site.register(Investigation)
admin.site.register(Contribution)
admin.site.register(CaseReport)
admin.site.register(Badge)