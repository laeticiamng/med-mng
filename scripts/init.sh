#!/usr/bin/env bash
set -euo pipefail

# Apply SQL migrations to the local database
for file in supabase/migrations/*.sql; do
  echo "Applying $file"
  docker compose exec -T db psql -U postgres -d medmng -f /dev/stdin < "$file"
done

echo "Migrations applied"
