import os
import uuid

from flask import Blueprint, request, jsonify, current_app

from .middleware import require_auth

media_bp = Blueprint("media", __name__)


# ---------------------------------------------------------------------------
# Health and Readiness Endpoints
# ---------------------------------------------------------------------------

@media_bp.route("/health", methods=["GET"])
def health():
    return {"status": "alive"}, 200


@media_bp.route("/ready", methods=["GET"])
def ready():
    supabase = current_app.extensions.get("supabase_client")
    bucket = current_app.config["SUPABASE_BUCKET"]
    try:
        supabase.storage.from_(bucket).list()
        return {"status": "ready"}, 200
    except Exception:
        return {"status": "not ready"}, 503


# ---------------------------------------------------------------------------
# POST /  — upload a media file (auth required)
# ---------------------------------------------------------------------------
#
#   Request:  multipart/form-data  with a single "file" field
#   Response: { id, filename, content_type, size_bytes, url }
#   Constraints:
#     - Content-Type must be in Config.ALLOWED_CONTENT_TYPES
#     - Body must not exceed Config.MAX_UPLOAD_BYTES (50 MB)
#
# ---------------------------------------------------------------------------

@media_bp.route("/", methods=["POST"])
@require_auth
def upload():
    if "file" not in request.files:
        return jsonify({"error": "No file provided"}), 400

    file = request.files["file"]

    if not file.filename:
        return jsonify({"error": "Empty filename"}), 400

    content_type = file.content_type or "application/octet-stream"
    allowed = current_app.config["ALLOWED_CONTENT_TYPES"]

    if content_type not in allowed:
        return jsonify({"error": f"Unsupported content type: {content_type}"}), 415

    data = file.read()
    max_bytes = current_app.config["MAX_UPLOAD_BYTES"]

    if len(data) > max_bytes:
        return jsonify({"error": "File exceeds the 50 MB limit"}), 413

    supabase = current_app.extensions["supabase_client"]
    bucket = current_app.config["SUPABASE_BUCKET"]

    ext = os.path.splitext(file.filename)[1].lower()
    media_id = str(uuid.uuid4())
    storage_path = f"{media_id}{ext}"

    try:
        supabase.storage.from_(bucket).upload(
            storage_path,
            data,
            {"content-type": content_type, "upsert": "false"},
        )

        supabase.table("media").insert({
            "id": media_id,
            "user_id": str(request.user.id),
            "bucket": bucket,
            "path": storage_path,
            "filename": file.filename,
            "content_type": content_type,
            "size_bytes": len(data),
        }).execute()

        signed = supabase.storage.from_(bucket).create_signed_url(storage_path, 3600)
        url = signed.get("signedURL") or signed.get("signedUrl") or ""

        return jsonify({
            "id": media_id,
            "filename": file.filename,
            "content_type": content_type,
            "size_bytes": len(data),
            "url": url,
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ---------------------------------------------------------------------------
# GET /<id>  — retrieve media metadata + fresh signed URL
# ---------------------------------------------------------------------------

@media_bp.route("/<media_id>", methods=["GET"])
def get_media(media_id):
    supabase = current_app.extensions["supabase_client"]

    try:
        response = (
            supabase.table("media")
            .select("id, user_id, filename, content_type, size_bytes, path, bucket")
            .eq("id", media_id)
            .single()
            .execute()
        )

        if not response.data:
            return jsonify({"error": "Media not found"}), 404

        record = response.data
        signed = supabase.storage.from_(record["bucket"]).create_signed_url(
            record["path"], 3600
        )
        url = signed.get("signedURL") or signed.get("signedUrl") or ""

        return jsonify({
            "id": record["id"],
            "user_id": record["user_id"],
            "filename": record["filename"],
            "content_type": record["content_type"],
            "size_bytes": record["size_bytes"],
            "url": url,
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
