from unittest.mock import MagicMock


class TestHealth:
    def test_health_returns_alive(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "alive"}

    def test_ready_when_supabase_reachable(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.limit.return_value.execute.return_value = MagicMock()
        response = client.get("/ready")
        assert response.status_code == 200
        assert response.get_json() == {"status": "ready"}

    def test_ready_when_supabase_unreachable(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.limit.return_value.execute.side_effect = Exception("down")
        response = client.get("/ready")
        assert response.status_code == 503
        assert response.get_json() == {"status": "not ready"}
