from functools import wraps
from flask import request, jsonify, current_app

def require_auth(f):
    @wraps(f)
    def wrapper(*args, **kwargs):
        auth_header = request.headers.get("Authorization")

        supabase = current_app.extensions.get("supabase_client")

        if not auth_header:
            return jsonify({"error": "Missing token"}), 401

        try:
            token = auth_header.replace("Bearer ", "")

            res = supabase.auth.get_user(token)

            if not res or not res.user:
                return jsonify({"error": "Invalid token"}), 401

            request.user = res.user 

        except Exception:
            return jsonify({"error": "Unauthorized"}), 401

        return f(*args, **kwargs)

    return wrapper