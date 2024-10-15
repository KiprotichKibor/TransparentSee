from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db.models.signals import post_save
from django.utils.translation import gettext_lazy as _
from django.dispatch import receiver

class Region(models.Model):
    REGION_TYPES = [
        ('country', 'Country'),
        ('county', 'County'),
        ('subcounty', 'Sub-County'),
        ('ward', 'Ward'),
    ]

    name = models.CharField(max_length=255)
    region_type = models.CharField(max_length=50, choices=REGION_TYPES, default='country')
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, related_name='children')

    def __str__(self):
        return f"{self.get_region_type_display()} - {self.name}"
    
    class Meta:
        unique_together = ('name', 'region_type', 'parent')

class CustomUserManager(BaseUserManager):
    def create_user(self, email, username, first_name, last_name, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        if not first_name:
            raise ValueError('Users must have a first name')
        if not last_name:
            raise ValueError('Users must have a last name')

        user = self.model(
            email=self.normalize_email(email),
            username=username,
            first_name=first_name,
            last_name=last_name,
        )

        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, first_name, last_name, password):
        user = self.create_user(
            email=self.normalize_email(email),
            username=username,
            first_name=first_name,
            last_name=last_name,
            password=password,
        )
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(_('email address'), unique=True)
    username = models.CharField(max_length=150, unique=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    objects = CustomUserManager()

    USERNAME_FIELD = 'email'

    class Meta:
        db_table = 'auth_user'
        verbose_name = 'user'
        verbose_name_plural = 'users'
    
    def __str__(self):
        return self.username
    
    @property
    def profile(self):
        return self.userprofile

class UserProfile(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='userprofile')
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    reputation_score = models.IntegerField(default=0)
    privacy_settings = models.JSONField(default=dict)

    def __str__(self):
        return self.username
    
    def calculate_level(self):
        level = self.reputation_score // 100
        next_level_threshold = (level + 1) * 100
        return level, next_level_threshold
    
    def update_reputation(self, points):
        self.reputation_score += points
        self.save()

    def update_privacy_settings(self, settings):
        self.privacy_settings.update(settings)
        self.save()

@receiver(post_save, sender=CustomUser)
def create_or_update_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)
    instance.userprofile.save()

class Report(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('under_investigation', 'Under Investigation'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    ]

    title = models.CharField(max_length=255)
    description = models.TextField()
    region = models.ForeignKey(Region, on_delete=models.CASCADE, null=True, blank=True)
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Investigation(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('in_progress', 'In Progress'),
        ('Closed', 'Closed'),
    ]

    report = models.OneToOneField(Report, on_delete=models.CASCADE, related_name='investigation')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Investigation for {self.report.title}"
    
    def assign_role(self, user_id, role):
        user = CustomUser.objects.get(id=user_id)
        InvestigationRole.objects.create(investigation=self, user=user, role=role)

    def create_task(self, task_data):
        return Task.objects.create(investigation=self, **task_data)

class Evidence(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='evidences')
    file = models.FileField(upload_to='evidence/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.report.title}"

class InvestigationRole(models.Model):
    ROLE_CHOICES = [
        ('lead', 'Lead Investigator'),
        ('contributor', 'Contributor'),
        ('reviewer', 'Reviewer'),
    ]

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='roles')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='contributor')

    class Meta:
        unique_together = ('investigation', 'user')

class Task(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    description = models.TextField()
    due_date = models.DateTimeField()
    assigned_to = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    completed = models.BooleanField(default=False)

    def __str__(self):
        return self.title

class Contribution(models.Model):
    CONTRIBUTION_TYPES = [
        ('comment', 'Comment'),
        ('evidence', 'Evidence'),
        ('verification', 'Verification'),
    ]

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='contributions')
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    contribution_type = models.CharField(max_length=50, choices=CONTRIBUTION_TYPES, default='comment')
    anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)
    votes = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.get_contribution_type_display()} for {self.investigation.report.title}"
    
class ContributionEvidence(models.Model):
    contribution = models.OneToOneField(Contribution, on_delete=models.CASCADE, related_name='evidences')
    file = models.FileField(upload_to='contribution_evidence/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.contribution}"
    
class CaseReport(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('published', 'Published'),
    ]

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='case_reports')
    generated_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='draft')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pdf_file = models.FileField(upload_to='case_reports/', null=True, blank=True)
    docx_file = models.FileField(upload_to='case_reports/', null=True, blank=True)

    def __str__(self):
        return f"Case report for {self.investigation.report.title}"
    
class Badge(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.ImageField(upload_to='badge_icons/')
    users = models.ManyToManyField(UserProfile, related_name='badges', blank=True)

    def __str__(self):
        return self.name
    
class UserActivity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='activities')
    activity_type = models.CharField(max_length=255)
    description = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.activity_type}"