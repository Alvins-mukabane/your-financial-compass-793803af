import { createContext, useContext } from "react";
import type { AppPreferences, FontScale } from "@/lib/appPreferences";

export type AppPreferencesContextValue = {
  preferences: AppPreferences;
  setFontScale: (fontScale: FontScale) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
};

export const AppPreferencesContext = createContext<AppPreferencesContextValue | undefined>(undefined);

export function useAppPreferences() {
  const context = useContext(AppPreferencesContext);

  if (!context) {
    throw new Error("useAppPreferences must be used within AppPreferencesProvider");
  }

  return context;
}
