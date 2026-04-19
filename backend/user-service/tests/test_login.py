from unittest.mock import MagicMock


class TestLogin:
    def _mock_login_response(self, mock_supabase, mock_user):
        session = MagicMock()
        session.refresh_token = "refresh-tok"
        session.access_token = "access-tok"
        mock_supabase.auth.sign_in_with_password.return_value = MagicMock(user=mock_user, session=session)

    def test_login_success(self, client, mock_supabase, mock_user):
        self._mock_login_response(mock_supabase, mock_user)

        response = client.post("/login", json={"email": "test@example.com", "password": "secret"})

        assert response.status_code == 200
        body = response.get_json()
        assert body["message"] == "Login successful"
        assert body["user_id"] == mock_user.id
        assert body["access_token"] == "access-tok"
        assert body["refresh_token"] == "refresh-tok"
        assert body["display_name"] == "Test User"

    def test_login_invalid_credentials_returns_401(self, client, mock_supabase):
        mock_supabase.auth.sign_in_with_password.side_effect = Exception("Invalid login credentials")

        response = client.post("/login", json={"email": "bad@example.com", "password": "wrong"})

        assert response.status_code == 401
        assert response.get_json()["message"] == "Credentials incorrect"

    def test_login_calls_supabase_with_credentials(self, client, mock_supabase, mock_user):
        self._mock_login_response(mock_supabase, mock_user)

        client.post("/login", json={"email": "test@example.com", "password": "secret"})

        mock_supabase.auth.sign_in_with_password.assert_called_once_with(
            {"email": "test@example.com", "password": "secret"}
        )
