import pytest
from app import create_app


@pytest.fixture
def app():
    flask_app = create_app()
    flask_app.config["TESTING"] = True
    flask_app.config["AUTH_SERVICE_URL"] = "http://auth-service"
    flask_app.config["REVIEW_SERVICE_URL"] = "http://review-service"
    flask_app.config["TRAIL_SERVICE_URL"] = "http://trail-service"
    flask_app.config["MEDIA_SERVICE_URL"] = "http://media-service"
    yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()
