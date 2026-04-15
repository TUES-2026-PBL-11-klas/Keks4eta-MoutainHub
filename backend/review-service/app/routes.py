from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth
from pytimeparse import parse
from datetime import datetime, timedelta, timezone


review_bp = Blueprint("review", __name__)

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


@review_bp.route("/", methods=["GET"])
def get_reviews():
    supabase = current_app.extensions.get("supabase_client")
    
    since = request.args.get("since")
    if since:
        try:
            seconds = parse(since)
            since_time = datetime.utcnow() - timedelta(seconds=seconds)
        except:
            return jsonify({"message": "Invalid 'since' parameter format"}), 400
    else:
        since_time = datetime.utcnow()- timedelta(days=365)  # Default to last year

    size = request.args.get("size", 10)

    page = request.args.get("page", 1)
    try :
        size = int(size)
        page = int(page)
    except:
        return jsonify({"message": "Invalid pagination parameters"}), 400   
    offset_start = (page - 1) * size
    offset_end = offset_start + size - 1

    try:
        response = supabase.table("reviews").select("*").gte("created_at",since_time).range(offset_start, offset_end).execute()
        return jsonify({"reviews": response.data}), 200
    except:
        return jsonify({"message": "Couldn't fetch reviews"}), 400
    
    
