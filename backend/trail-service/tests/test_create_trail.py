from unittest.mock import MagicMock


class TestCreateTrail:
    def _auth_headers(self, mock_supabase, mock_user):
        mock_supabase.auth.get_user.return_value = MagicMock(user=mock_user)
        return {"Authorization": "Bearer valid-token"}

    def test_create_trail_success(self, client, mock_supabase, mock_user, sample_trail):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_trail])

        response = client.post(
            "/",
            json={
                "category": "mtb",
                "name": "Test Trail",
                "route": {"type": "LineString", "coordinates": [[23.1, 42.1, 1200]]},
                "difficulty": 3,
                "distance_km": 12.4,
                "elevation_gain_m": 540,
                "description": "A test trail",
            },
            headers=headers,
        )

        assert response.status_code == 201
        data = response.get_json()
        assert data["name"] == "Test Trail"
        assert data["category"] == "mtb"

    def test_create_trail_missing_required_fields(self, client, mock_supabase, mock_user):
        headers = self._auth_headers(mock_supabase, mock_user)
        response = client.post("/", json={"name": "No Category"}, headers=headers)
        assert response.status_code == 400
        body = response.get_json()
        assert "Missing fields" in body["error"]
        assert "category" in body["error"]
        assert "route" in body["error"]

    def test_create_trail_no_json_body(self, client, mock_supabase, mock_user):
        headers = self._auth_headers(mock_supabase, mock_user)
        response = client.post("/", data="not json", content_type="text/plain", headers=headers)
        assert response.status_code == 400
        assert response.get_json() == {"error": "JSON body required"}

    def test_create_trail_invalid_enum_returns_400(self, client, mock_supabase, mock_user):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception(
            "invalid input value for enum category_type"
        )
        response = client.post(
            "/",
            json={"category": "invalid-cat", "name": "T", "route": {"type": "LineString", "coordinates": [[23.1, 42.1]]}},
            headers=headers,
        )
        assert response.status_code == 400
        assert response.get_json() == {"error": "Invalid field value"}

    def test_create_trail_db_error_returns_500(self, client, mock_supabase, mock_user):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception("db error")
        response = client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {"type": "LineString", "coordinates": [[23.1, 42.1]]}},
            headers=headers,
        )
        assert response.status_code == 500

    def test_create_trail_sets_user_id_from_token(self, client, mock_supabase, mock_user, sample_trail):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_trail])

        client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {"type": "LineString", "coordinates": [[23.1, 42.1]]}},
            headers=headers,
        )

        insert_call_args = mock_supabase.table.return_value.insert.call_args[0][0]
        assert insert_call_args["user_id"] == mock_user.id

    def test_create_trail_default_status_is_open(self, client, mock_supabase, mock_user, sample_trail):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[sample_trail])

        client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {"type": "LineString", "coordinates": [[23.1, 42.1]]}},
            headers=headers,
        )

        insert_call_args = mock_supabase.table.return_value.insert.call_args[0][0]
        assert insert_call_args["status"] == "open"

    def test_create_trail_insert_returns_empty_data(self, client, mock_supabase, mock_user):
        headers = self._auth_headers(mock_supabase, mock_user)
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[])

        response = client.post(
            "/",
            json={"category": "mtb", "name": "T", "route": {"type": "LineString", "coordinates": [[23.1, 42.1]]}},
            headers=headers,
        )
        assert response.status_code == 500
        assert response.get_json() == {"error": "Insert failed"}
