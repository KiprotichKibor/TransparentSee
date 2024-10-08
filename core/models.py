from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

class Region(models.Model):
    name = models.CharField(max_length=255)
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return self.name

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
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    anonymous = models.BooleanField(default=False)
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.title

class Evidence(models.Model):
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    file = models.FileField(upload_to='evidence/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.report.title}"

class Investigation(models.Model):
    STATUS_CHOICES = [
        ('Open', 'Open'),
        ('in_progress', 'In Progress'),
        ('Closed', 'Closed'),
    ]

    report = models.ForeignKey(Report, on_delete=models.CASCADE, related_name='investigation')
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Investigation for {self.report.title}"

class Contribution(models.Model):
    CONTRIBUTION_TYPES = [
        ('comment', 'Comment'),
        ('evidence', 'Evidence'),
        ('verification', 'Verification'),
    ]

    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='contributions')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    contribution_type = models.CharField(max_length=50, choices=CONTRIBUTION_TYPES, default='comment')
    anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_contribution_type_display()} for {self.investigation.report.title}"
    
class ContributionEvidence(models.Model):
    contribution = models.OneToOneField(Contribution, on_delete=models.CASCADE, related_name='evidences')
    file = models.FileField(upload_to='contribution_evidence/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Evidence for {self.contribution}"
    
class CaseReport(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE, related_name='case_reports')
    generated_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    pdf_file = models.FileField(upload_to='case_reports/', null=True, blank=True)

    def __str__(self):
        return f"Case report for {self.investigation.report.title}"
    
class Badge(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    icon = models.ImageField(upload_to='badge_icons/')

    def __str__(self):
        return self.name
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField()
    location = models.ForeignKey(Region, on_delete=models.SET_NULL, null=True, blank=True)
    badges = models.ManyToManyField(Badge, blank=True)
    reputation_score = models.IntegerField(default=0)

    def __str__(self):
        return f"{self.user.username}'s profile"
    
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        UserProfile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()