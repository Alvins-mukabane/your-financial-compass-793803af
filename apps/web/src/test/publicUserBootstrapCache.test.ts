import { afterEach, describe, expect, it } from "vitest";
import {
  buildWorkspaceFallbackBootstrap,
  clearCachedBootstrap,
  readCachedBootstrap,
  writeCachedBootstrap,
} from "@/context/publicUserBootstrapCache";
import { getEmptyBootstrap } from "@/lib/workspaceData";

describe("publicUserBootstrapCache", () => {
  afterEach(() => {
    clearCachedBootstrap();
    window.localStorage.clear();
  });

  it("reads back a cached bootstrap for the same user", () => {
    const bootstrap = {
      ...getEmptyBootstrap("user-1", "one@example.com"),
      has_onboarded: true,
    };

    writeCachedBootstrap(bootstrap);

    expect(readCachedBootstrap("user-1")).toEqual(bootstrap);
    expect(readCachedBootstrap("user-2")).toBeNull();
  });

  it("reuses the active bootstrap when it already has real workspace data", () => {
    const activeBootstrap = {
      ...getEmptyBootstrap("user-1", "one@example.com"),
      has_onboarded: true,
    };

    const fallback = buildWorkspaceFallbackBootstrap(activeBootstrap, {
      id: "user-1",
      email: "one@example.com",
    });

    expect(fallback).toEqual(activeBootstrap);
  });

  it("falls back to an empty bootstrap for a different user without cache", () => {
    const activeBootstrap = {
      ...getEmptyBootstrap("user-1", "one@example.com"),
      has_onboarded: true,
    };

    const fallback = buildWorkspaceFallbackBootstrap(activeBootstrap, {
      id: "user-2",
      email: "two@example.com",
    });

    expect(fallback.user_id).toBe("user-2");
    expect(fallback.email).toBe("two@example.com");
    expect(fallback.has_onboarded).toBe(false);
  });
});
