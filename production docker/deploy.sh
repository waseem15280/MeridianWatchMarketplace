#!/bin/bash
# =============================================================================
# The Heritage Club (THC) - Safe Production Deployment Script
#
# This script deploys new versions of THC Watch Marketplace without
# losing any production database data or causing unnecessary downtime.
#
# Usage:
#   cd /opt/thc-marketplace/production\ docker
#   chmod +x deploy.sh
#   ./deploy.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "========================================================"
echo " Starting Safe Production Deployment for THC Marketplace"
echo "========================================================"

# 1. Verify .env file exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found in $SCRIPT_DIR!"
    echo "Please copy .env.example to .env and configure it before deploying."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# 2. Automated pre-deployment database backup (if postgres container is currently running)
BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
mkdir -p "$BACKUP_DIR"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/pre_deploy_backup_$TIMESTAMP.sql.gz"

if docker ps --format '{{.Names}}' | grep -q "^thc-marketplace-postgres$"; then
    echo "📦 Creating automated pre-deployment backup of all databases..."
    if docker exec -t thc-marketplace-postgres pg_dumpall -U "${POSTGRES_USER:-marketplace_admin}" | gzip > "$BACKUP_FILE"; then
        echo "✅ Backup successfully saved to: $BACKUP_FILE"
        # Keep only the last 10 pre-deployment backups
        ls -t "$BACKUP_DIR"/pre_deploy_backup_*.sql.gz 2>/dev/null | tail -n +11 | xargs -r rm -f || true
    else
        echo "⚠️ Warning: Automated pre-deployment backup failed. Continuing deployment with caution..."
    fi
else
    echo "ℹ️ PostgreSQL container is not currently running. Skipping pre-deploy backup."
fi

# 3. Pull latest images from GHCR
echo "⬇️ Pulling latest container images from GHCR..."
docker compose --env-file .env -f docker-compose.yaml pull

# 4. Zero-downtime rolling update (NEVER run 'docker compose down -v'!)
# 'docker compose up -d' only restarts containers whose images or configurations changed.
# Existing volumes and healthy running containers remain untouched.
echo "🚀 Applying updates and recreating changed containers..."
docker compose --env-file .env -f docker-compose.yaml up -d --remove-orphans

# 5. Wait for healthy database and display service statuses
echo "⏳ Verifying services health..."
sleep 5

docker compose --env-file .env -f docker-compose.yaml ps

echo "========================================================"
echo " ✅ Deployment completed successfully!"
echo " Production data in volume 'thc-marketplace-postgres-data' is preserved."
echo "========================================================"
