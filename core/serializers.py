from rest_framework import serializers
from .models import Region, Report, Evidence, Investigation, Contribution, ContributionEvidence
from django.contrib.auth.models import User

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']

class RegionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Region
        fields = '__all__'

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

class ContributionEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContributionEvidence
        fields = ['id', 'file', 'uploaded_at']

class ContributionSerializer(serializers.ModelSerializer):
    user = serializers.SerializerMethodField()
    evidences = ContributionEvidenceSerializer(many=True, read_only=True)
    evidence_files = serializers.ListField(
        child=serializers.FileField(max_length=100000, allow_empty_file=False, use_url=False),
        write_only=True, required=False
    )

    class Meta:
        model = Contribution
        fields = ['id', 'investigation', 'user', 'content', 'contribution_type', 'anonymous', 'created_at', 'verified', 'evidences', 'evidence_files']
        read_only_fields = ['verified']

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
    contributions = ContributionSerializer(many=True, read_only=True)
    
    class Meta:
        model = Investigation
        fields = ['id', 'report', 'status', 'created_at', 'updated_at', 'contributions']
        read_only_fields = ['created_at', 'updated_at']