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

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss any major changes.

## Contact

For any question about this backend, please contact the original maintainers or open an issue on the repository.
