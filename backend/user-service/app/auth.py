from . import supabase
from flask import current_app

def verify_token(token):
    supabase = current_app.extensions.get("supabase_client")
    try:
        user = supabase.auth.get_user(token)
        return user
    except:
        return None
    
def refresh_token(refresh_token):
    supabase = current_app.extensions.get("supabase_client")
    try:
        response = supabase.auth.refresh_session(refresh_token)
        return response
    except:
        return None