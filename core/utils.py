import re
from .models import Investigation, Contribution
from django.template.loader import render_to_string
from django.utils import timezone

def moderate_content(content):
    '''
    Basic moderation function to check for offensive words in content
    '''
    offensive_words = [
        'kuma',
        'matako',
        'kumamako',
        'mafi',
        'mafisi',
        'mavi',
        'dinywa',
        'jidinye',
        'pussy'
    ]
    
    for word in offensive_words:
        if re.search(r'\b' + word + r'\b', content, re.IGNORECASE):
            return False
    return True

def generate_case_report_content(investigation):
    '''
    Generate a case report content from an investigation
    '''
    report = investigation.report
    contributions = Contribution.objects.filter(investigation=investigation).order_by('created_at')

    context = {
        'report': report,
        'investigation': investigation,
        'contributions': contributions,
        'generated_at': timezone.now()
    }

    return render_to_string('core/case_report_template.html', context)