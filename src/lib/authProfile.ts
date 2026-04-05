import type { User } from "@supabase/supabase-js";
import type { UserProfile } from "@/lib/evaContracts";

export type AuthProfileSeed = {
  full_name: string;
  first_name: string;
  last_name: string;
  country: string;
  phone_number: string;
  updates_opt_in: boolean;
  password_setup_completed: boolean;
};

export type PasswordStrengthLevel = "weak" | "medium" | "strong";

function readString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readBoolean(value: unknown, fallback = false) {
  if (typeof value === "boolean") {
    return value;
  }

  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true") return true;
    if (normalized === "false") return false;
  }

  return fallback;
}

export function splitFullName(fullName: string) {
  const cleaned = fullName.trim().replace(/\s+/g, " ");
  if (!cleaned) {
    return { first_name: "", last_name: "" };
  }

  const [first_name, ...rest] = cleaned.split(" ");
  return {
    first_name,
    last_name: rest.join(" "),
  };
}

export function getAuthProfileSeed(user: User | null): AuthProfileSeed {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const explicitFirstName = readString(metadata.first_name);
  const explicitLastName = readString(metadata.last_name);
  const full_name = readString(metadata.full_name);
  const parsedName = full_name ? splitFullName(full_name) : { first_name: "", last_name: "" };

  return {
    full_name:
      full_name ||
      [explicitFirstName || parsedName.first_name, explicitLastName || parsedName.last_name]
        .filter(Boolean)
        .join(" "),
    first_name: explicitFirstName || parsedName.first_name,
    last_name: explicitLastName || parsedName.last_name,
    country: readString(metadata.country) || "United States",
    phone_number: readString(metadata.phone_number),
    updates_opt_in: readBoolean(metadata.updates_opt_in, true),
    password_setup_completed: readBoolean(metadata.password_setup_completed),
  };
}

export function getResolvedProfileField(
  profileValue: string | null | undefined,
  fallbackValue: string,
) {
  const normalizedProfileValue = readString(profileValue);
  return normalizedProfileValue || fallbackValue;
}

export function hasPasswordSetup(
  user: User | null,
  profile: Pick<UserProfile, "password_setup_completed"> | null,
) {
  const seed = getAuthProfileSeed(user);
  return Boolean(profile?.password_setup_completed || seed.password_setup_completed);
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 10,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /\d/.test(password),
    symbol: /[^A-Za-z0-9]/.test(password),
  };

  const passedChecks = Object.values(checks).filter(Boolean).length;
  const isStrong = Object.values(checks).every(Boolean);

  let level: PasswordStrengthLevel = "weak";
  if (isStrong) {
    level = "strong";
  } else if (passedChecks >= 3 && password.length >= 8) {
    level = "medium";
  }

  return {
    level,
    checks,
    isStrong,
  };
}
