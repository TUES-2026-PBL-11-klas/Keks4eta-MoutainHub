#!/usr/bin/env bash
set -euo pipefail

COMMIT_MESSAGE="${1:-chore: bootstrap monorepo with react-native, django microservices, postgres/postgis, docker, k8s and ci}"
PUSH_AFTER="${2:-false}"

echo "==> Bootstrapping Mountain Hub initial structure..."

mkdir -p apps/mobile/src/{screens,components,navigation,services,hooks,types,theme,assets}
mkdir -p services/{user-service,trail-service,review-service,media-service}
mkdir -p infra/{docker,k8s/base,k8s/dev,scripts}
mkdir -p docs/{architecture,database,api,adr}
mkdir -p .github/{workflows,ISSUE_TEMPLATE}

cat > .gitignore <<'EOF'
# Python
__pycache__/
*.py[cod]
*.pyo
*.pyd
*.sqlite3
*.log
.venv/
venv/
env/

# Django
media/
staticfiles/

# Node / React Native
node_modules/
.expo/
.expo-shared/
dist/
build/
coverage/

# Env files
.env
.env.*
!.env.example

# OS / Editors
.DS_Store
Thumbs.db
.vscode/
.idea/

# Docker
*.tar

# Terraform / K8s local
*.tfstate
*.tfstate.*
EOF

cat > .editorconfig <<'EOF'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2
trim_trailing_whitespace = true

[*.py]
indent_size = 4
EOF

cat > .env.example <<'EOF'
# Shared
ENV=development

# Postgres / PostGIS
POSTGRES_DB=mountainhub
POSTGRES_USER=mountainhub
POSTGRES_PASSWORD=mountainhub
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Django
DJANGO_SECRET_KEY=change-me
DJANGO_DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-key
SUPABASE_BUCKET_GPX=gpx-files
SUPABASE_BUCKET_MEDIA=media-files
EOF

cat > .pre-commit-config.yaml <<'EOF'
repos:
  - repo: https://github.com/pre-commit/pre-commit-hooks
    rev: v5.0.0
    hooks:
      - id: end-of-file-fixer
      - id: trailing-whitespace
      - id: check-yaml
      - id: check-json
      - id: detect-private-key

  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.0
    hooks:
      - id: ruff
      - id: ruff-format
EOF

cat > Makefile <<'EOF'
COMPOSE_FILE=infra/docker/docker-compose.yml

up:
	docker compose -f $(COMPOSE_FILE) up --build

down:
	docker compose -f $(COMPOSE_FILE) down

logs:
	docker compose -f $(COMPOSE_FILE) logs -f

ps:
	docker compose -f $(COMPOSE_FILE) ps
EOF

cat > README.md <<'EOF'
# Mountain Hub

Mountain Hub е платформа за туристи, MTB колоездачи, катерачи и любители на планината.

## Технологии
- Frontend: React Native
- Backend: Django + Django REST Framework
- Database: PostgreSQL + PostGIS
- Storage: Supabase
- Deployment: Docker + Kubernetes
- CI/CD: GitHub Actions
- Planning: Kanban

## Архитектура
Проектът е организиран като microservices:
- user-service
- trail-service
- review-service
- media-service

## Стартиране локално
```bash
make up