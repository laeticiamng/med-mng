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
  echo "Usage: $0 <environment> [steps]" >&2
  exit 1
fi

if [[ -z "${SUPABASE_DB_URL:-}" ]]; then
  echo "SUPABASE_DB_URL environment variable is required." >&2
  exit 1
fi

ROLLBACK_LAST=${ROLLBACK_LAST:-${2:-1}}
if ! [[ "${ROLLBACK_LAST}" =~ ^[0-9]+$ ]]; then
  echo "ROLLBACK_LAST must be a positive integer (received: ${ROLLBACK_LAST})." >&2
  exit 1
fi

if (( ROLLBACK_LAST < 1 )); then
  echo "ROLLBACK_LAST must be at least 1." >&2
  exit 1
fi

cd "${REPO_ROOT}"

echo "⚠️ Reverting the last ${ROLLBACK_LAST} migration(s) on '${ENVIRONMENT_NAME}'..."
YES=1 supabase migration down --db-url "${SUPABASE_DB_URL}" --last "${ROLLBACK_LAST}"
echo "✅ Rollback completed on '${ENVIRONMENT_NAME}'."
