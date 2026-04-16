// Custom service worker logic layered on top of the generated Workbox worker.

const OFFLINE_SPENDING_CACHE = "offline-spending";
const OFFLINE_FALLBACK_CACHE = "eva-offline-fallback";
const WIDGET_TAG = "eva-daily-snapshot";
const OFFLINE_URL = "/offline.html";

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-financial-data") {
    event.waitUntil(syncFinancialData());
  }
});

async function syncFinancialData() {
  try {
    const cache = await caches.open(OFFLINE_SPENDING_CACHE);
    const requests = await cache.keys();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) {
        continue;
      }

      const data = await response.json();
      await fetch(request.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(data.headers || {}),
        },
        body: JSON.stringify(data.body || {}),
      });

      await cache.delete(request);
    }
  } catch (error) {
    console.error("[SW] Background sync failed:", error);
  }
}

self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-insights") {
    event.waitUntil(checkInsights());
  }

  if (event.tag === "check-stock-alerts") {
    event.waitUntil(checkStockAlerts());
  }

  if (event.tag === WIDGET_TAG) {
    event.waitUntil(updateDailySnapshotWidget());
  }
});

async function checkInsights() {
  try {
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.postMessage({ type: "CHECK_INSIGHTS" }));
  } catch (error) {
    console.error("[SW] Periodic sync failed:", error);
  }
}

async function checkStockAlerts() {
  try {
    const clients = await self.clients.matchAll({ type: "window" });
    clients.forEach((client) => client.postMessage({ type: "CHECK_STOCK_ALERTS" }));
  } catch (error) {
    console.error("[SW] Stock alert sync failed:", error);
  }
}

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "eva";
  const options = {
    body: data.body || "You have a new insight from eva.",
    icon: "/pwa-icon-192.png",
    badge: "/pwa-icon-192.png",
    tag: data.tag || "eva-notification",
    data: { url: data.url || "/" },
    actions: data.actions || [
      { action: "open", title: "View" },
      { action: "dismiss", title: "Dismiss" },
    ],
    vibrate: [100, 50, 100],
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") {
    return;
  }

  const urlToOpen = event.notification.data?.url || "/";

  event.waitUntil(focusOrOpenUrl(urlToOpen));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    Promise.all([
      warmOfflineFallback(),
      updateDailySnapshotWidget(),
    ]),
  );
});

self.addEventListener("widgetinstall", (event) => {
  if (event.widget.tag === WIDGET_TAG) {
    event.waitUntil(updateDailySnapshotWidget(event.widget));
  }
});

self.addEventListener("widgetresume", (event) => {
  if (event.widget.tag === WIDGET_TAG) {
    event.waitUntil(updateDailySnapshotWidget(event.widget));
  }
});

self.addEventListener("widgetclick", (event) => {
  const action = event.action || event.target || "";
  const destination =
    action === "open-dashboard" ? "/dashboard" : "/chat";

  event.waitUntil(focusOrOpenUrl(destination));
});

async function warmOfflineFallback() {
  try {
    const cache = await caches.open(OFFLINE_FALLBACK_CACHE);
    await cache.add(OFFLINE_URL);
  } catch {
    // The generated precache remains the primary offline shell; this fallback is best-effort only.
  }
}

async function focusOrOpenUrl(url) {
  const clientList = await self.clients.matchAll({
    type: "window",
    includeUncontrolled: true,
  });

  for (const client of clientList) {
    if (client.url.includes(url) && "focus" in client) {
      return client.focus();
    }
  }

  return self.clients.openWindow(url);
}

async function getWidgetTemplate(widget) {
  const definition = widget?.definition || {};
  const templateUrl = definition.msAcTemplate || definition.ms_ac_template || "widgets/eva-daily-snapshot.template.json";
  const response = await fetch(templateUrl);
  return response.json();
}

async function getWidgetData(widget) {
  const definition = widget?.definition || {};
  const dataUrl = definition.data || "widgets/eva-daily-snapshot.data.json";
  const response = await fetch(dataUrl);
  return response.json();
}

async function updateDailySnapshotWidget(widgetInstance) {
  if (!self.widgets?.getByTag) {
    return;
  }

  const widget =
    widgetInstance || (await self.widgets.getByTag(WIDGET_TAG));

  if (!widget) {
    return;
  }

  const [template, data] = await Promise.all([
    getWidgetTemplate(widget),
    getWidgetData(widget),
  ]);

  await widget.render(template, data);
}

self.addEventListener("message", (event) => {
  if (!event.data) {
    return;
  }

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  if (event.data.type === "QUEUE_OFFLINE_REQUEST" && event.data.url) {
    event.waitUntil(
      caches.open(OFFLINE_SPENDING_CACHE).then((cache) =>
        cache.put(
          new Request(event.data.url),
          new Response(
            JSON.stringify({
              headers: event.data.headers || {},
              body: event.data.body || {},
            }),
            {
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      ),
    );
  }

  if (event.data.type === "UPDATE_WIDGET") {
    event.waitUntil(updateDailySnapshotWidget());
  }
});
