from flask import Blueprint, request, jsonify, current_app
from .middleware import require_auth

review_bp = Blueprint("review", __name__)

