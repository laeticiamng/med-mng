# MED-MNG Backend Refactoring Plan

This document outlines the planned architecture for a scalable backend based on the provided ticket.

## Monorepo Layout

```
/apps
  api       - Supabase Edge Functions and REST handlers
  cron      - Scheduled jobs (e.g. pg-boss cron)
  worker    - Background queue consumer
/packages
  shared    - Shared configs, eslint, and utilities
```

A `pnpm-workspace.yaml` file allows all packages to be managed with pnpm.

## Quick Start

```bash
git clone <repo-url>
cd med-mng
pnpm install
supabase start
pnpm dev
```

## Environment

Variables are loaded from `.env`. Check `.env.example` for the full list.

## CI/CD

GitHub Actions will run lint, build and tests before deployment.
