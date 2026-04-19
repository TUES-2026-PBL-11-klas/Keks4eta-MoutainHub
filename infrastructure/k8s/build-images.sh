set -e

echo "==> Building Docker images..."
docker build -t mountainhub-api-gateway:latest ./backend/api-gateway-service
docker build -t mountainhub-auth:latest ./backend/user-service
docker build -t mountainhub-review:latest ./backend/review-service
docker build -t mountainhub-trail:latest ./backend/trail-service
docker build -t mountainhub-frontend:latest ./frontend