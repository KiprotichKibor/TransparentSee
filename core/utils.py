import re

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