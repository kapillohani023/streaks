import "server-only";
import webpush from "web-push";
import { prisma } from "@/lib/db";

export interface PushPayload {
  title: string;
  body: string;
  /** Path the service worker opens/focuses on click. */
  url: string;
  /** Collapse key — a re-send replaces the old notification instead of stacking. */
  tag: string;
}

export interface PushResult {
  sent: number;
  failed: number;
  /** Subscriptions the push service reported as gone, now deleted. */
  pruned: number;
}

let vapidConfigured = false;

/** True when the VAPID env vars are present; lets callers degrade gracefully. */
export function isPushConfigured(): boolean {
  return Boolean(
    (process.env.VAPID_PUBLIC_KEY ??
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) &&
    process.env.VAPID_PRIVATE_KEY
  );
}

function configureVapid() {
  if (vapidConfigured) return;

  const publicKey =
    process.env.VAPID_PUBLIC_KEY ?? process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT;

  if (!publicKey || !privateKey) {
    throw new Error(
      "Push is not configured: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY"
    );
  }
  if (!subject) {
    throw new Error(
      "Push is not configured: set VAPID_SUBJECT (e.g. mailto:you@example.com)"
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
}

/** Register (or refresh) a device's subscription for a user. */
export async function saveSubscription(
  userId: string,
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } }
) {
  // Endpoints are unique but can be re-issued to a different account on a
  // shared browser, so upsert rather than assuming it's ours already.
  await prisma.pushSubscription.upsert({
    where: { endpoint: subscription.endpoint },
    create: {
      userId,
      endpoint: subscription.endpoint,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
    update: {
      userId,
      p256dh: subscription.keys.p256dh,
      auth: subscription.keys.auth,
    },
  });
}

/**
 * Fan a notification out to every device the user has registered.
 *
 * Uses allSettled so one dead endpoint can't abort delivery to the others, and
 * deletes subscriptions the push service reports as 404/410 (Gone) — that is
 * the only signal we get that a browser was reinstalled or site data cleared.
 */
export async function sendPushToUser(
  userId: string,
  payload: PushPayload
): Promise<PushResult> {
  configureVapid();

  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });
  if (subscriptions.length === 0) return { sent: 0, failed: 0, pruned: 0 };

  const body = JSON.stringify(payload);

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webpush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        body
      )
    )
  );

  const stale: string[] = [];
  let sent = 0;
  let failed = 0;

  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      sent += 1;
      return;
    }
    failed += 1;
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      stale.push(subscriptions[index].endpoint);
    } else {
      console.error(
        `[push] send failed for ${subscriptions[index].endpoint}:`,
        result.reason
      );
    }
  });

  if (stale.length > 0) {
    await prisma.pushSubscription.deleteMany({
      where: { endpoint: { in: stale } },
    });
  }

  return { sent, failed, pruned: stale.length };
}
