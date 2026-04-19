from unittest.mock import MagicMock


class TestLogout:
    def test_logout_success(self, client, mock_supabase):
        mock_user = MagicMock()
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)

        response = client.post("/logout", headers={"Authorization": "Bearer valid-token"})

        assert response.status_code == 200
        assert response.get_json() == {"message": "Logout successful"}

    def test_logout_without_token_returns_401(self, client):
        response = client.post("/logout")
        assert response.status_code == 401
