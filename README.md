# Mameyuflas World Cup

Advanced FIFA World Cup 2026 prediction app with match picks, group standings, knockout brackets, special awards, private leagues, live sync, and real-time rankings.

## Overview

Mameyuflas World Cup is a social prediction platform built around the 2026 World Cup format.
Users can:

- predict every group-stage score
- rank final group standings
- rank the best third-placed teams
- complete the full knockout bracket
- pick tournament specials such as champion, MVP, top scorer, and more
- compete in private leagues and live leaderboards

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Backend / DB | Supabase (Auth, Postgres, Storage, RLS) |
| State | TanStack Query v5 + Zustand v5 |
| Validation | Zod v4 |
| Styling | Tailwind CSS v4 |
| Deployment | Vercel |

## Main Features

- Classic prediction mode with full tournament lock at kickoff
- Group-stage scoring rules and knockout scoring engine
- Group standings and best-third predictions
- Knockout bracket with winner and after-120-minute score inputs
- Tournament special picks
- Admin match management
- External match/stat syncing through scheduled cron routes

## Local Setup

Requirements:

- Node.js 20+
- npm 10+
- Supabase project
- Vercel account for production deploys

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the required values in `.env.local`.

Key variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_ID`
- `API_FOOTBALL_KEY`
- `CRON_SECRET`

### 3. Run the app

```bash
npm run dev
```

Open `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run type-check` | Run TypeScript checks |
| `npm run lint` | Run ESLint |
| `npm run supabase:types` | Regenerate Supabase TypeScript types |

## Database and Migrations

Supabase migrations live in [supabase/migrations](supabase/migrations).

Recent prediction-related additions include:

- group standing predictions
- best third-team predictions
- extended tournament specials
- knockout after-120-minute score fields

## Match and Stats Sync

The project includes Vercel cron routes for external data sync:

- `/api/cron/sync-matches`
- `/api/cron/sync-daily-stats`

These routes use:

- `API_FOOTBALL_KEY`
- `CRON_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`

## Scoring

The scoring rules are configured in:

- [lib/constants/scoring.ts](lib/constants/scoring.ts)

The scoring engine lives in:

- [lib/utils/scoring.ts](lib/utils/scoring.ts)

Note:
The rules engine is implemented, but if you want full automatic point settlement after real results arrive, make sure the backend settlement flow is wired to update `points_earned` across prediction tables.

## Documentation

- [Architecture](docs/architecture.md)
- [Product Brief](docs/product-brief.md)
- [UI Direction](docs/ui-direction.md)
- [Database Plan](docs/database-plan.md)
- [Agent Guide](CLAUDE.md)

## Production

The app is deployed on Vercel and uses Supabase as the production database.

Production deploys can require:

- valid `vercel.json` cron configuration
- linked Vercel project
- linked Supabase project
- remote database password for `supabase db push`

## License

Private project. All rights reserved.
