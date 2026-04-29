import { afterEach, describe, expect, it, vi } from "vitest";
import {
  consumeVerificationAutoResend,
  getMode,
  getVerificationFlow,
  persistLastEmail,
  queueVerificationAutoResend,
  readLastEmail,
} from "@/features/auth/authView";

describe("authView helpers", () => {
  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it("defaults unknown mode values to signin", () => {
    expect(getMode(null)).toBe("signin");
    expect(getMode("unexpected")).toBe("signin");
    expect(getMode("signup")).toBe("signup");
  });

  it("parses verification flow safely", () => {
    expect(getVerificationFlow("legacy")).toBe("legacy");
    expect(getVerificationFlow("signup")).toBe("signup");
    expect(getVerificationFlow("anything-else")).toBe("signup");
  });

  it("stores and reads the last email", () => {
    persistLastEmail("person@example.com");
    expect(readLastEmail()).toBe("person@example.com");
  });

  it("consumes queued verification resend state only for the matching email", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_000);
    queueVerificationAutoResend("person@example.com");

    vi.spyOn(Date, "now").mockReturnValue(2_000);
    expect(consumeVerificationAutoResend("person@example.com")).toBe(true);
    expect(consumeVerificationAutoResend("person@example.com")).toBe(false);
  });
});
