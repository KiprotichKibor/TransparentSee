# Generated by Django 5.1.1 on 2024-10-20 20:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0003_comment_notification_userrole'),
    ]

    operations = [
        migrations.AlterField(
            model_name='report',
            name='region',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='reports', to='core.region'),
        ),
        migrations.AlterField(
            model_name='userprofile',
            name='user',
            field=models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='profile', to=settings.AUTH_USER_MODEL),
        ),
    ]
