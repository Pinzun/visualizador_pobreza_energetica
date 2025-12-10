#!/bin/bash
set -euo pipefail

usage() {
  cat <<EOF
Usage: $0 {dev|qa|prod}
  ERROR: debes indicar en que entorno quieres levantar la aplicación.
  Entornos disponibles:
  dev   — Arranca tu entorno local con Docker Compose.
  qa    — (pendiente) Despliega a QA.
  prod  — (pendiente) Despliega a Producción.
EOF
  exit 1
}

[ $# -eq 1 ] || usage
ENVIRONMENT="$1"

# Determinar la carpeta donde está este script (start.sh)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Partir de ahí hacia el backend/app
BACKEND_APP_DIR="$SCRIPT_DIR/backend"

start_local() {
  echo "🔧 Levantando en modo LOCAL con Docker Compose..."
  docker compose build --no-cache
  docker compose up 
}

deploy_cloud() {
  echo "☁️ Aún no se implementa el paso a ${ENVIRONMENT^^}"
  exit 0
}

case "$ENVIRONMENT" in
  dev)
    start_local
    ;;
  qa|prod)
    deploy_cloud
    ;;
  *)
    usage
    ;;
esac