#!/usr/bin/env bash
set -euo pipefail

# Run Vitest for unit tests
npx vitest run --reporter=verbose
