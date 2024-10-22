from rest_framework import serializers
from .models import CustomUser, Evidence, UserProfile, Region, Report, Investigation, InvestigationRole, Task, Contribution, ContributionEvidence, CaseReport, Badge, UserActivity, UserRole, Notification, Comment
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.models import User

class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['bio', 'location', 'reputation_score', 'privacy_settings']

class CustomUserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    confirm_password = serializers.CharField(write_only=True, required=True)
    profile = UserProfileSerializer(required=False)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'password', 'confirm_password', 'first_name', 'last_name', 'profile']
        extra_kwargs = {'password': {'write_only': True}}

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'password': 'Passwords do not match.'})
        if len(data['password']) < 8:
            raise serializers.ValidationError('Password must be at least 8 characters long.')
        
        try:
            validate_password(data['password'])
        except serializers.ValidationError as e:
            raise serializers.ValidationError({'password': e.messages})
        
        return data

    def create(self, validated_data):
        profile_data = validated_data.pop('profile', {})
        validated_data.pop('confirm_password')
        user = CustomUser.objects.create_user(**validated_data)
        UserProfile.objects.update_or_create(user=user, defaults=profile_data)
        return user
    
class UserRoleSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = UserRole
        fields = ['id', 'user', 'role']

class RegionSerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Region
        fields = ['id', 'name', 'region_type', 'parent', 'children']

    def get_children(self, obj):
        return RegionSerializer(obj.children.all(), many=True).data

class EvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evidence
        fields = ['id', 'file', 'uploaded_at']    

class CommentSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'user', 'content', 'created_at']
        read_only_fields = ['user', 'created_at']

class ReportSerializer(serializers.ModelSerializer):
    evidences = EvidenceSerializer(many=True, read_only=True)
    evidence_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )
    
    class Meta:
        model = Report
        fields = ['id', 'title', 'description', 'region', 'user', 'anonymous', 'status', 'created_at', 'updated_at', 'evidences', 'evidence_files']
        read_only_fields = ['user', 'status', 'created_at', 'updated_at']

    def create(self, validated_data):
        evidence_files = validated_data.pop('evidence_files', None)
        report = Report.objects.create(**validated_data)

        if evidence_files:
            for evidence_file in evidence_files:
                Evidence.objects.create(report=report, file=evidence_file)

        return report

class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'user', 'message', 'read', 'created_at']
        read_only_fields = ['user', 'created_at']

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class InvestigationRoleSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)

    class Meta:
        model = InvestigationRole
        fields = ['id', 'user', 'role']

class ContributionEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionEvidence
        fields = ['id', 'file', 'uploaded_at']

class ContributionSerializer(serializers.ModelSerializer):
    user = CustomUserSerializer(read_only=True)
    evidences = ContributionEvidenceSerializer(many=True, read_only=True)
    evidence_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Contribution
        fields = ['id', 'investigation', 'user', 'content', 'contribution_type', 'anonymous', 'created_at', 'verified', 'evidences', 'evidence_files', 'votes']
        read_only_fields = ['verified', 'votes', 'created_at']

    def get_user(self, obj):
        if obj.anonymous:
            return None
        return CustomUserSerializer(obj.user).data
    
    def create(self, validated_data):
        evidence_files = validated_data.pop('evidence_files', None)
        contribution = Contribution.objects.create(**validated_data)

        if evidence_files:
            for evidence_file in evidence_files:
                ContributionEvidence.objects.create(contribution=contribution, file=evidence_file)

        return contribution
    
class InvestigationSerializer(serializers.ModelSerializer):
    roles = InvestigationRoleSerializer(many=True, read_only=True) 
    tasks = TaskSerializer(many=True, read_only=True)
    contributions = ContributionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Investigation
        fields = ['id', 'report', 'status', 'created_at', 'updated_at', 'contributions', 'roles', 'tasks']
        read_only_fields = ['created_at', 'updated_at']

class CaseReportSerializer(serializers.ModelSerializer):
    class Meta:
        model = CaseReport
        fields = ['id', 'investigation', 'generated_by', 'created_at', 'updated_at', 'content', 'pdf_file', 'docx_file', 'status']
        read_only_fields = ['generated_by', 'created_at', 'updated_at', 'pdf_file', 'docx_file']

class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = ['id', 'name', 'description', 'icon']
    
class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'activity_type', 'timestamp', 'description']
        read_only_fields = ['timestamp', 'user']

class AdminUserSerializer(serializers.ModelSerializer):
    role = serializers.CharField(source='role.role', read_only=True)
    profile = UserProfileSerializer(read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'profile']
        read_only_fields = ['username', 'email', 'role', 'profile']

    def update(self, instance, validated_data):
        role_data = validated_data.pop('role', None)
        if role_data:
            role = instance.role
            role.role = role_data.get('role', role.role)
            role.save()
        return super().update(instance, validated_data)