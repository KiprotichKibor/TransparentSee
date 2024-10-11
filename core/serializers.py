from rest_framework import serializers
from .models import Region, Report, Evidence, Investigation, InvestigationRole, Task, Contribution, ContributionEvidence, CaseReport, UserProfile, Badge, UserActivity
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

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
        anonymous = validated_data.pop('anonymous', False)

        if anonymous:
            validated_data['user'] = None
        elif not validated_data.get('user'):
            validated_data['user'] = self.context['request'].user

        report = Report.objects.create(**validated_data)

        if evidence_files:
            for evidence_file in evidence_files:
                Evidence.objects.create(report=report, file=evidence_file)

        return report
    
class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = '__all__'

class InvestigationRoleSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = InvestigationRole
        fields = ['id', 'user', 'role']

class ContributionEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionEvidence
        fields = ['id', 'file', 'uploaded_at']

class ContributionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
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
        return UserSerializer(obj.user).data
    
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

class UserProfileSerializer(serializers.ModelSerializer):
    badges = BadgeSerializer(many=True, read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)

    class Meta:
        model = UserProfile
        fields = ['id', 'badges', 'reputation_score', 'bio', 'location', 'username', 'email', 'privacy_settings']
        read_only_fields = ['reputation_score']

class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']
        read_only_fields = ['profile']

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', {})
        profile = instance.profile

        instance.email = validated_data.get('email', instance.email)
        instance.username = validated_data.get('username', instance.username)
        instance.save()

        profile.bio = profile_data.get('bio', profile.bio)
        profile.location = profile_data.get('location', profile.location)
        profile.save()

        return instance
    
class UserActivitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserActivity
        fields = ['id', 'user', 'activity_type', 'timestamp', 'description']
        read_only_fields = ['timestamp', 'user']