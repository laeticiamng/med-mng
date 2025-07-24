# MED-MNG Backend
[![CI](https://github.com/med-mng/med-mng/actions/workflows/ci.yml/badge.svg)](https://github.com/med-mng/med-mng/actions/workflows/ci.yml) ![version](https://img.shields.io/badge/version-0.1.0-blue) ![license](https://img.shields.io/badge/license-MIT-green)


This repository contains the server side of the MED-MNG platform. It exposes a set of Supabase edge functions and background workers used to manage medical learning content generated from musical AI.

## Technologies

- **Supabase** for database and authentication
- **Deno** based edge functions for the public API
- **Node.js** worker scripts
- **TypeScript** across the codebase
- **pnpm** monorepo for package management

## Project Structure

```
/apps
  api/       Supabase edge functions
  cron/      Scheduled jobs
  worker/    Background queue consumer
/packages
  shared/    Shared utilities
/supabase    Database functions and migrations
/src         Application specific helpers and scripts
```

## Setup

1. Install dependencies

```bash
pnpm install
```

2. Copy `.env.example` to `.env` and adjust values

```bash
cp .env.example .env
```

## Error Handling

All backend endpoints must return explicit errors with the correct HTTP status code. See [docs/errors.md](docs/errors.md) for the full policy.

3. Start Supabase locally

```bash
supabase start
```

4. Launch the development server

```bash
pnpm dev
```

To start the API server only:

```bash
pnpm start:server
```

### Docker

```bash
docker build -t med-mng .
docker run -p 3000:3000 med-mng
```

## Key Endpoints

The main API is served from the `med-mng-api` edge function.

- `POST /songs` – create a new song
- `GET /songs/:id/stream` – stream a generated track
- `POST /songs/:id/like` – toggle like
- `GET /songs/:id/lyrics` – fetch lyrics from Suno
- `GET /library` – list saved songs and learning items
- `POST /subscriptions/checkout` – create Stripe checkout session
- `GET /quota` – remaining generation quota
- `GET /verify-item/:id` – validate a learning item

All routes require Supabase authentication and return JSON.

## Data Quality

Run automatic cleaning and anomaly checks for OIC data with:

```bash
pnpm ts-node scripts/auto-clean-oic.ts
```

See [docs/data-cleaning.md](docs/data-cleaning.md) for details.

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss any major changes.

## Contact

For any question about this backend, please contact the original maintainers or open an issue on the repository.

## Parser Test Guide

Critical data parsers such as `parseOICContent` and `EDNItemParser` are covered by Jest tests located in the `test/` directory. To add a new parser test:

1. Create a `*.test.ts` file under `test/`.
2. Import the parser function using a relative path.
3. Provide sample input objects that mimic the structure returned by the external APIs.
4. Assert on the parsed output and edge cases (invalid input, missing fields, etc.).

Run `pnpm test` locally or push a branch to trigger the CI workflow which blocks merges if any test fails.
