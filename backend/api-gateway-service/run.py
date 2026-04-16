from app import create_app
from dotenv import load_dotenv
import os

load_dotenv()  # loads root .env

app = create_app()

if __name__ == "__main__":
    app.run(port=os.getenv("API_GATEWAY_PORT", 8080), host="0.0.0.0", debug=True)
