from unittest.mock import MagicMock


class TestGetTrail:
    def test_get_trail_success(self, client, mock_supabase, sample_trail):
        (
            mock_supabase.table.return_value
            .select.return_value
            .eq.return_value
            .single.return_value
            .execute.return_value
        ) = MagicMock(data=sample_trail)

        response = client.get("/trail-uuid-1")
        assert response.status_code == 200
        assert response.get_json()["id"] == "trail-uuid-1"

    def test_get_trail_not_found(self, client, mock_supabase):
        (
            mock_supabase.table.return_value
            .select.return_value
            .eq.return_value
            .single.return_value
            .execute.return_value
        ) = MagicMock(data=None)

        response = client.get("/nonexistent-id")
        assert response.status_code == 404
        assert response.get_json() == {"error": "Trail not found"}

    def test_get_trail_db_error_returns_500(self, client, mock_supabase):
        (
            mock_supabase.table.return_value
            .select.return_value
            .eq.return_value
            .single.return_value
            .execute.side_effect
        ) = Exception("db error")

        response = client.get("/some-id")
        assert response.status_code == 500
