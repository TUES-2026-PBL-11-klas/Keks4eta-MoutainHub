from unittest.mock import MagicMock


class TestGetUser:
    def test_get_user_success(self, client, mock_admin_supabase, mock_user):
        mock_admin_supabase.auth.admin.get_user_by_id.return_value = MagicMock(user=mock_user)

        response = client.get("/user/user-uuid-1")

        assert response.status_code == 200
        body = response.get_json()
        assert body["user_id"] == mock_user.id
        assert body["email"] == mock_user.email
        assert body["display_name"] == "Test User"

    def test_get_user_not_found_returns_404(self, client, mock_admin_supabase):
        mock_admin_supabase.auth.admin.get_user_by_id.return_value = MagicMock(user=None)

        response = client.get("/user/nonexistent-id")

        assert response.status_code == 404
        assert response.get_json() == {"error": "User not found"}

    def test_get_user_supabase_exception_returns_500(self, client, mock_admin_supabase):
        mock_admin_supabase.auth.admin.get_user_by_id.side_effect = Exception("admin error")

        response = client.get("/user/user-uuid-1")

        assert response.status_code == 500

    def test_get_user_calls_admin_client(self, client, mock_admin_supabase, mock_user):
        mock_admin_supabase.auth.admin.get_user_by_id.return_value = MagicMock(user=mock_user)

        client.get("/user/user-uuid-1")

        mock_admin_supabase.auth.admin.get_user_by_id.assert_called_once_with("user-uuid-1")
