from unittest.mock import MagicMock


class TestRequireAuth:
    def test_missing_auth_header_returns_401(self, client):
        response = client.post("/logout")
        assert response.status_code == 401
        assert response.get_json() == {"error": "Missing token"}

    def test_invalid_token_returns_401(self, client, mock_supabase):
        mock_supabase.auth.get_user.return_value = MagicMock(user=None)
        response = client.post("/logout", headers={"Authorization": "Bearer bad-token"})
        assert response.status_code == 401
        assert response.get_json() == {"error": "Invalid token"}

    def test_supabase_auth_exception_returns_401(self, client, mock_supabase):
        mock_supabase.auth.get_user.side_effect = Exception("auth error")
        response = client.post("/logout", headers={"Authorization": "Bearer bad-token"})
        assert response.status_code == 401
        assert response.get_json() == {"error": "Unauthorized"}
