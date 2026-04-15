from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth

review_bp = Blueprint("review", __name__)

# create table public.reviews (
#   id uuid not null default gen_random_uuid (),
#   created_at timestamp with time zone not null default now(),
#   user_id uuid null,
#   trail_id uuid not null,
#   name text not null,
#   rating numeric not null,
#   description text null,
#   constraint reviews_pkey primary key (id),
#   constraint reviews_trail_id_fkey foreign KEY (trail_id) references trails (id) on update CASCADE on delete CASCADE,
#   constraint reviews_user_id_fkey foreign KEY (user_id) references auth.users (id) on update CASCADE on delete CASCADE
# ) TABLESPACE pg_default;

@review_bp.route("/reviews", methods=["POST"])
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


