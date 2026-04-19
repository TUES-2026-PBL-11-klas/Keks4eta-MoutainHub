import os
import pytest
from unittest.mock import MagicMock, patch


@pytest.fixture
def mock_supabase():
    return MagicMock()


@pytest.fixture
def app(mock_supabase):
    env = {
        "SUPABASE_URL": "http://test.supabase.co",
        "SUPABASE_KEY": "test-key",
        "SUPABASE_BUCKET": "test-bucket",
    }
    with patch.dict(os.environ, env):
        with patch("app.create_client", return_value=mock_supabase):
            from app import create_app
            flask_app = create_app()
            flask_app.config["TESTING"] = True
            flask_app.config["SUPABASE_BUCKET"] = "test-bucket"
            flask_app.extensions["supabase_client"] = mock_supabase
            yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "user-uuid-1"
    return user


@pytest.fixture
def auth_headers(mock_supabase, mock_user):
    mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
    return {"Authorization": "Bearer valid-test-token"}


@pytest.fixture
def sample_media():
    return {
        "id": "media-uuid-1",
        "user_id": "user-uuid-1",
        "filename": "photo.jpg",
        "content_type": "image/jpeg",
        "size_bytes": 1024,
        "path": "media-uuid-1.jpg",
        "bucket": "test-bucket",
    }
