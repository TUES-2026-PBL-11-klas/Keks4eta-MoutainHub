from unittest.mock import MagicMock


class TestHealth:
    def test_health_returns_alive(self, client):
        response = client.get("/health")
        assert response.status_code == 200
        assert response.get_json() == {"status": "alive"}

    def test_ready_when_supabase_reachable(self, client, mock_supabase):
        mock_supabase.storage.from_.return_value.list.return_value = []
        response = client.get("/ready")
        assert response.status_code == 200
        assert response.get_json() == {"status": "ready"}

    def test_ready_when_supabase_unreachable(self, client, mock_supabase):
        mock_supabase.storage.from_.return_value.list.side_effect = Exception("connection refused")
        response = client.get("/ready")
        assert response.status_code == 503
        assert response.get_json() == {"status": "not ready"}
