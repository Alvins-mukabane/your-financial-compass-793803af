let monitoringInitialized = false;

function scheduleMonitoringStart(callback: () => void) {
  if (typeof window === "undefined") {
    return;
  }

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(() => callback(), { timeout: 3000 });
    return;
  }

  window.setTimeout(callback, 1200);
}

export function initMonitoring() {
  if (!import.meta.env.PROD || typeof window === "undefined" || monitoringInitialized) {
    return;
  }

  monitoringInitialized = true;

  scheduleMonitoringStart(() => {
    void import("@sentry/react").then((Sentry) => {
      Sentry.init({
        dsn: "https://5e04a086428c0c1bb2d1f9ac7cdd536b@o4511157792538624.ingest.us.sentry.io/4511157800468480",
        sendDefaultPii: true,
        integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
        tracesSampleRate: 1.0,
        tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
      });
    });
  });
}
