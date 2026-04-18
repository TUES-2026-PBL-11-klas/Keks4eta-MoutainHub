from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth
from pytimeparse import parse
from datetime import datetime, timedelta
import requests


review_bp = Blueprint("review", __name__)

@review_bp.route("/health", methods=["GET"])
def health():
    return {"status": "alive"}, 200

@review_bp.route("/ready", methods=["GET"])
def ready():
    # Check if we can connect to the database
    supabase = current_app.extensions.get("supabase_client")
    try:
        supabase.table("reviews").select("*").limit(1).execute()
        return {"status": "ready"}, 200
    except:
        return {"status": "not ready"}, 503

@review_bp.route("/", methods=["POST"])
@require_auth
def add_review():
    supabase = current_app.extensions.get("supabase_client")
    
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400
    
    
    user_id = request.user.id
    trail_id = data["trail_id"]
    name = data["name"]
    rating = data["rating"]
    description = data.get("description", "")
    
    # Validate rating (assuming 1-5)
    if not isinstance(rating, (int, float)) or not (1 <= rating <= 5):
        return jsonify({"error": "Rating must be a number between 1 and 5"}), 400
    
    try:
        response = supabase.table("reviews").insert({
            "user_id": user_id,
            "trail_id": trail_id,
            "name": name,
            "rating": rating,
            "description": description
        }).execute()
        
        return jsonify({"message": "Review added successfully", "review": response.data[0]}), 201
    except :
        return jsonify({"message": "Review couldn't be uploaded"}), 400

def calculate_range(since, size, page):
    supabase = current_app.extensions.get("supabase_client")

    if since:
        try:
            seconds = parse(since)
            since_time = datetime.utcnow() - timedelta(seconds=seconds)
        except:
            return jsonify({"message": "Invalid 'since' parameter format"}), 400
    else:
        since_time = datetime.utcnow() - timedelta(days=365)  # Default to last year

    try :
        size = int(size)
        page = int(page)
    except:
        return jsonify({"message": "Invalid pagination parameters"}), 400   
    offset_start = (page - 1) * size
    offset_end = offset_start + size - 1

    return since_time, offset_start, offset_end


@review_bp.route("/", methods=["GET"])
def get_reviews():
    
    since = request.args.get("since")
    size = request.args.get("size", 10)
    page = request.args.get("page", 1)
    since_time, offset_start, offset_end = calculate_range(since, size, page)

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.table("reviews").select("*").gte("created_at",since_time).range(offset_start, offset_end).execute()
        return jsonify({"reviews": response.data}), 200
    except:
        return jsonify({"message": "Couldn't fetch reviews"}), 400
    

@review_bp.route("/trail/<string:trail_id>", methods=["GET"])
def get_reviews_by_trail(trail_id):
    since = request.args.get("since")
    size = request.args.get("size", 10)
    page = request.args.get("page", 1)
    since_time, offset_start, offset_end = calculate_range(since, size, page)

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.table("reviews").select("*").eq("trail_id", trail_id).gte("created_at",since_time).range(offset_start, offset_end).execute()
        return jsonify({"reviews": response.data}), 200
    except:
        return jsonify({"message": "Couldn't fetch reviews"}), 400

@review_bp.route("/user/<string:user_id>", methods=["GET"])
def get_reviews_by_user(user_id):
    since = request.args.get("since")
    size = request.args.get("size", 10)
    page = request.args.get("page", 1)
    since_time, offset_start, offset_end = calculate_range(since, size, page)

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = supabase.table("reviews").select("*").eq("user_id", user_id).gte("created_at",since_time).range(offset_start, offset_end).execute()
        return jsonify({"reviews": response.data}), 200
    except:
        return jsonify({"message": "Couldn't fetch reviews"}), 400


@review_bp.route("/category/<string:category>", methods=["GET"])
def get_reviews_by_category(category):
    trail_url = current_app.config.get("TRAIL_SERVICE_URL")
    if not trail_url:
        return jsonify({"message": "Trail service URL not configured"}), 500

    try:
        trail_response = requests.get(f"{trail_url}", params={"category": category}, timeout=5)
        if trail_response.status_code != 200:
            return jsonify(trail_response.json()), trail_response.status_code
        trails = trail_response.json()
    except requests.RequestException:
        return jsonify({"message": "Could not reach trail service"}), 502

    trail_ids = [t["id"] for t in trails]
    if not trail_ids:
        return jsonify({"reviews": []}), 200

    since = request.args.get("since")
    size = request.args.get("size", 10)
    page = request.args.get("page", 1)
    since_time, offset_start, offset_end = calculate_range(since, size, page)

    supabase = current_app.extensions.get("supabase_client")

    try:
        response = (
            supabase.table("reviews")
            .select("*")
            .in_("trail_id", trail_ids)
            .gte("created_at", since_time)
            .range(offset_start, offset_end)
            .execute()
        )
        return jsonify({"reviews": response.data}), 200
    except:
        return jsonify({"message": "Couldn't fetch reviews"}), 400