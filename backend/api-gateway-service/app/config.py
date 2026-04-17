import os
from dotenv import load_dotenv

load_dotenv()  # loads root .env


class Config:
    AUTH_SERVICE_URL = os.getenv("AUTH_SERVICE_URL", "http://auth-service:5000")
    REVIEW_SERVICE_URL = os.getenv("REVIEW_SERVICE_URL", "http://review-service:5000")
    TRAIL_SERVICE_URL = os.getenv("TRAIL_SERVICE_URL", "http://trail-service:5000")
    MEDIA_SERVICE_URL = os.getenv("MEDIA_SERVICE_URL", "http://media-service:5000")
    CORS_ORIGIN = os.getenv("CORS_ORIGIN", "http://localhost:80")

