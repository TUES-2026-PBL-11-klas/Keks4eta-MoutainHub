import pytest
from unittest.mock import MagicMock, patch
from app import create_app


@pytest.fixture
def mock_supabase():
    return MagicMock()


@pytest.fixture
def mock_admin_supabase():
    return MagicMock()


@pytest.fixture
def app(mock_supabase, mock_admin_supabase):
    env = {"SUPABASE_URL": "http://fake-supabase", "SUPABASE_KEY": "fake-key"}
    with patch.dict("os.environ", env), patch("app.create_client", side_effect=[mock_supabase, mock_admin_supabase]):
        flask_app = create_app()
        flask_app.config["TESTING"] = True
        flask_app.extensions["supabase_client"] = mock_supabase
        flask_app.extensions["supabase_admin_client"] = mock_admin_supabase
        yield flask_app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def mock_user():
    user = MagicMock()
    user.id = "user-uuid-1"
    user.email = "test@example.com"
    user.user_metadata = {"display_name": "Test User"}
    return user
