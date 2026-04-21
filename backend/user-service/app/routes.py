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

    try:
        response = current_app.extensions["supabase_client"].auth.sign_in_with_password({"email": email, "password": password})
    except Exception:
        return jsonify({"message": "Credentials incorrect"}), 401


    return jsonify({
        "message": "Login successful",
        "user_id": response.user.id,
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

    try:
        response = current_app.extensions["supabase_client"].auth.sign_up({"email": email, "password": password, "options": {"data": {"display_name": display_name}}})
    except Exception as e:
        err = str(e).lower()
        if "password" in err and any(k in err for k in ("short", "length", "characters", "weak", "least")):
            return jsonify({"message": "Password too short"}), 400
        if any(k in err for k in ("already", "registered", "exists", "taken")):
            return jsonify({"message": "Email already in use"}), 400
        return jsonify({"message": "Signup failed"}), 400

    return jsonify({
        "message": "Signup successful",
        "display_name": response.user.user_metadata.get("display_name", "")
    }), 201


@auth_bp.route("/google", methods=["POST"])
def google_login():
    data = request.json or {}
    id_token = data.get("id_token")
    nonce = data.get("nonce")

    if not id_token:
        return jsonify({"message": "Missing id_token"}), 400

    payload = {"provider": "google", "token": id_token}
    if nonce:
        payload["nonce"] = nonce

    try:
        response = current_app.extensions["supabase_client"].auth.sign_in_with_id_token(payload)
    except Exception as e:
        print(f"Google login error: {e}", flush=True)
        return jsonify({"message": "Google login failed", "detail": str(e)}), 401

    display_name = (
        response.user.user_metadata.get("full_name")
        or response.user.user_metadata.get("display_name")
        or response.user.user_metadata.get("name")
        or ""
    )

    return jsonify({
        "message": "Login successful",
        "user_id": response.user.id,
        "display_name": display_name,
        "refresh_token": response.session.refresh_token,
        "access_token": response.session.access_token,
    }), 200


@auth_bp.route("/logout", methods=["POST"])
@require_auth
def logout():
    return jsonify({"message": "Logout successful"}), 200

@auth_bp.route("/user/<string:user_id>", methods=["GET"])
def get_user(user_id):
    try:
        response = current_app.extensions["supabase_admin_client"].auth.admin.get_user_by_id(user_id)

        if not response or not response.user:
            return jsonify({"error": "User not found"}), 404

        user_data = response.user

        return jsonify({
            "user_id": user_data.id,
            "email": user_data.email,
            "display_name": user_data.user_metadata.get("display_name", "")
        }), 200

    except Exception:
        return jsonify({"message": "Internal Server Error"}), 500

