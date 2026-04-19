from flask import Flask
from app.routes import register_routes
from flask_cors import CORS


def create_app():
    app = Flask("api_gateway_service")
    app.config.from_object("app.config.Config")
    CORS(app, origins=["http://localhost:8081", "http://localhost:3000", app.config["CORS_ORIGIN"]], supports_credentials=True)
    register_routes(app)

    return app
