from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()  # loads root .env

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("API_GATEWAY_PORT", 8080))
    app.run(host="0.0.0.0", port=port, debug=True)
