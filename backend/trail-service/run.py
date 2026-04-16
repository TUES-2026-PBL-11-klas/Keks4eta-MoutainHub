from app import create_app
import os
app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("REVIEW_SERVICE_PORT", 5002))
    app.run(host="0.0.0.0", port=port, debug=True)