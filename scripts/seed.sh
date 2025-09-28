#!/usr/bin/env bash
set -euo pipefail

# Example seed script using existing TypeScript utility
# Requires the backend container to be running

docker compose exec backend node --loader ts-node/esm scripts/addIC10Item.ts
