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
        supabase.auth.get_session()
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

@auth_bp.route("/user/<string:user_id>", methods=["GET"])
def get_user(user_id):
    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.auth.admin.get_user_by_id(user_id)

        if not response or not response.user:
            return jsonify({"error": "User not found"}), 404

        user_data = response.user

        return jsonify({
            "user_id": user_data.id,
            "email": user_data.email,
            "display_name": user_data.user_metadata.get("display_name", "")
        }), 200

    except Exception as e:
        return jsonify({"message": "Internal Server Error"}), 500

