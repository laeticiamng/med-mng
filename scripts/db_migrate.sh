#!/usr/bin/env bash
set -euo pipefail

ENVIRONMENT="${1:-}"
if [[ -z "${ENVIRONMENT}" ]]; then
  echo "Usage: $0 <environment>" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL must be defined to run migrations." >&2
  exit 1
fi

if [[ -z "${SUPABASE_ACCESS_TOKEN:-}" ]]; then
  echo "SUPABASE_ACCESS_TOKEN must be defined to run migrations." >&2
  exit 1
fi

echo "⚙️  Applying Supabase migrations for environment: ${ENVIRONMENT}" >&2

supabase db push --db-url "${SUPABASE_DB_URL}"
