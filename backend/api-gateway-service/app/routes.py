from flask import request, Response
import requests

def forward_request(base_url, path):
    query_string = request.query_string.decode()
    url = f"{base_url}/{path}"
    if query_string:
        url = f"{url}?{query_string}"


    headers = {
        key: value
        for key, value in request.headers
        if key.lower() != "host"
    }

    response = requests.request(
        method=request.method,
        url=url,
        headers=headers,
        data=request.get_data(),
        cookies=request.cookies,
        allow_redirects=False,  
    )


    excluded_headers = ["content-encoding", "content-length", "transfer-encoding", "connection"]

    response_headers = [
        (name, value)
        for name, value in response.raw.headers.items()
        if name.lower() not in excluded_headers
    ]

    return Response(
        response.content,
        response.status_code,
        response_headers
    )



def register_routes(app):

    @app.route("/health", methods=["GET"])
    def health():
        return {"status": "ok"}, 200


    @app.route("/auth", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    @app.route("/auth/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def auth_proxy(path):
        print("HIT GATEWAY AUTH ROUTE:", request.path)

        return forward_request(app.config["AUTH_SERVICE_URL"], path)


    @app.route("/reviews", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    @app.route("/reviews/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def review_proxy(path):
        return forward_request(app.config["REVIEW_SERVICE_URL"], path)


    @app.route("/media", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    @app.route("/media/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def media_proxy(path):
        return forward_request(app.config["MEDIA_SERVICE_URL"], path)


    @app.route("/trails", defaults={"path": ""}, methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    @app.route("/trails/<path:path>", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    def trail_proxy(path):
        return forward_request(app.config["TRAIL_SERVICE_URL"], path)
