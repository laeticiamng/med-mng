#!/usr/bin/env bash
set -euo pipefail

echo "Resetting database..."
# Drop and recreate the database
docker compose exec -T db psql -U postgres -c 'DROP DATABASE IF EXISTS medmng;'
docker compose exec -T db psql -U postgres -c 'CREATE DATABASE medmng;'

# Reapply migrations
./scripts/init.sh
