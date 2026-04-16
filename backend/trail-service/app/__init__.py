from flask import Flask
from supabase import create_client, Client

def create_app():
    app = Flask("trail_service")
    app.config.from_object("app.config.Config")

    supabase_url = app.config.get("SUPABASE_URL")
    supabase_key = app.config.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY")
    
    supabase: Client = create_client(supabase_url, supabase_key)
    app.extensions["supabase_client"] = supabase
    print("Supabase client initialized")

    from .routes import trails_bp
    app.register_blueprint(trails_bp)

    return app
