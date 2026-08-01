"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { syncTimezone } from "@/app/actions/reminder";

const STORAGE_KEY = "streaks-synced-timezone";

/**
 * Keeps `User.timezone` in step with the browser.
 *
 * The server runs in UTC, so the user's zone is what decides both when their
 * reminders fire and what counts as "today". The last synced value is cached in
 * localStorage so this is a no-op on almost every load, and re-syncs by itself
 * when the value changes — travel, a move, or a corrected OS clock.
 */
export function TimezoneSync() {
  const { data: session, status } = useSession();
  // Keyed by email, not id: the server action resolves the user from the
  // session itself, so the client only needs to know *which* account it has
  // already synced for — and a browser shared by two accounts must sync both.
  const email = session?.user?.email;

  useEffect(() => {
    if (status !== "authenticated" || !email) return;

    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (!detected) return;

    const cacheKey = `${STORAGE_KEY}:${email}`;
    try {
      if (localStorage.getItem(cacheKey) === detected) return;
    } catch {
      // Private mode / storage disabled — fall through and just sync.
    }

    syncTimezone(detected)
      .then((result) => {
        if (!result.ok) {
          console.error("[timezone] sync rejected:", result.error);
          return;
        }
        try {
          localStorage.setItem(cacheKey, detected);
        } catch {}
      })
      .catch((error) => {
        // Never fatal, but never silent either: a failed sync leaves the user
        // on UTC, which quietly fires every reminder at the wrong hour.
        console.error("[timezone] sync failed:", error);
      });
  }, [status, email]);

  return null;
}
