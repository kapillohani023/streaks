This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Streak reminders (Web Push)

Each streak can have a daily reminder. The preference lives on the streak
(`reminder_enabled`, `reminder_time`), the time is local wall-clock in the
owner's timezone (`users.timezone`, auto-detected from the browser), and
delivery is Web Push to every device the user has registered.

### Environment

```bash
# Generate a keypair once:  bun x web-push generate-vapid-keys
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...   # same value as VAPID_PUBLIC_KEY
VAPID_SUBJECT=mailto:you@example.com

# Shared secret for the reminder cron endpoint
CRON_SECRET=...
```

`NEXT_PUBLIC_VAPID_PUBLIC_KEY` is inlined at build time, so it must be set in
the build environment, not just at runtime.

### Scheduler

Nothing in the app runs on a timer. `GET /api/cron/reminders` has to be pinged
externally — set up a job on [cron-job.org](https://cron-job.org):

- **URL**: `https://<your-domain>/api/cron/reminders`
- **Schedule**: every 5 minutes
- **Header**: `Authorization: Bearer <CRON_SECRET>`

Each run returns a JSON summary (`checked`, `sent`, `failed`, `pruned`,
`skippedCompleted`, `undeliverable`), which cron-job.org stores in its request
log — that log is the observability story for reminders.

A reminder fires on the first tick at or after its local time, within a
30-minute grace window (`GRACE_WINDOW_MINUTES` in `lib/reminders.ts`), at most
once per user-local day, and only if the streak isn't already completed that
day. The grace window is what makes a missed or delayed tick recoverable.

### Notes

- iOS only allows Web Push once the PWA is installed to the Home Screen.
- Enabling a reminder saves the preference even when the device has no
  notification permission — the UI says so rather than silently discarding it.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
