# Streaks

Personal habit tracker with daily check-ins, a journal, a todo board, Web Push reminders, and an AI chat that can act on your streaks and todos through MCP.

Stack: Next.js 16, React 19, Prisma, PostgreSQL, NextAuth (Google), bun, Tailwind CSS 4.

## Run locally

You need bun, PostgreSQL, and a Google OAuth client.

1. Install dependencies:

```bash
bun install
```

2. Copy the environment variables below into `.env` and fill in real values.

3. Apply migrations:

```bash
bunx prisma migrate deploy
```

4. Start the app:

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated requests redirect to `/signin`.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `AUTH_SECRET` | yes | NextAuth secret |
| `AUTH_URL` | yes | Public origin, for example `http://localhost:3000` |
| `GOOGLE_CLIENT_ID` | yes | Google OAuth client id |
| `GOOGLE_CLIENT_SECRET` | yes | Google OAuth client secret |
| `VAPID_PUBLIC_KEY` | for reminders | From `bun x web-push generate-vapid-keys` |
| `VAPID_PRIVATE_KEY` | for reminders | Same keypair |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | for reminders | Same value as `VAPID_PUBLIC_KEY`. Inlined at build time |
| `VAPID_SUBJECT` | for reminders | `mailto:` contact for the push service |
| `CRON_SECRET` | for reminders | Bearer token for `GET /api/cron/reminders` |
| `T2A_API_URL` | for AI chat | Upstream agent endpoint |
| `T2A_API_BEARER_TOKEN` | for AI chat | Bearer token for that endpoint |
| `MCP_SERVER_SECRET` | for MCP | Shared secret for `POST /api/mcp` |

Generate VAPID keys once:

```bash
bun x web-push generate-vapid-keys
```

## Features

- **Streaks.** Create habits, mark days complete with optional notes, edit or delete entries, and view heatmaps and milestones.
- **Dashboard.** Daily check-in, focus streak, week bars, and yearly activity.
- **Journal.** Dated entries with a calendar, search, and a writing streak.
- **Todos.** Three-column board (`todo`, `doing`, `done`) with drag reorder.
- **Reminders.** Per-streak daily Web Push at a local wall-clock time in the user's timezone.
- **AI chat.** `/ai` talks to an upstream agent that calls streak and todo tools on `/api/mcp`.
- **PWA.** Installable; iOS Web Push works only after you add the app to the Home Screen.

## Streak reminders

Each streak can store `reminder_enabled` and `reminder_time`. Time is local wall-clock in `users.timezone` (set from the browser). Delivery is Web Push to every registered device.

Nothing in the app runs on a timer. Ping the cron route from outside the process:

- URL: `https://<your-domain>/api/cron/reminders`
- Schedule: every 5 minutes
- Header: `Authorization: Bearer <CRON_SECRET>`

`proxy.ts` excludes `/api/cron` and `/api/mcp` from the session gate. Those routes authenticate with shared secrets. Without the exclusion, the proxy redirects the scheduler to `/signin` and the job never runs.

Each run returns JSON (`checked`, `sent`, `failed`, `pruned`, `skippedCompleted`, `undeliverable`). Use that response as the job log.

A reminder fires on the first tick at or after its local time, within a 30-minute grace window (`GRACE_WINDOW_MINUTES` in `lib/reminders.ts`), at most once per user-local day, and only if the streak is not already complete that day.

Notes:

- Enabling a reminder saves the preference even when the device has no notification permission. The UI says so instead of discarding the write.
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` must be present at build time, not only at runtime.

## Docker

The image runs migrations, then `next start`:

```bash
docker build --build-arg NEXT_PUBLIC_VAPID_PUBLIC_KEY=<key> -t streaks .
docker run --env-file .env -p 3000:3000 streaks
```

Pushes to `main` deploy through `.github/workflows/deploy.yml` (service `streaks`, plus `streaks-cron`).

## Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Dev server |
| `bun run build` | Production build |
| `bun run start` | Production server |
| `bun run lint` | ESLint |
| `bun run format` | Prettier write |
| `bunx prisma migrate deploy` | Apply migrations |
| `bunx prisma generate` | Regenerate Prisma client |
