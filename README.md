# Mountain Hub

Mountain Hub is a platform for hikers, MTB riders, climbers, and mountain enthusiasts.

## Current stack
- Frontend: Expo (React Native + Web export)
- Backend: Flask
- Storage: Supabase
- Deployment: Docker + Kubernetes (GKE)
- CI/CD: GitHub Actions

## Project structure
- `frontend/` - Expo app, exported as static web for containerized deployment
- `backend/` - Flask API service
- `k8s/` - Kubernetes manifests
- `.github/workflows/` - CI/CD pipelines

## Local development

### Frontend
```bash
cd frontend
npm install
npm run start
```

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

Backend health check:
```bash
curl http://localhost:8080/health
```

## Docker build and run

### Backend image
```bash
docker build -t mountainhub-backend:local ./backend
docker run --rm -p 8080:8080 mountainhub-backend:local
```

### Frontend web image
```bash
docker build -t mountainhub-frontend:local ./frontend
docker run --rm -p 3000:80 mountainhub-frontend:local
```

Open http://localhost:3000 for the frontend container.

## Kubernetes manifests

Apply all manifests:
```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/backend/service.yaml
kubectl apply -f k8s/frontend/service.yaml
kubectl apply -f k8s/ingress.yaml
```

Deployments use placeholders:
- `BACKEND_IMAGE_PLACEHOLDER` in `k8s/backend/deployment.yaml`
- `FRONTEND_IMAGE_PLACEHOLDER` in `k8s/frontend/deployment.yaml`

In CI/CD, these are replaced with Artifact Registry image tags per commit.

## GitHub Actions

### CI (`.github/workflows/ci.yml`)
- Runs on PRs and pushes to `main`
- Frontend: `npm ci`, `npm run lint`, web export build
- Backend: `ruff check`, start Flask app, probe `/health`

### CD (`.github/workflows/cd-gke.yml`)
- Runs on pushes to `main` (and manual dispatch)
- Builds backend and frontend Docker images
- Pushes images to Artifact Registry
- Applies Kubernetes manifests to GKE
- Updates `mountainhub-secrets` from GitHub Secrets
- Waits for rollout success

## Required GitHub secrets for GKE CD

Set these in repository settings:

- `GCP_WORKLOAD_IDENTITY_PROVIDER`
- `GCP_SERVICE_ACCOUNT`
- `GCP_PROJECT_ID`
- `GCP_ARTIFACT_REGISTRY_HOST` (example: `europe-west1-docker.pkg.dev`)
- `GCP_ARTIFACT_REPOSITORY` (Artifact Registry repo name)
- `GKE_CLUSTER_NAME`
- `GKE_CLUSTER_LOCATION` (zone or region)
- `SUPABASE_URL`
- `SUPABASE_KEY`
- `SUPABASE_BUCKET_GPX`
- `SUPABASE_BUCKET_MEDIA`

## End-to-end deploy steps on Google Cloud

1. Create Artifact Registry repository for Docker images.
2. Create or select a GKE cluster.
3. Create a Google service account with:
   - Artifact Registry Writer
   - Kubernetes Engine Developer (or appropriate deploy role)
4. Configure Workload Identity Federation between GitHub and GCP.
5. Add all required GitHub secrets listed above.
6. Point DNS for `mountainhub.example.com` to the Ingress external IP.
7. Push to `main` to trigger CD and deploy both services.
