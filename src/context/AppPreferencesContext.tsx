import {
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  applyAppPreferences,
  type AppPreferences,
  readStoredAppPreferences,
  writeStoredAppPreferences,
} from "@/lib/appPreferences";
import { AppPreferencesContext, type AppPreferencesContextValue } from "@/context/app-preferences-context";

export function AppPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<AppPreferences>(() => readStoredAppPreferences());

  useLayoutEffect(() => {
    applyAppPreferences(preferences);
    writeStoredAppPreferences(preferences);
  }, [preferences]);

  const value = useMemo<AppPreferencesContextValue>(
    () => ({
      preferences,
      setFontScale: (fontScale) =>
        setPreferences((current) => ({
          ...current,
          fontScale,
        })),
      setReducedMotion: (reducedMotion) =>
        setPreferences((current) => ({
          ...current,
          reducedMotion,
        })),
    }),
    [preferences],
  );

  return <AppPreferencesContext.Provider value={value}>{children}</AppPreferencesContext.Provider>;
}
