#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_ROOT=$(cd "${SCRIPT_DIR}/.." && pwd)

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is required but not installed." >&2
  exit 1
fi

ENVIRONMENT_NAME=${1:-}
if [[ -z "${ENVIRONMENT_NAME}" ]]; then
  echo "Usage: $0 <environment>" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL environment variable is required." >&2
  exit 1
fi

cd "${REPO_ROOT}"

echo "🚀 Applying Supabase migrations to '${ENVIRONMENT_NAME}'..."
supabase db push --db-url "${SUPABASE_DB_URL}"
echo "✅ Migrations applied successfully on '${ENVIRONMENT_NAME}'."
