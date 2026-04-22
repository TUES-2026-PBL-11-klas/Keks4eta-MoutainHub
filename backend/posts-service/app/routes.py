from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth

posts_bp = Blueprint("posts", __name__)


def _supabase():
    return current_app.extensions["supabase_client"]


def _enrich_post(post: dict) -> dict:
    """Attach comment count to a post row."""
    try:
        count_res = (
            _supabase()
            .table("comments")
            .select("id", count="exact")
            .eq("post_id", post["id"])
            .execute()
        )
        post["comment_count"] = count_res.count or 0
    except Exception:
        post["comment_count"] = 0
    return post


# ---------------------------------------------------------------------------
# Health
# ---------------------------------------------------------------------------

@posts_bp.route("/health", methods=["GET"])
def health():
    return {"status": "alive"}, 200


# ---------------------------------------------------------------------------
# Posts
# ---------------------------------------------------------------------------

@posts_bp.route("/", methods=["POST"])
@require_auth
def create_post():
    data = request.json or {}
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"message": "content is required"}), 400

    row = {
        "user_id": str(request.user.id),
        "content": content,
    }
    if data.get("image_media_id"):
        row["image_media_id"] = data["image_media_id"]
    if data.get("trail_id"):
        row["trail_id"] = data["trail_id"]

    try:
        res = _supabase().table("posts").insert(row).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        return jsonify({"message": "Failed to create post", "detail": str(e)}), 500


@posts_bp.route("/", methods=["GET"])
def get_feed():
    page = max(int(request.args.get("page", 1)), 1)
    size = min(int(request.args.get("size", 20)), 100)
    offset = (page - 1) * size

    try:
        res = (
            _supabase()
            .table("posts")
            .select("*")
            .order("created_at", desc=True)
            .range(offset, offset + size - 1)
            .execute()
        )
        posts = [_enrich_post(p) for p in (res.data or [])]
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch posts", "detail": str(e)}), 500


@posts_bp.route("/user/<string:user_id>", methods=["GET"])
def get_user_posts(user_id):
    page = max(int(request.args.get("page", 1)), 1)
    size = min(int(request.args.get("size", 20)), 100)
    offset = (page - 1) * size

    try:
        res = (
            _supabase()
            .table("posts")
            .select("*")
            .eq("user_id", user_id)
            .order("created_at", desc=True)
            .range(offset, offset + size - 1)
            .execute()
        )
        posts = [_enrich_post(p) for p in (res.data or [])]
        return jsonify(posts), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch posts", "detail": str(e)}), 500


@posts_bp.route("/<string:post_id>", methods=["GET"])
def get_post(post_id):
    try:
        res = _supabase().table("posts").select("*").eq("id", post_id).single().execute()
        if not res.data:
            return jsonify({"message": "Post not found"}), 404
        return jsonify(_enrich_post(res.data)), 200
    except Exception as e:
        return jsonify({"message": "Not found", "detail": str(e)}), 404


@posts_bp.route("/<string:post_id>", methods=["DELETE"])
@require_auth
def delete_post(post_id):
    try:
        res = _supabase().table("posts").select("user_id").eq("id", post_id).single().execute()
        if not res.data:
            return jsonify({"message": "Post not found"}), 404
        if res.data["user_id"] != str(request.user.id):
            return jsonify({"message": "Forbidden"}), 403
        _supabase().table("posts").delete().eq("id", post_id).execute()
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete post", "detail": str(e)}), 500


# ---------------------------------------------------------------------------
# Comments
# ---------------------------------------------------------------------------

@posts_bp.route("/<string:post_id>/comments", methods=["POST"])
@require_auth
def create_comment(post_id):
    data = request.json or {}
    content = data.get("content", "").strip()
    if not content:
        return jsonify({"message": "content is required"}), 400

    row = {
        "post_id": post_id,
        "user_id": str(request.user.id),
        "content": content,
    }
    if data.get("parent_comment_id"):
        row["parent_comment_id"] = data["parent_comment_id"]

    try:
        res = _supabase().table("comments").insert(row).execute()
        return jsonify(res.data[0]), 201
    except Exception as e:
        return jsonify({"message": "Failed to create comment", "detail": str(e)}), 500


@posts_bp.route("/<string:post_id>/comments", methods=["GET"])
def get_comments(post_id):
    try:
        res = (
            _supabase()
            .table("comments")
            .select("*")
            .eq("post_id", post_id)
            .order("created_at", desc=False)
            .execute()
        )
        return jsonify(res.data or []), 200
    except Exception as e:
        return jsonify({"message": "Failed to fetch comments", "detail": str(e)}), 500


@posts_bp.route("/comments/<string:comment_id>", methods=["DELETE"])
@require_auth
def delete_comment(comment_id):
    try:
        res = _supabase().table("comments").select("user_id").eq("id", comment_id).single().execute()
        if not res.data:
            return jsonify({"message": "Comment not found"}), 404
        if res.data["user_id"] != str(request.user.id):
            return jsonify({"message": "Forbidden"}), 403
        _supabase().table("comments").delete().eq("id", comment_id).execute()
        return jsonify({"message": "Deleted"}), 200
    except Exception as e:
        return jsonify({"message": "Failed to delete comment", "detail": str(e)}), 500
