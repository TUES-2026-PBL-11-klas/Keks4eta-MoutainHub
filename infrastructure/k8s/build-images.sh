set -e

echo "==> Building Docker images..."
docker build -t mountainhub-api-gateway:local ./backend/api-gateway-service
docker build -t mountainhub-auth:local ./backend/user-service
docker build -t mountainhub-review:local ./backend/review-service
docker build -t mountainhub-trail:local ./backend/trail-service
docker build -t mountainhub-frontend:local ./frontend