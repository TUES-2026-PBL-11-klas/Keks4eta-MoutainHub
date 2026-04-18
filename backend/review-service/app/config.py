import os
from dotenv import load_dotenv

load_dotenv()  # loads root .env

class Config:
    # Core Flask
    SECRET_KEY = os.getenv("SECRET_KEY")
    DEBUG = os.getenv("FLASK_ENV") == "development"

    # Database
    SUPABASE_URL = os.getenv("SUPABASE_URL")
    SUPABASE_KEY = os.getenv("SUPABASE_KEY")

    # Internal services
    TRAIL_SERVICE_URL = os.getenv("TRAIL_SERVICE_URL")
