from unittest.mock import patch, MagicMock


def make_mock_response(status_code=200, content=b'{"ok": true}', headers=None):
    mock_resp = MagicMock()
    mock_resp.status_code = status_code
    mock_resp.content = content
    mock_resp.raw.headers.items.return_value = list((headers or {}).items())
    return mock_resp


class TestAuthProxy:
    def test_proxies_get_to_auth_service(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            response = client.get("/auth/login")
            assert response.status_code == 200
            call_url = mock_req.call_args[1]["url"]
            assert call_url.startswith("http://auth-service")

    def test_proxies_post_to_auth_service(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response(201, b'{"created": true}')) as mock_req:
            response = client.post("/auth/signup", json={"email": "a@b.com"})
            assert response.status_code == 201
            assert mock_req.call_args[1]["method"] == "POST"

    def test_auth_root_path_proxied(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/auth")
            call_url = mock_req.call_args[1]["url"]
            assert "auth-service" in call_url


class TestTrailProxy:
    def test_proxies_get_to_trail_service(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/trails")
            call_url = mock_req.call_args[1]["url"]
            assert "trail-service" in call_url

    def test_proxies_query_string(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/trails/list?category=mtb&status=open")
            call_url = mock_req.call_args[1]["url"]
            assert "category=mtb" in call_url
            assert "status=open" in call_url

    def test_proxies_post_trail(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response(201)) as mock_req:
            response = client.post("/trails", json={"name": "T"})
            assert response.status_code == 201
            assert mock_req.call_args[1]["method"] == "POST"


class TestReviewProxy:
    def test_proxies_get_to_review_service(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/reviews")
            call_url = mock_req.call_args[1]["url"]
            assert "review-service" in call_url

    def test_proxies_post_review(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response(201)) as mock_req:
            response = client.post("/reviews", json={"rating": 5})
            assert response.status_code == 201


class TestMediaProxy:
    def test_proxies_to_media_service(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/media/some-file")
            call_url = mock_req.call_args[1]["url"]
            assert "media-service" in call_url


class TestForwardRequest:
    def test_host_header_is_excluded(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response()) as mock_req:
            client.get("/trails", headers={"Host": "myhost.com", "Authorization": "Bearer token"})
            forwarded_headers = mock_req.call_args[1]["headers"]
            assert "Host" not in forwarded_headers
            assert "Authorization" in forwarded_headers

    def test_hop_by_hop_headers_stripped_from_response(self, client):
        hop_headers = {
            "Content-Encoding": "gzip",
            "Content-Length": "42",
            "Transfer-Encoding": "chunked",
            "Connection": "keep-alive",
            "X-Custom": "kept",
        }
        with patch("app.routes.requests.request", return_value=make_mock_response(headers=hop_headers)):
            response = client.get("/trails")
            assert "Content-Encoding" not in response.headers
            assert "Transfer-Encoding" not in response.headers
            assert "Connection" not in response.headers

    def test_upstream_error_code_forwarded(self, client):
        with patch("app.routes.requests.request", return_value=make_mock_response(503)):
            response = client.get("/trails")
            assert response.status_code == 503
