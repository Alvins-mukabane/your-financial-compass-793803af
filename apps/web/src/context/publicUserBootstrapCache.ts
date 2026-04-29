import type { BootstrapData } from "@/lib/evaContracts";
import { getEmptyBootstrap } from "@/lib/workspaceData";
import type { WorkspaceUser } from "./publicUserTypes";

const BOOTSTRAP_CACHE_KEY = "eva-workspace-cache";

export function readCachedBootstrap(userId: string) {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BOOTSTRAP_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as BootstrapData;
    return cached.user_id === userId ? cached : null;
  } catch {
    return null;
  }
}

export function writeCachedBootstrap(bootstrap: BootstrapData) {
  if (typeof window === "undefined" || !bootstrap.user_id) {
    return;
  }

  window.localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(bootstrap));
}

export function clearCachedBootstrap() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BOOTSTRAP_CACHE_KEY);
}

export function buildWorkspaceFallbackBootstrap(
  activeBootstrap: BootstrapData,
  targetUser: WorkspaceUser | null,
) {
  if (!targetUser) {
    return getEmptyBootstrap();
  }

  const cached = readCachedBootstrap(targetUser.id);
  const canReuseActiveBootstrap =
    activeBootstrap.user_id === targetUser.id &&
    (activeBootstrap.has_onboarded ||
      Boolean(activeBootstrap.profile) ||
      activeBootstrap.goals.length > 0 ||
      activeBootstrap.budget_limits.length > 0 ||
      activeBootstrap.spending_events.length > 0 ||
      activeBootstrap.financial_entries.length > 0 ||
      activeBootstrap.subscriptions.length > 0);

  return (
    cached ??
    (canReuseActiveBootstrap
      ? activeBootstrap
      : getEmptyBootstrap(targetUser.id, targetUser.email ?? null))
  );
}
