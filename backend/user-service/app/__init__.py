from flask import Flask
from supabase import create_client

def create_app():
    app = Flask("user_service")
    app.config.from_object("app.config.Config")

    supabase_url = app.config.get("SUPABASE_URL")
    supabase_key = app.config.get("SUPABASE_KEY")

    if not supabase_url or not supabase_key:
        raise RuntimeError("Missing SUPABASE_URL or SUPABASE_KEY")

    app.extensions["supabase_client"] = create_client(supabase_url, supabase_key)
    app.extensions["supabase_admin_client"] = create_client(supabase_url, supabase_key)
    print("Supabase clients initialized")

    from .routes import auth_bp
    app.register_blueprint(auth_bp)


    return app
