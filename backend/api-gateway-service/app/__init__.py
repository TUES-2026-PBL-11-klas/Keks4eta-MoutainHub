from flask import Flask
from app.routes import register_routes
from flask_cors import CORS


def create_app():
    app = Flask("api_gateway_service")
    app.config.from_object("app.config.Config")
    cors_origins = [o.strip() for o in app.config["CORS_ORIGIN"].split(",")]
    CORS(app, origins=cors_origins, supports_credentials=True)
    register_routes(app)

    return app
