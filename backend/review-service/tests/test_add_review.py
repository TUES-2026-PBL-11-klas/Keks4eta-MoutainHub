from unittest.mock import MagicMock


class TestAddReview:
    def _setup_auth(self, mock_supabase):
        mock_user = MagicMock()
        mock_user.id = "user-uuid-1"
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        return {"Authorization": "Bearer valid-token"}, mock_user

    def test_add_review_success(self, client, mock_supabase, sample_review):
        headers, _ = self._setup_auth(mock_supabase)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_review])

        response = client.post(
            "/",
            json={"trail_id": "trail-uuid-1", "name": "Great Trail", "rating": 4, "description": "Nice!"},
            headers=headers,
        )

        assert response.status_code == 201
        body = response.get_json()
        assert body["message"] == "Review added successfully"
        assert body["review"]["rating"] == 4

    def test_add_review_no_body_returns_400(self, client, mock_supabase):
        headers, _ = self._setup_auth(mock_supabase)
        response = client.post("/", data="not json", content_type="text/plain", headers=headers)
        assert response.status_code in (400, 415)

    def test_add_review_rating_too_low_returns_400(self, client, mock_supabase):
        headers, _ = self._setup_auth(mock_supabase)
        response = client.post(
            "/",
            json={"trail_id": "t1", "name": "N", "rating": 0},
            headers=headers,
        )
        assert response.status_code == 400
        assert "Rating" in response.get_json()["error"]

    def test_add_review_rating_too_high_returns_400(self, client, mock_supabase):
        headers, _ = self._setup_auth(mock_supabase)
        response = client.post(
            "/",
            json={"trail_id": "t1", "name": "N", "rating": 6},
            headers=headers,
        )
        assert response.status_code == 400

    def test_add_review_rating_non_numeric_returns_400(self, client, mock_supabase):
        headers, _ = self._setup_auth(mock_supabase)
        response = client.post(
            "/",
            json={"trail_id": "t1", "name": "N", "rating": "five"},
            headers=headers,
        )
        assert response.status_code == 400

    def test_add_review_db_error_returns_400(self, client, mock_supabase):
        headers, _ = self._setup_auth(mock_supabase)
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("db error")
        response = client.post(
            "/",
            json={"trail_id": "t1", "name": "N", "rating": 3},
            headers=headers,
        )
        assert response.status_code == 400

    def test_add_review_sets_user_id_from_token(self, client, mock_supabase, sample_review):
        headers, mock_user = self._setup_auth(mock_supabase)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_review])

        client.post(
            "/",
            json={"trail_id": "t1", "name": "N", "rating": 3},
            headers=headers,
        )

        inserted = mock_supabase.table.return_value.insert.call_args[0][0]
        assert inserted["user_id"] == mock_user.id

    def test_add_review_description_defaults_to_empty(self, client, mock_supabase, sample_review):
        headers, _ = self._setup_auth(mock_supabase)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_review])

        client.post("/", json={"trail_id": "t1", "name": "N", "rating": 3}, headers=headers)

        inserted = mock_supabase.table.return_value.insert.call_args[0][0]
        assert inserted["description"] == ""
