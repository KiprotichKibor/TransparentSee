from django.db import models
from django.contrib.auth.models import User

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
    report = models.ForeignKey(Report, on_delete=models.CASCADE)
    status = models.CharField(max_length=50, default='Open')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class Contribution(models.Model):
    investigation = models.ForeignKey(Investigation, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    content = models.TextField()
    anonymous = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)