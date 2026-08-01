import { registerPushSubscription } from "@/app/actions/reminder";

export type PushSetupResult =
  | { ok: true }
  | {
      ok: false;
      reason: "unsupported" | "ios-needs-install" | "denied" | "error";
      message: string;
    };

/** VAPID public keys are base64url; PushManager wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded.replace(/-/g, "+").replace(/_/g, "/"));
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function isIos(): boolean {
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    // iPadOS reports as Mac, distinguishable only by touch support.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isInstalledPwa(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // Non-standard, but the only signal Safari gives.
    (window.navigator as { standalone?: boolean }).standalone === true
  );
}

/** True when this device already has permission — no prompt is shown. */
export function isPushGranted(): boolean {
  return (
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );
}

export function isPushBlocked(): boolean {
  return (
    typeof Notification !== "undefined" && Notification.permission === "denied"
  );
}

/**
 * Ask for notification permission (if not already answered), subscribe this
 * device, and persist the subscription.
 *
 * Browsers only allow one permission prompt per origin — once denied, it can
 * never be re-requested programmatically — so this is called from a deliberate
 * user action rather than on page load.
 */
export async function enablePushOnThisDevice(): Promise<PushSetupResult> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    return isIos() && !isInstalledPwa()
      ? {
          ok: false,
          reason: "ios-needs-install",
          message:
            "On iPhone and iPad, notifications only work once Streaks is added to your Home Screen. Tap Share → Add to Home Screen, then try again.",
        }
      : {
          ok: false,
          reason: "unsupported",
          message: "This browser doesn't support push notifications.",
        };
  }

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!vapidKey) {
    return {
      ok: false,
      reason: "error",
      message:
        "Notifications aren't configured (missing NEXT_PUBLIC_VAPID_PUBLIC_KEY).",
    };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        ok: false,
        reason: "denied",
        message:
          "Notifications are blocked for this site. Re-enable them in your browser's site settings, then try again.",
      };
    }

    const registration = await navigator.serviceWorker.ready;
    const subscription =
      (await registration.pushManager.getSubscription()) ??
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey) as BufferSource,
      }));

    const json = subscription.toJSON();
    if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
      return {
        ok: false,
        reason: "error",
        message: "The browser returned an incomplete push subscription.",
      };
    }

    await registerPushSubscription({
      endpoint: json.endpoint,
      keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
    });
    return { ok: true };
  } catch (error) {
    console.error("[push] enable failed:", error);
    return {
      ok: false,
      reason: "error",
      message:
        error instanceof Error
          ? error.message
          : "Couldn't enable notifications on this device.",
    };
  }
}
