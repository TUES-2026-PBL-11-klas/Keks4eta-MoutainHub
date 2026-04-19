import pytest
from unittest.mock import MagicMock, patch
from app import create_app


@pytest.fixture
def mock_supabase():
    return MagicMock()


@pytest.fixture
def app(mock_supabase):
    env = {"SUPABASE_URL": "http://fake-supabase", "SUPABASE_KEY": "fake-key"}
    with patch.dict("os.environ", env), patch("app.create_client", return_value=mock_supabase):
        flask_app = create_app()
        flask_app.config["TESTING"] = True
        flask_app.config["TRAIL_SERVICE_URL"] = "http://trail-service"
        flask_app.extensions["supabase_client"] = mock_supabase
        yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers(mock_supabase):
    mock_user = MagicMock()
    mock_user.id = "user-uuid-1"
    mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
    return {"Authorization": "Bearer valid-token"}, mock_user


@pytest.fixture
def sample_review():
    return {
        "id": "review-uuid-1",
        "created_at": "2026-04-19T10:00:00",
        "user_id": "user-uuid-1",
        "trail_id": "trail-uuid-1",
        "name": "Great Trail",
        "rating": 4,
        "description": "Really enjoyed it",
    }
