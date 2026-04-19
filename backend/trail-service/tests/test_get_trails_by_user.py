from unittest.mock import MagicMock


class TestGetTrailsByUser:
    def _mock_query_chain(self, mock_supabase, return_data):
        chain = (
            mock_supabase.table.return_value
            .select.return_value
            .eq.return_value
        )
        chain.eq.return_value = chain
        chain.order.return_value.execute.return_value = MagicMock(data=return_data)
        return chain

    def test_get_trails_by_user_success(self, client, mock_supabase, sample_trail):
        self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/user/user-uuid-1")
        assert response.status_code == 200
        data = response.get_json()
        assert isinstance(data, list)
        assert data[0]["user_id"] == "user-uuid-1"

    def test_get_trails_by_user_empty(self, client, mock_supabase):
        self._mock_query_chain(mock_supabase, [])
        response = client.get("/user/user-uuid-1")
        assert response.status_code == 200
        assert response.get_json() == []

    def test_get_trails_by_user_filter_category(self, client, mock_supabase, sample_trail):
        chain = self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/user/user-uuid-1?category=mtb")
        assert response.status_code == 200
        chain.eq.assert_called_with("category", "mtb")

    def test_get_trails_by_user_filter_status(self, client, mock_supabase, sample_trail):
        chain = self._mock_query_chain(mock_supabase, [sample_trail])
        response = client.get("/user/user-uuid-1?status=open")
        assert response.status_code == 200
        chain.eq.assert_called_with("status", "open")

    def test_get_trails_by_user_invalid_enum_returns_400(self, client, mock_supabase):
        chain = self._mock_query_chain(mock_supabase, [])
        chain.order.return_value.execute.side_effect = Exception("invalid input value for enum status")
        response = client.get("/user/user-uuid-1?status=bad")
        assert response.status_code == 400
        assert response.get_json() == {"error": "Invalid filter value"}

    def test_get_trails_by_user_db_error_returns_500(self, client, mock_supabase):
        chain = self._mock_query_chain(mock_supabase, [])
        chain.order.return_value.execute.side_effect = Exception("db failure")
        response = client.get("/user/user-uuid-1")
        assert response.status_code == 500
