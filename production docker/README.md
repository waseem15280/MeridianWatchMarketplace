# THC Watch Marketplace - Production Deployment & Data Persistence Guide

This document explains how PostgreSQL data persistence works across deployments, why data loss previously occurred on subsequent deployments, and how to execute safe, zero-downtime updates without losing database records.

---

## 1. Why Data Loss Occurred in Previous Deployments

Three major factors contributed to database loss or reset during redeployments:

1. **Unpinned Named Volume Name (Project Scoping)**:
   - In Docker Compose, named volumes default to being prefixed by the project name: `<project_name>_<volume_name>`.
   - Without an explicit project name (`name: thc-marketplace`) and explicit volume name (`name: thc-marketplace-postgres-data`), Docker uses the directory name from which `docker compose` is invoked.
   - For example:
     - Running from `/opt/thc-marketplace/production docker` created `productiondocker_thc-marketplace-postgres-data`.
     - Running from `/opt/thc-marketplace` created `thc-marketplace_thc-marketplace-postgres-data`.
     - Deploying via versioned release folders (e.g. `/opt/releases/v1.0.1` vs `/opt/releases/v1.0.2`) created brand new empty volumes (`v101_...` vs `v102_...`).
   - Consequently, Docker detached from the previous volume and initialized a fresh empty database.

2. **Missing `POSTGRES_MULTIPLE_DATABASES` in `docker-compose.yaml`**:
   - The PostgreSQL container environment in `docker-compose.yaml` omitted `POSTGRES_MULTIPLE_DATABASES: ${POSTGRES_MULTIPLE_DATABASES}`.
   - While the primary database (`MarketplaceDb`) was created by Postgres, `init-multiple-databases.sh` skipped creating the other 6 microservice databases (`CollectorVaultDb`, `BuyerWishlistDb`, `SellerHubDb`, `CustomerOrdersDb`, `UserAccountDb`, `ServiceCenterDb`).
   - Microservices failed to connect or recreate schemes properly upon restart.

3. **Running Destructive Commands (`docker compose down -v`)**:
   - The `-v` (or `--volumes`) flag instructs Docker to **destroy all volumes**.
   - If a deployment script or operator ran `docker compose down -v` prior to pulling new images, all persistent database data was permanently wiped out.

---

## 2. Changes Implemented to Ensure Data Persistence

1. **Pinned Project Name**:
   - Added `name: thc-marketplace` at the top of `production docker/docker-compose.yaml`.
   - Guarantees the same project identity regardless of host directory structure.

2. **Pinned Volume Name**:
   - Added `name: thc-marketplace-postgres-data` under `volumes:` in `docker-compose.yaml`.
   - Ensures Docker always mounts the exact same global volume across all versions and releases.

3. **Added Environment Variable**:
   - Added `POSTGRES_MULTIPLE_DATABASES: ${POSTGRES_MULTIPLE_DATABASES}` to the `postgres` service environment.

4. **Configurable Host Directory Storage Option**:
   - Added `${POSTGRES_DATA_DIR:-thc-marketplace-postgres-data}:/var/lib/postgresql/data` support.
   - If `POSTGRES_DATA_DIR=/opt/thc-marketplace/data/postgres` is set in `.env`, Postgres writes directly to the Linux host disk, rendering the data completely immune to any Docker volume prune or `docker compose down -v`.

5. **Safe Deployment Automation (`deploy.sh`, `backup.sh`, `restore.sh`)**:
   - Added automated pre-deployment database dumps (`pg_dumpall | gzip`).
   - Uses zero-downtime rolling update (`docker compose pull && docker compose up -d --remove-orphans`).

---

## 3. How to Deploy a New Version Safely

### Method A: Using the Automated Script (Recommended)
```bash
cd /opt/thc-marketplace/production\ docker
chmod +x deploy.sh backup.sh restore.sh
./deploy.sh
```
This script automatically:
1. Backs up the entire database to `./backups/pre_deploy_backup_<timestamp>.sql.gz`.
2. Pulls updated container images from GHCR.
3. Recreates only the containers that have new images or changed configs (`docker compose up -d`).
4. Keeps the `thc-marketplace-postgres` container and data volume completely intact.

---

### Method B: Manual Deployment Commands
If you run commands manually, **NEVER use `down -v`**:

```bash
cd /opt/thc-marketplace/production\ docker

# 1. (Optional) Create database backup
docker exec -t thc-marketplace-postgres pg_dumpall -c -U marketplace_admin | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz

# 2. Pull updated images
docker compose --env-file .env -f docker-compose.yaml pull

# 3. Apply updates (Zero-downtime rolling update)
docker compose --env-file .env -f docker-compose.yaml up -d --remove-orphans
```

> ⚠️ **CRITICAL RULE**: NEVER run `docker compose down -v` on production. The `-v` flag permanently deletes all database volumes!

---

## 4. Recovering Data from an Older Volume (If Disconnected)

If an earlier deployment created an orphaned volume (e.g. `productiondocker_thc-marketplace-postgres-data`), the data may still exist on the production server.

To check existing volumes on your host:
```bash
docker volume ls
```

If you see an older volume with data (e.g. `productiondocker_thc-marketplace-postgres-data`):
1. Temporarily mount it to extract a dump:
   ```bash
   docker run --rm -v productiondocker_thc-marketplace-postgres-data:/data -v $(pwd):/backup alpine sh -c "tar -czf /backup/old_volume_data.tar.gz -C /data ."
   ```
2. Or spin up a temporary postgres container attached to that old volume and export SQL:
   ```bash
   docker run --rm -v productiondocker_thc-marketplace-postgres-data:/var/lib/postgresql/data -p 5433:5432 -e POSTGRES_USER=marketplace_admin -e POSTGRES_PASSWORD=Pa55w.rd postgres:17 pg_dumpall -U marketplace_admin > recovered_data.sql
   ```
3. Restore the SQL into the active production container:
   ```bash
   cat recovered_data.sql | docker exec -i thc-marketplace-postgres psql -U marketplace_admin -d postgres
   ```
