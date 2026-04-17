from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/health", methods=["GET"])
def health():
    return {"status": "alive"}, 200

@auth_bp.route("/ready", methods=["GET"])
def ready():
    # Check if we can connect to the database
    supabase = current_app.extensions.get("supabase_client")
    try:
        supabase.table("users").select("*").limit(1).execute()
        return {"status": "ready"}, 200
    except:
        return {"status": "not ready"}, 503

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.json
    email = data.get("email")
    password = data.get("password")

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.sign_in_with_password({"email": email, "password": password})
    except:
        return jsonify({"message": "Login failed"}), 400


    return jsonify({
        "message": "Login successful",
        "display_name": response.user.user_metadata.get("display_name", ""),
        "refresh_token": response.session.refresh_token,
        "access_token": response.session.access_token
    }), 200

     
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    password = data.get("password")
    display_name = data.get("display_name", "")

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.sign_up({"email": email, "password": password, "options": {"data": {"display_name": display_name}}})
    except:
        return jsonify({"message": "Signup failed"}), 400
    
    return jsonify({
        "message": "Signup successful",
        "display_name": response.user.user_metadata.get("display_name", "")
    }), 201


# Logout endpoint - since Supabase doesn't have a server-side logout, we just return success and let the client delete tokens
@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    data = request.json
    access_token = data.get("access_token")

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.sign_out()
    except:
        return jsonify({"message": "Logout failed"}), 400
    return jsonify({"message": "Logout successful"}), 200
