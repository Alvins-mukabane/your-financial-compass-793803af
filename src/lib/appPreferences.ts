export type SettingsSection =
  | "settings"
  | "profile"
  | "account"
  | "notifications"
  | "billing"
  | "help"
  | "feedback";

export type FontScale = "16" | "17" | "18" | "20";

export type AppPreferences = {
  fontScale: FontScale;
  reducedMotion: boolean;
};

export const SETTINGS_SECTIONS: SettingsSection[] = [
  "settings",
  "profile",
  "account",
  "notifications",
  "billing",
  "help",
  "feedback",
];

export const FONT_SCALE_OPTIONS: FontScale[] = ["16", "17", "18", "20"];

export const DEFAULT_SETTINGS_SECTION: SettingsSection = "settings";
export const DEFAULT_APP_PREFERENCES: AppPreferences = {
  fontScale: "17",
  reducedMotion: false,
};

const APP_PREFERENCES_STORAGE_KEY = "eva_app_preferences";

export function normalizeSettingsSection(value: string | null | undefined): SettingsSection {
  if (value && SETTINGS_SECTIONS.includes(value as SettingsSection)) {
    return value as SettingsSection;
  }

  return DEFAULT_SETTINGS_SECTION;
}

export function buildSettingsHref(section: SettingsSection = DEFAULT_SETTINGS_SECTION) {
  return `/settings?section=${section}`;
}

export function normalizeAppPreferences(value: unknown): AppPreferences {
  if (!value || typeof value !== "object") {
    return DEFAULT_APP_PREFERENCES;
  }

  const candidate = value as Partial<Record<keyof AppPreferences, unknown>>;
  const fontScale = FONT_SCALE_OPTIONS.includes(candidate.fontScale as FontScale)
    ? (candidate.fontScale as FontScale)
    : DEFAULT_APP_PREFERENCES.fontScale;

  return {
    fontScale,
    reducedMotion:
      typeof candidate.reducedMotion === "boolean"
        ? candidate.reducedMotion
        : DEFAULT_APP_PREFERENCES.reducedMotion,
  };
}

export function readStoredAppPreferences(): AppPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_APP_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(APP_PREFERENCES_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_APP_PREFERENCES;
    }

    return normalizeAppPreferences(JSON.parse(raw));
  } catch {
    return DEFAULT_APP_PREFERENCES;
  }
}

export function writeStoredAppPreferences(preferences: AppPreferences) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
}

export function applyAppPreferences(preferences: AppPreferences, root: HTMLElement = document.documentElement) {
  root.dataset.fontScale = preferences.fontScale;
  root.dataset.motion = preferences.reducedMotion ? "reduced" : "normal";
  root.style.setProperty("--app-font-size", `${preferences.fontScale}px`);
}
