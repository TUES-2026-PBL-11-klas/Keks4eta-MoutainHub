# Mountain Hub

Mountain Hub is a platform for hikers, MTB riders, and ski enthusiasts to discover, share, and track mountain trails. Users can browse and upload GPX routes across three activity categories — hiking, mountain biking, and skiing — and leave reviews for trails.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                     Client (Browser)                │
│              Expo Web Export (React Native)         │
└─────────────────────┬───────────────────────────────┘
                      │ HTTP
┌─────────────────────▼───────────────────────────────┐
│                  API Gateway (Flask)                │
│                    /auth  /trails                   │
│                    /reviews  /media                 │
└────┬──────────────┬─────────────┬───────────────────┘
     │              │             │
┌────▼────┐   ┌─────▼────┐  ┌─────▼────┐  ┌──────────┐
│  User   │   │  Trail   │  │  Review  │  │  Media   │
│ Service │   │ Service  │  │ Service  │  │ Service  │
│ (Flask) │   │ (Flask)  │  │ (Flask)  │  │(planned) │
└────┬────┘   └─────┬────┘  └─────┬────┘  └──────────┘
     └──────────────┴─────────────┘
                      │
          ┌───────────▼───────────┐
          │        Supabase       │
          │  Auth · DB · Storage  │
          └───────────────────────┘
```

**Deployment:** Local Kubernetes (via Terraform) → Google Cloud (GKE, in progress)

## Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Expo (React Native, web export only) | — |
| Backend | Flask | 3.1.3 |
| Language | Python | 3.11 |
| Auth | Supabase Auth | — |
| Database | Supabase (PostgreSQL) | — |
| Storage | Supabase Storage (GPX + media buckets) | — |
| Infrastructure | Kubernetes + Terraform | — |
| CI/CD | GitHub Actions | — |
| Container Registry | Google Artifact Registry | — |

## Project Structure

```
mountain-hub/
├── frontend/                    # Expo app, exported as static web
├── backend/
│   ├── api-gateway-service/     # API Gateway — proxies to internal services
│   ├── user-service/            # Auth & user management
│   ├── trail-service/           # Trail CRUD & GPX routes
│   ├── review-service/          # Trail reviews
│   └── media-service/           # Media uploads (planned)
├── infrastructure/
│   ├── k8s/                     # Kubernetes manifests
│   │   ├── namespace.yaml
│   │   ├── configmap.yaml
│   │   ├── backend/
│   │   └── frontend/
│   └── terraform/               # Infrastructure as code
├── docker-compose.yml
└── .github/workflows/           # CI/CD pipelines
```

## Local Development

### Prerequisites

- Python 3.11
- Node.js (for Expo frontend)
- A Supabase project with the required buckets (`gpx`, `media`)

### Environment Variables

Create a `.env` file in each service directory (or set them in your shell):

```env
SUPABASE_URL=https://<your-project>.supabase.co
SUPABASE_KEY=<your-anon-or-service-key>
SUPABASE_BUCKET_GPX=gpx
SUPABASE_BUCKET_MEDIA=media
```

### Frontend

```bash
cd frontend
npm install
npm run start
```

For a static web export:

```bash
npx expo export --platform web
```

### Backend Services

Each service runs independently. Example for the gateway:

```bash
cd backend/api-gateway-service
pip install -r requirements.txt
python app.py
```

Repeat for `user-service`, `trail-service`, and `review-service`.

Health check:

```bash
curl http://localhost:8080/health
```

## Docker

### Build & run individual images

```bash
# Backend (gateway example)
docker build -t mountainhub-gateway:local ./backend/api-gateway-service
docker run --rm -p 8080:8080 mountainhub-gateway:local

# Frontend
docker build -t mountainhub-frontend:local ./frontend
docker run --rm -p 3000:80 mountainhub-frontend:local
```

Open http://localhost:3000 for the frontend.

## Kubernetes (Local via Terraform)

Local development uses a local Kubernetes cluster managed by Terraform.

```bash
# Provision local cluster
cd infrastructure/terraform
terraform init
terraform apply

