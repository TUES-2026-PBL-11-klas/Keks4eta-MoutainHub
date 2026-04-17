from flask import Flask
from app.routes import register_routes
from flask_cors import CORS


def create_app():
    app = Flask("api_gateway_service")
    app.config.from_object("app.config.Config")
    CORS(app, origin=app.config["CORS_ORIGIN"], supports_credentials=True)
    register_routes(app)

    return app
