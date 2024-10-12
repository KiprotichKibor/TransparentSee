# Generated by Django 5.1.1 on 2024-10-11 16:28

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_casereport_docx_file_casereport_status_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='region',
            name='region_type',
            field=models.CharField(choices=[('country', 'Country'), ('county', 'County'), ('subcounty', 'Sub-County'), ('ward', 'Ward')], default='country', max_length=50),
        ),
        migrations.AlterField(
            model_name='region',
            name='parent',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='children', to='core.region'),
        ),
        migrations.AlterUniqueTogether(
            name='region',
            unique_together={('name', 'region_type', 'parent')},
        ),
    ]