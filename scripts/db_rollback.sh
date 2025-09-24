#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-}"
if [[ -z "${ENVIRONMENT}" ]]; then
  echo "Usage: $0 <environment>" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL must be defined to roll back migrations." >&2
  exit 1
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN must be defined to roll back migrations." >&2
  exit 1
fi

echo "↩️  Rolling back last Supabase migration for environment: ${ENVIRONMENT}" >&2

supabase migration down 1 --db-url "${SUPABASE_DB_URL}"
