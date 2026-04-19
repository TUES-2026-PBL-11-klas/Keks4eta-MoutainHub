import pytest
from unittest.mock import MagicMock, patch
from app import create_app


@pytest.fixture
def mock_supabase():
    return MagicMock()


@pytest.fixture
def app(mock_supabase):
    with patch("app.create_client", return_value=mock_supabase):
        flask_app = create_app()
        flask_app.config["TESTING"] = True
        flask_app.extensions["supabase_client"] = mock_supabase
        yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers():
    return {"Authorization": "Bearer valid-test-token"}


@pytest.fixture
def sample_trail():
    return {
        "id": "trail-uuid-1",
        "created_at": "2026-04-19T10:00:00",
        "user_id": "user-uuid-1",
        "category": "mtb",
        "difficulty": 3,
        "name": "Test Trail",
        "description": "A test trail",
        "distance_km": 12.4,
        "elevation_gain_m": 540,
        "status": "open",
        "route": {
            "type": "LineString",
            "coordinates": [[23.1, 42.1, 1200], [23.2, 42.2, 1300]],
        },
    }


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "user-uuid-1"
    return user
