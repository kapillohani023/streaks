import { timingSafeEqual } from "node:crypto";
import { runDueReminders } from "@/lib/reminders";
import { isPushConfigured } from "@/lib/push";

export const runtime = "nodejs";
// Never cached: the whole point is to re-evaluate the clock on every hit.
export const dynamic = "force-dynamic";

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  });
}

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const expected = Buffer.from(`Bearer ${secret}`);
  const provided = Buffer.from(request.headers.get("authorization") ?? "");
  return (
    expected.length === provided.length && timingSafeEqual(expected, provided)
  );
}

/**
 * Reminder tick. Driven by cron-job.org every 5 minutes with an
 * `Authorization: Bearer <CRON_SECRET>` header.
 *
 * Returns a counts summary so the scheduler's own request log doubles as the
 * observability story — a run that stops reporting, or starts reporting
 * `undeliverable`, is visible there without any extra tooling.
 */
async function handle(request: Request): Promise<Response> {
  if (!authorized(request)) {
    return json({ error: "Unauthorized" }, 401);
  }
  if (!isPushConfigured()) {
    return json({ error: "Push is not configured (missing VAPID keys)" }, 503);
  }

  try {
    const startedAt = Date.now();
    const summary = await runDueReminders();
    return json({ ...summary, durationMs: Date.now() - startedAt });
  } catch (error) {
    console.error("[cron/reminders] run failed:", error);
    return json(
      { error: error instanceof Error ? error.message : String(error) },
      500
    );
  }
}

export { handle as GET, handle as POST };
