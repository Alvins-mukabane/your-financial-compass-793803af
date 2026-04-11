import { useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  getFileLaunchStarter,
  getShareOrProtocolStarter,
  saveChatStarter,
  syncWindowControlsOverlay,
} from "@/lib/pwa";

type PeriodicSyncManagerLike = {
  getTags: () => Promise<string[]>;
  register: (tag: string, options: { minInterval: number }) => Promise<void>;
};

type LaunchQueueLike = {
  setConsumer: (
    consumer: (launchParams: {
      files?: readonly Array<{
        getFile: () => Promise<File>;
        name?: string;
      }>;
    }) => void | Promise<void>,
  ) => void;
};

export default function PwaRuntime() {
  const navigate = useNavigate();
  const location = useLocation();
  const handledSearchRef = useRef<string>("");

  useEffect(() => syncWindowControlsOverlay(), []);

  useEffect(() => {
    if (!import.meta.env.PROD || !("serviceWorker" in navigator)) {
      return;
    }

    void navigator.serviceWorker.ready.then(async (registration) => {
      if (!registration) {
        return;
      }

      const periodicSync = (registration as ServiceWorkerRegistration & {
        periodicSync?: PeriodicSyncManagerLike;
      }).periodicSync;

      if (!periodicSync) {
        return;
      }

      try {
        const tags = await periodicSync.getTags();

        if (!tags.includes("check-insights")) {
          await periodicSync.register("check-insights", {
            minInterval: 1000 * 60 * 60 * 12,
          });
        }

        if (!tags.includes("check-stock-alerts")) {
          await periodicSync.register("check-stock-alerts", {
            minInterval: 1000 * 60 * 60 * 12,
          });
        }
      } catch {
        // Periodic sync is optional and may be unavailable depending on install state/browser support.
      }
    }).catch(() => {
      // Ignore optional background capability registration failures.
    });
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const launchQueue = (window as Window & {
      launchQueue?: LaunchQueueLike;
    }).launchQueue;

    if (!launchQueue?.setConsumer) {
      return;
    }

    launchQueue.setConsumer(async (launchParams) => {
      const starter = await getFileLaunchStarter(launchParams.files);

      if (!starter) {
        return;
      }

      saveChatStarter(starter);
      toast.success("Your file is ready in AI Advisor.");
      navigate("/chat");
    });
  }, [navigate]);

  useEffect(() => {
    const { pathname, search } = location;
    const starter = getShareOrProtocolStarter(search);

    if (!starter) {
      return;
    }

    const signature = `${pathname}${search}`;
    if (handledSearchRef.current === signature) {
      return;
    }

    handledSearchRef.current = signature;
    saveChatStarter(starter);

    if (pathname !== "/chat") {
      toast.success("Shared content is ready in AI Advisor.");
      navigate("/chat", { replace: true });
    }
  }, [location, navigate]);

  return null;
}
