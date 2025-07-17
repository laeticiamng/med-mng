# Roadmap v1.1.0

This document lists epics for improving MED-MNG to the upcoming v1.1.0 release.
Each epic is tracked by a GitHub issue (to be created).

## Epic 1 – Security & Best Practices
- [ ] Move all secrets to `.env` and GitHub secrets
- [ ] Enable RLS on all tables and add security tests
- [ ] Add `express-rate-limit` and `helmet`
- [ ] Use Zod validation for all routes

## Epic 2 – Monorepo Refactor
- [ ] Restructure into `apps/api`, `apps/web`, `apps/worker`, and `packages/shared`
- [ ] Extract core logic to `packages/core`
- [ ] Configure per-project `tsconfig` and aliases
- [ ] Update npm scripts for multi-package builds

## Epic 3 – Workers & Queue
- [ ] Add BullMQ queues for music generation, processing, notifications
- [ ] Provide WebSocket endpoint for Suno progress
- [ ] Implement retry/back-off with Sentry alerts on failure

## Epic 4 – Functional Completion
- [ ] Playlist review with Pomodoro timer
- [ ] Leitner-based adaptive quiz storing scores
- [ ] Badges and leaderboard (opt-in)
- [ ] Pagination and filtering in the library

## Epic 5 – UX, Accessibility & Design Tokens
- [ ] Add CSS variables for tokens
- [ ] Implement dark mode
- [ ] Create sticky mobile AudioPlayer
- [ ] Improve focus rings and aria labels with a11y tests

## Epic 6 – Performance & PWA
- [ ] Code-splitting with `React.lazy`
- [ ] Brotli compression and static cache-control
- [ ] Pre-cache first 30 seconds of audio via service worker
- [ ] Add PWA manifest and offline fallback

## Epic 7 – Observability & CI/CD
- [ ] Extend CI with `supabase db push --dry-run`, tests (Vitest + Cypress) and Docker build
- [ ] Integrate Sentry on both front and back
- [ ] Deploy to Vercel and Supabase via GitHub Actions on tags

## Epic 8 – API First & Mobile Readiness
- [ ] Generate OpenAPI schema from Zod using `zod-to-openapi`
- [ ] Add contract tests with Prism
- [ ] Document components in `/docs` and provide a minimal Storybook

Progress on these tasks will be tracked in their respective issues.
