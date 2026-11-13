#!/bin/bash
# =============================================================================
# The Heritage Club (THC) - Production Database Restore Script
#
# Restores all databases from a compressed .sql.gz or plain .sql dump file.
#
# Usage:
#   ./restore.sh ./backups/thc_marketplace_backup_20261113_120000.sql.gz
# =============================================================================

set -euo pipefail

if [ $# -lt 1 ]; then
    echo "Usage: $0 <path-to-backup-file.sql.gz or .sql>"
    exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

echo "⚠️  WARNING: This will restore database data from $BACKUP_FILE."
read -p "Are you sure you want to proceed? [y/N]: " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo "Restoring database..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" | docker exec -i thc-marketplace-postgres psql -U "${POSTGRES_USER:-marketplace_admin}" -d postgres
else
    docker exec -i thc-marketplace-postgres psql -U "${POSTGRES_USER:-marketplace_admin}" -d postgres < "$BACKUP_FILE"
fi

echo "✅ Database restoration completed successfully!"
