from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth

trails_bp = Blueprint("trails", __name__)

# ---------------------------------------------------------------------------
# Health and Readiness Endpoints
# ---------------------------------------------------------------------------

@trails_bp.route("/health", methods=["GET"])
def health():
    return {"status": "alive"}, 200

@trails_bp.route("/ready", methods=["GET"])
def ready():
    # Check if we can connect to the database
    supabase = current_app.extensions.get("supabase_client")
    try:
        supabase.table("trails").select("*").limit(1).execute()
        return {"status": "ready"}, 200
    except:
        return {"status": "not ready"}, 503

# ---------------------------------------------------------------------------
# POST /  — create a new trail (auth required)
# ---------------------------------------------------------------------------

@trails_bp.route("/", methods=["POST"])
@require_auth
def create_trail():

#    Expects JSON body:
#    {
#        "category": "mtb",
#        "difficulty": 3,
#        "name": "My Trail",
#        "description": "...",
#        "distance_km": 12.4,
#        "elevation_gain_m": 540,
#        "status": "open",
#        "route": {
#            "type": "LineString",
#            "coordinates": [[lng, lat, alt], ...]
#        }
#    }
#    user_id is taken from the auth token

    supabase = current_app.extensions.get("supabase_client")
    data = request.get_json(silent=True)

    if not data:
        return jsonify({"error": "JSON body required"}), 400

    required = ["category", "name", "route"]
    missing = [f for f in required if not data.get(f)]
    if missing:
        return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400


    try:
        payload = {
            "user_id": request.user.id,
            "category": data["category"],
            "difficulty": data.get("difficulty"),
            "name": data["name"],
            "description": data.get("description"),
            "distance_km": data.get("distance_km"),
            "elevation_gain_m": data.get("elevation_gain_m"),
            "status": data.get("status", "open"),
            "route": data["route"],
        }

        response = supabase.table("trails").insert(payload).execute()

        if not response.data:
            return jsonify({"error": "Insert failed"}), 500

        return jsonify(response.data[0]), 201

    except Exception as e:
        if "invalid input value for enum" in str(e).lower():
            return jsonify({"error": "Invalid field value"}), 400
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /  — list all trails
#    Optional query params:
#      ?category=mtb
#      ?status=open
# ---------------------------------------------------------------------------

@trails_bp.route("/", methods=["GET"])
def list_trails():
    supabase = current_app.extensions.get("supabase_client")

    try:
        query = supabase.table("trails").select(
            "id, created_at, user_id, category, difficulty, name, "
            "description, distance_km, elevation_gain_m, status, route"
        )

        if category := request.args.get("category"):
            query = query.eq("category", category)

        if status := request.args.get("status"):
            query = query.eq("status", status)

        response = query.order("created_at", desc=True).execute()
        return jsonify(response.data), 200

    except Exception as e:
        if "invalid input value for enum" in str(e).lower():
            return jsonify({"error": "Invalid filter value"}), 400
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /<trail_id>  — single trail by PK
# ---------------------------------------------------------------------------

@trails_bp.route("/<trail_id>", methods=["GET"])
def get_trail(trail_id):
    supabase = current_app.extensions.get("supabase_client")

    try:
        response = (
            supabase.table("trails")
            .select(
                "id, created_at, user_id, category, difficulty, name, "
                "description, distance_km, elevation_gain_m, status, route"
            )
            .eq("id", trail_id)
            .single()
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Trail not found"}), 404

        return jsonify(response.data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /user/<user_id>  — all trails for a user
#    Optional query params:
#      ?category=mtb
#      ?status=open
# ---------------------------------------------------------------------------

@trails_bp.route("/user/<user_id>", methods=["GET"])
def get_trails_by_user(user_id):
    supabase = current_app.extensions.get("supabase_client")

    try:
        query = (
            supabase.table("trails")
            .select(
                "id, created_at, user_id, category, difficulty, name, "
                "description, distance_km, elevation_gain_m, status, route"
            )
            .eq("user_id", user_id)
        )

        if category := request.args.get("category"):
            query = query.eq("category", category)

        if status := request.args.get("status"):
            query = query.eq("status", status)

        response = query.order("created_at", desc=True).execute()
        return jsonify(response.data), 200

    except Exception as e:
        if "invalid input value for enum" in str(e).lower():
            return jsonify({"error": "Invalid filter value"}), 400
        return jsonify({"error": str(e)}), 500