import io
from unittest.mock import MagicMock


class TestUpload:
    def _file(self, content=b"img", filename="photo.jpg", content_type="image/jpeg"):
        return {"file": (io.BytesIO(content), filename, content_type)}

    def test_upload_success(self, client, mock_supabase, auth_headers):
        mock_supabase.storage.from_.return_value.upload.return_value = MagicMock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = {
            "signedURL": "https://storage.example.com/signed"
        }

        response = client.post(
            "/",
            data=self._file(),
            content_type="multipart/form-data",
            headers=auth_headers,
        )

        assert response.status_code == 201
        body = response.get_json()
        assert "id" in body
        assert body["filename"] == "photo.jpg"
        assert body["content_type"] == "image/jpeg"
        assert body["size_bytes"] == 3
        assert body["url"] == "https://storage.example.com/signed"

    def test_upload_no_file_returns_400(self, client, auth_headers):
        response = client.post("/", data={}, content_type="multipart/form-data", headers=auth_headers)
        assert response.status_code == 400
        assert response.get_json() == {"error": "No file provided"}

    def test_upload_empty_filename_returns_400(self, client, auth_headers):
        data = {"file": (io.BytesIO(b"data"), "", "image/jpeg")}
        response = client.post("/", data=data, content_type="multipart/form-data", headers=auth_headers)
        assert response.status_code == 400
        assert response.get_json() == {"error": "Empty filename"}

    def test_upload_unsupported_type_returns_415(self, client, auth_headers):
        response = client.post(
            "/",
            data=self._file(filename="doc.pdf", content_type="application/pdf"),
            content_type="multipart/form-data",
            headers=auth_headers,
        )
        assert response.status_code == 415
        assert "Unsupported content type" in response.get_json()["error"]

    def test_upload_file_too_large_returns_413(self, client, auth_headers, app):
        app.config["MAX_UPLOAD_BYTES"] = 5
        response = client.post(
            "/",
            data=self._file(content=b"x" * 10),
            content_type="multipart/form-data",
            headers=auth_headers,
        )
        assert response.status_code == 413
        assert "50 MB" in response.get_json()["error"]

    def test_upload_requires_auth(self, client):
        response = client.post("/", data=self._file(), content_type="multipart/form-data")
        assert response.status_code == 401

    def test_upload_storage_error_returns_500(self, client, mock_supabase, auth_headers):
        mock_supabase.storage.from_.return_value.upload.side_effect = Exception("storage error")
        response = client.post(
            "/",
            data=self._file(),
            content_type="multipart/form-data",
            headers=auth_headers,
        )
        assert response.status_code == 500

    def test_upload_sets_user_id_from_token(self, client, mock_supabase, auth_headers, mock_user):
        mock_supabase.storage.from_.return_value.upload.return_value = MagicMock()
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = {"signedURL": ""}
        insert_mock = MagicMock(data=[{}])
        mock_supabase.table.return_value.insert.return_value.execute.return_value = insert_mock

        client.post("/", data=self._file(), content_type="multipart/form-data", headers=auth_headers)

        inserted = mock_supabase.table.return_value.insert.call_args[0][0]
        assert inserted["user_id"] == str(mock_user.id)

    def test_upload_gpx_file_accepted(self, client, mock_supabase, auth_headers):
        mock_supabase.storage.from_.return_value.upload.return_value = MagicMock()
        mock_supabase.table.return_value.insert.return_value.execute.return_value = MagicMock(data=[{}])
        mock_supabase.storage.from_.return_value.create_signed_url.return_value = {"signedURL": ""}

        response = client.post(
            "/",
            data=self._file(filename="route.gpx", content_type="application/gpx+xml"),
            content_type="multipart/form-data",
            headers=auth_headers,
        )
        assert response.status_code == 201
