#!/bin/bash
# =============================================================================
# The Heritage Club (THC) - Production Database Backup Script
#
# Dumps all PostgreSQL databases (MarketplaceDb, CollectorVaultDb,
# BuyerWishlistDb, SellerHubDb, CustomerOrdersDb, UserAccountDb, ServiceCenterDb)
# into a compressed .sql.gz archive.
#
# Usage:
#   ./backup.sh
# =============================================================================

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

if [ -f ".env" ]; then
    set -a
    source .env
    set +a
fi

BACKUP_DIR="${BACKUP_DIR:-$SCRIPT_DIR/backups}"
mkdir -p "$BACKUP_DIR"

TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTPUT_FILE="$BACKUP_DIR/thc_marketplace_backup_$TIMESTAMP.sql.gz"

echo "Creating database backup..."
docker exec -t thc-marketplace-postgres pg_dumpall -c -U "${POSTGRES_USER:-marketplace_admin}" | gzip > "$OUTPUT_FILE"

echo "✅ Backup successfully created at:"
echo "   $OUTPUT_FILE"
echo "Size: $(du -h "$OUTPUT_FILE" | cut -f1)"
