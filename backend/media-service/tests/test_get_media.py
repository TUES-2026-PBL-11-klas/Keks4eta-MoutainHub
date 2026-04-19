from unittest.mock import MagicMock


class TestGetMedia:
    def test_get_media_success(self, client, mock_supabase, sample_media):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=sample_media)  # noqa: E501
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = {
            "signedURL": "https://storage.example.com/signed"
        }

        response = client.get("/media-uuid-1")

        assert response.status_code == 200
        body = response.get_json()
        assert body["id"] == "media-uuid-1"
        assert body["filename"] == "photo.jpg"
        assert body["url"] == "https://storage.example.com/signed"

    def test_get_media_not_found(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=None)  # noqa: E501

        response = client.get("/nonexistent-id")

        assert response.status_code == 404
        assert response.get_json() == {"error": "Media not found"}

    def test_get_media_db_error_returns_500(self, client, mock_supabase):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.side_effect = Exception("db error")  # noqa: E501

        response = client.get("/some-id")

        assert response.status_code == 500

    def test_get_media_returns_correct_fields(self, client, mock_supabase, sample_media):
        mock_supabase.table.return_value.select.return_value.eq.return_value.single.return_value.execute.return_value = MagicMock(data=sample_media)  # noqa: E501
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = {"signedURL": "https://url"}

        response = client.get("/media-uuid-1")
        body = response.get_json()

        assert set(body.keys()) == {"id", "user_id", "filename", "content_type", "size_bytes", "url"}
