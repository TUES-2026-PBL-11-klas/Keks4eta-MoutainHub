from unittest.mock import MagicMock


def _setup_chain(mock_supabase, data):
    chain = mock_supabase.table.return_value.select.return_value
    chain.gte.return_value = chain
    chain.range.return_value.execute.return_value = MagicMock(data=data)
    return chain


class TestGetReviews:
    def test_get_reviews_returns_list(self, client, mock_supabase, sample_review):
        _setup_chain(mock_supabase, [sample_review])
        response = client.get("/")
        assert response.status_code == 200
        body = response.get_json()
        assert "reviews" in body
        assert len(body["reviews"]) == 1

    def test_get_reviews_empty(self, client, mock_supabase):
        _setup_chain(mock_supabase, [])
        response = client.get("/")
        assert response.status_code == 200
        assert response.get_json() == {"reviews": []}

    def test_get_reviews_db_error_returns_400(self, client, mock_supabase):
        chain = mock_supabase.table.return_value.select.return_value
        chain.gte.return_value = chain
        chain.range.return_value.execute.side_effect = Exception("db error")
        response = client.get("/")
        assert response.status_code == 400

    def test_get_reviews_default_pagination(self, client, mock_supabase, sample_review):
        chain = _setup_chain(mock_supabase, [sample_review])
        client.get("/")
        chain.range.assert_called_once_with(0, 9)  # page=1, size=10 → offset 0..9


class TestGetReviewsByTrail:
    def test_get_reviews_by_trail_success(self, client, mock_supabase, sample_review):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.return_value = MagicMock(data=[sample_review])

        response = client.get("/trail/trail-uuid-1")
        assert response.status_code == 200
        assert len(response.get_json()["reviews"]) == 1

    def test_get_reviews_by_trail_filters_by_trail_id(self, client, mock_supabase, sample_review):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.return_value = MagicMock(data=[sample_review])

        client.get("/trail/trail-uuid-1")
        chain.eq.assert_called_with("trail_id", "trail-uuid-1")

    def test_get_reviews_by_trail_db_error_returns_400(self, client, mock_supabase):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.side_effect = Exception("db error")

        response = client.get("/trail/trail-uuid-1")
        assert response.status_code == 400


class TestGetReviewsByUser:
    def test_get_reviews_by_user_success(self, client, mock_supabase, sample_review):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.return_value = MagicMock(data=[sample_review])

        response = client.get("/user/user-uuid-1")
        assert response.status_code == 200
        assert len(response.get_json()["reviews"]) == 1

    def test_get_reviews_by_user_filters_by_user_id(self, client, mock_supabase, sample_review):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.return_value = MagicMock(data=[sample_review])

        client.get("/user/user-uuid-1")
        chain.eq.assert_called_with("user_id", "user-uuid-1")

    def test_get_reviews_by_user_db_error_returns_400(self, client, mock_supabase):
        chain = mock_supabase.table.return_value.select.return_value
        chain.eq.return_value = chain
        chain.gte.return_value = chain
        chain.range.return_value.execute.side_effect = Exception("db error")

        response = client.get("/user/user-uuid-1")
        assert response.status_code == 400
