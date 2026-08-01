self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {});

const FALLBACK_URL = "/streaks";

self.addEventListener("push", (event) => {
  let payload = {};
  try {
    payload = event.data ? event.data.json() : {};
  } catch {
    // A push that isn't our JSON shape still deserves to be shown.
    payload = { body: event.data ? event.data.text() : "" };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title || "Streaks", {
      body: payload.body || "",
      icon: "/logo-192.png",
      badge: "/logo-192.png",
      // Tagged per streak so a re-send replaces the old one instead of
      // stacking up a column of identical nudges.
      tag: payload.tag || "streaks",
      renotify: true,
      data: { url: payload.url || FALLBACK_URL },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url =
    (event.notification.data && event.notification.data.url) || FALLBACK_URL;

  event.waitUntil(
    (async () => {
      const windows = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Prefer a tab already on the target page, then reuse any open tab,
      // and only open a new window as a last resort.
      const onTarget = windows.find(
        (client) => new URL(client.url).pathname === url
      );
      if (onTarget) return onTarget.focus();

      const anyWindow = windows[0];
      if (anyWindow && "navigate" in anyWindow) {
        const navigated = await anyWindow.navigate(url);
        return (navigated || anyWindow).focus();
      }

      return self.clients.openWindow(url);
    })()
  );
});
