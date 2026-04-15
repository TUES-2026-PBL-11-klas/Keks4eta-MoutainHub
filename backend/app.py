from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)


@app.get("/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.get("/")
def root():
    return jsonify({"service": "backend", "message": "Mountain Hub API"}), 200


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)
