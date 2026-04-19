from unittest.mock import MagicMock, patch


class TestGetReviewsByCategory:
    def _setup_db_chain(self, mock_supabase, data):
        chain = mock_supabase.table.return_value.select.return_value
        chain.in_.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.return_value = MagicMock(data=data)
        return chain

    def test_returns_reviews_for_category(self, client, mock_supabase, sample_review):
        trails = [{"id": "trail-uuid-1"}, {"id": "trail-uuid-2"}]
        self._setup_db_chain(mock_supabase, [sample_review])

        with patch("app.routes.requests.get") as mock_get:
            mock_get.return_value = MagicMock(status_code=200, json=lambda: trails)
            response = client.get("/category/mtb")

        assert response.status_code == 200
        assert "reviews" in response.get_json()

    def test_returns_empty_when_no_trails_in_category(self, client, mock_supabase):
        with patch("app.routes.requests.get") as mock_get:
            mock_get.return_value = MagicMock(status_code=200, json=lambda: [])
            response = client.get("/category/mtb")

        assert response.status_code == 200
        assert response.get_json() == {"reviews": []}

    def test_trail_service_error_returns_upstream_status(self, client, mock_supabase):
        with patch("app.routes.requests.get") as mock_get:
            mock_get.return_value = MagicMock(
                status_code=503,
                json=lambda: {"message": "unavailable"},
            )
            response = client.get("/category/mtb")

        assert response.status_code == 503

    def test_trail_service_unreachable_returns_502(self, client, mock_supabase):
        import requests as req
        with patch("app.routes.requests.get", side_effect=req.RequestException("timeout")):
            response = client.get("/category/mtb")

        assert response.status_code == 502

    def test_trail_service_url_not_configured_returns_500(self, client, app, mock_supabase):
        app.config["TRAIL_SERVICE_URL"] = None
        response = client.get("/category/mtb")
        assert response.status_code == 500

    def test_db_error_returns_400(self, client, mock_supabase):
        trails = [{"id": "trail-uuid-1"}]
        chain = mock_supabase.table.return_value.select.return_value
        chain.in_.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.side_effect = Exception("db error")

        with patch("app.routes.requests.get") as mock_get:
            mock_get.return_value = MagicMock(status_code=200, json=lambda: trails)
            response = client.get("/category/mtb")

        assert response.status_code == 400
