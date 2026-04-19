from unittest.mock import MagicMock


class TestRequireAuth:
    def test_missing_auth_header_returns_401(self, client):
        response = client.post("/", json={"category": "mtb", "name": "T", "route": {}})
        assert response.status_code == 401
        assert response.get_json() == {"error": "Missing token"}

    def test_invalid_token_returns_401(self, client, mock_supabase):
        mock_supabase.auth.get_user.return_value = MagicMock(user=None)
        response = client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {}},
            headers={"Authorization": "Bearer bad-token"},
        )
        assert response.status_code == 401
        assert response.get_json() == {"error": "Invalid token"}

    def test_supabase_auth_exception_returns_401(self, client, mock_supabase):
        mock_supabase.auth.get_user.side_effect = Exception("auth error")
        response = client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {}},
            headers={"Authorization": "Bearer bad-token"},
        )
        assert response.status_code == 401
        assert response.get_json() == {"error": "Unauthorized"}

    def test_valid_token_passes_through(self, client, mock_supabase, mock_user, sample_trail):
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_trail])
        response = client.post(
            "/",
            json={"category": "mtb", "name": "Trail", "route": {"type": "LineString", "coordinates": []}},
            headers={"Authorization": "Bearer valid-token"},
        )
        assert response.status_code == 201
