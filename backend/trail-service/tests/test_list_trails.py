from unittest.mock import MagicMock


class TestListTrails:
    def _mock_query_chain(self, mock_supabase, return_data):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.order.return_value.execute.return_value = MagicMock(data=return_data)
        return chain

    def test_list_trails_returns_all(self, client, mock_supabase, sample_trail):
        self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert len(data) == 1
        assert data[0]["name"] == "Test Trail"

    def test_list_trails_empty(self, client, mock_supabase):
        self._mock_query_chain(mock_supabase, [])
        response = client.get("/")
        assert response.status_code == 200
        assert response.get_json() == []

    def test_list_trails_filter_by_category(self, client, mock_supabase, sample_trail):
        self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/?category=mtb")
        assert response.status_code == 200
        mock_supabase.table.return_value.select.return_value.eq.assert_called_with("category", "mtb")

    def test_list_trails_filter_by_status(self, client, mock_supabase, sample_trail):
        self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/?status=open")
        assert response.status_code == 200
        mock_supabase.table.return_value.select.return_value.eq.assert_called_with("status", "open")

    def test_list_trails_invalid_enum_returns_400(self, client, mock_supabase):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.order.return_value.execute.side_effect = Exception(
            "invalid input value for enum"
        )
        response = client.get("/?category=invalid")
        assert response.status_code == 400
        assert response.get_json() == {"error": "Invalid filter value"}

    def test_list_trails_db_error_returns_500(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.order.return_value.execute.side_effect = Exception("db error")
        response = client.get("/")
        assert response.status_code == 500
