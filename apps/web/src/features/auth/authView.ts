import type { PasswordStrengthLevel } from "@/lib/authProfile";
import { Brain, ShieldCheck, Target } from "lucide-react";

export type AuthMode = "signin" | "signup" | "verify-email" | "set-password";
export type VerificationFlow = "signup" | "legacy";
export type VerificationMethod = "magic-link" | "code";

export const VERIFY_EMAIL_AUTO_RESEND_KEY = "eva-pending-verification-email";
export const VERIFY_EMAIL_AUTO_RESEND_DELAY_SECONDS = 12;

export function readLastEmail() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("eva-last-email") ?? "";
}

export function persistLastEmail(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem("eva-last-email", email);
}

export function queueVerificationAutoResend(email: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(
    VERIFY_EMAIL_AUTO_RESEND_KEY,
    JSON.stringify({
      email: email.trim().toLowerCase(),
      queuedAt: Date.now(),
    }),
  );
}

export function consumeVerificationAutoResend(email: string) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const raw = window.sessionStorage.getItem(VERIFY_EMAIL_AUTO_RESEND_KEY);
    if (!raw) {
      return false;
    }

    const parsed = JSON.parse(raw) as { email?: string; queuedAt?: number };
    window.sessionStorage.removeItem(VERIFY_EMAIL_AUTO_RESEND_KEY);

    if (parsed.email !== email.trim().toLowerCase()) {
      return false;
    }

    return typeof parsed.queuedAt === "number" && Date.now() - parsed.queuedAt < 5 * 60_000;
  } catch {
    window.sessionStorage.removeItem(VERIFY_EMAIL_AUTO_RESEND_KEY);
    return false;
  }
}

export function getMode(value: string | null): AuthMode {
  if (value === "signup" || value === "verify-email" || value === "set-password") {
    return value;
  }
  return "signin";
}

export function getVerificationFlow(value: string | null): VerificationFlow {
  return value === "legacy" ? "legacy" : "signup";
}

export function getStrengthLabel(level: PasswordStrengthLevel) {
  if (level === "strong") return "Strong";
  if (level === "medium") return "Medium";
  return "Weak";
}

export const authHighlights = [
  {
    icon: ShieldCheck,
    title: "Verified access first",
    description: "Every EVA account is confirmed by email before the workspace opens.",
  },
  {
    icon: Brain,
    title: "One canonical money record",
    description: "Your dashboard, history, statements, and insights stay anchored to the same data.",
  },
  {
    icon: Target,
    title: "Onboarding with a real next step",
    description: "New users verify, onboard, and land in a workspace that already knows what to focus on.",
  },
];