# Apply manifests
kubectl apply -f infrastructure/k8s/namespace.yaml
kubectl apply -f infrastructure/k8s/configmap.yaml
kubectl apply -f infrastructure/k8s/backend/api-gateway-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/auth-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/review-service/service.yaml
kubectl apply -f infrastructure/k8s/backend/trail-service/service.yaml
kubectl apply -f infrastructure/k8s/frontend/service.yaml
```

Deployment manifests use image placeholders replaced by CI/CD:
- `BACKEND_IMAGE_PLACEHOLDER` → `infrastructure/k8s/backend/<service>/deployment.yaml`
- `FRONTEND_IMAGE_PLACEHOLDER` → `infrastructure/k8s/frontend/deployment.yaml`

## CI/CD (GitHub Actions)

### CI (`.github/workflows/ci.yml`)

Runs on PRs and pushes to `main`:
- Frontend: `npm ci`, `npm run lint`, web export build
- Backend: `ruff check`, Flask startup, `/health` probe

### CD (`.github/workflows/cd-gke.yml`)

Runs on pushes to `main` (and manual dispatch):
- Builds and pushes Docker images to Google Artifact Registry
- Applies Kubernetes manifests
- Updates `mountainhub-secrets` from GitHub Secrets
- Waits for rollout success

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `GCP_WORKLOAD_IDENTITY_PROVIDER` | Workload Identity Federation provider |
| `GCP_SERVICE_ACCOUNT` | GCP service account email |
| `GCP_PROJECT_ID` | Google Cloud project ID |
| `GCP_ARTIFACT_REGISTRY_HOST` | e.g. `europe-west1-docker.pkg.dev` |
| `GCP_ARTIFACT_REPOSITORY` | Artifact Registry repo name |
| `GKE_CLUSTER_NAME` | GKE cluster name |
| `GKE_CLUSTER_LOCATION` | Zone or region |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_KEY` | Supabase API key |
| `SUPABASE_BUCKET_GPX` | GPX storage bucket name |
| `SUPABASE_BUCKET_MEDIA` | Media storage bucket name |

## API Reference

All requests go through the **API Gateway** (default: `http://localhost:8080`). Authenticated endpoints require:

```
Authorization: Bearer <supabase-access-token>
```

---

### Gateway

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/health` | No | Health check |
| `ANY` | `/auth[/<path>]` | — | Proxy → User Service |
| `ANY` | `/reviews[/<path>]` | — | Proxy → Review Service |
| `ANY` | `/media[/<path>]` | — | Proxy → Media Service |
| `ANY` | `/trails[/<path>]` | — | Proxy → Trail Service |

---

### User Service (`/auth/...`)

| Method | Path | Auth | Description | Body |
|---|---|---|---|---|
| `GET` | `/health` | No | Health check | — |
| `GET` | `/ready` | No | DB readiness | — |
| `POST` | `/login` | No | Login | `{ email, password }` |
| `POST` | `/signup` | No | Register | `{ email, password, display_name? }` |
| `POST` | `/logout` | Yes | Logout | — |
| `GET` | `/user/<user_id>` | No | Get user by ID | — |

---

### Trail Service (`/trails/...`)

| Method | Path | Auth | Description | Body / Params |
|---|---|---|---|---|
| `GET` | `/health` | No | Health check | — |
| `GET` | `/ready` | No | DB readiness | — |
| `POST` | `/` | Yes | Create trail | `{ category, name, route (GeoJSON), difficulty?, description?, distance_km?, elevation_gain_m?, status? }` |
| `GET` | `/` | No | List trails | `?category, ?status` |
| `GET` | `/<trail_id>` | No | Get trail by ID | — |
| `GET` | `/user/<user_id>` | No | Trails by user | `?category, ?status` |

---

### Review Service (`/reviews/...`)

| Method | Path | Auth | Description | Body / Params |
|---|---|---|---|---|
| `GET` | `/health` | No | Health check | — |
| `GET` | `/ready` | No | DB readiness | — |
| `POST` | `/` | Yes | Create review | `{ trail_id, name, rating (1–5), description? }` |
| `GET` | `/` | No | List all reviews | `?since, ?size, ?page` |
| `GET` | `/trail/<trail_id>` | No | Reviews for trail | `?since, ?size, ?page` |
| `GET` | `/user/<user_id>` | No | Reviews by user | `?since, ?size, ?page` |
| `GET` | `/category/<category>` | No | Reviews by category | `?since, ?size, ?page` |

---

### Media Service

> 🚧 Not yet implemented.

---

> **API documentation (OpenAPI/Swagger):** planned, not yet available.

## GCP Deployment (In Progress)

Once GKE is provisioned:

1. Create an Artifact Registry repository for Docker images.
2. Create or select a GKE cluster.
3. Create a service account with **Artifact Registry Writer** and **Kubernetes Engine Developer** roles.
4. Configure Workload Identity Federation between GitHub Actions and GCP.
5. Add all required GitHub Secrets listed above.
6. Push to `main` to trigger the CD pipeline.