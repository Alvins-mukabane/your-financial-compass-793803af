import { motion } from "framer-motion";
import {
  Bell,
  CreditCard,
  HelpCircle,
  MessageCircle,
  Palette,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import type { SettingsSection } from "@/lib/appPreferences";
import { cn } from "@/lib/utils";

export type SectionMeta = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export const SETTINGS_SECTIONS: Record<SettingsSection, SectionMeta> = {
  settings: {
    title: "App Preferences",
    description: "Control appearance, text size, and motion without changing your account data.",
    icon: Palette,
  },
  profile: {
    title: "Profile",
    description: "Keep your personal details and planning defaults up to date.",
    icon: User,
  },
  account: {
    title: "Account",
    description: "Review your signed-in account, security status, and session controls.",
    icon: Shield,
  },
  notifications: {
    title: "Notifications",
    description: "Choose which alerts and recaps eva should surface for you.",
    icon: Bell,
  },
  billing: {
    title: "Billing",
    description: "See your current plan and what is reserved for future upgrades.",
    icon: CreditCard,
  },
  help: {
    title: "Help & Support",
    description: "Find support, troubleshooting tips, and the best way to get help quickly.",
    icon: HelpCircle,
  },
  feedback: {
    title: "Feedback",
    description: "Tell us what is working, what feels rough, and what should improve next.",
    icon: MessageCircle,
  },
};

const NOTIFICATION_STORAGE_KEY = "eva_notification_preferences";

export type NotificationPreferences = {
  pushEnabled: boolean;
  stockAlerts: boolean;
  budgetWarnings: boolean;
  weeklyReports: boolean;
  dailySummary: boolean;
  newsDigest: boolean;
};

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  pushEnabled: false,
  stockAlerts: true,
  budgetWarnings: true,
  weeklyReports: true,
  dailySummary: false,
  newsDigest: true,
};

export function readNotificationPreferences(): NotificationPreferences {
  if (typeof window === "undefined") {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }

  try {
    const raw = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) {
      return DEFAULT_NOTIFICATION_PREFERENCES;
    }

    const parsed = JSON.parse(raw) as Partial<NotificationPreferences>;
    return {
      ...DEFAULT_NOTIFICATION_PREFERENCES,
      ...parsed,
    };
  } catch {
    return DEFAULT_NOTIFICATION_PREFERENCES;
  }
}

export function PreferenceOption({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean;
  label: string;
  detail: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-2xl border px-4 py-3 text-left transition-colors",
        active
          ? "border-primary bg-primary/10 text-primary shadow-[inset_0_0_0_1px_rgba(243,162,28,0.14)]"
          : "border-border bg-background text-foreground hover:border-primary/30 hover:bg-secondary/50",
      )}
    >
      <p className="text-sm font-semibold">{label}</p>
      <p className={cn("mt-1 text-xs", active ? "text-primary/80" : "text-muted-foreground")}>
        {detail}
      </p>
    </button>
  );
}

export function SectionSurface({
  title,
  subtitle,
  icon: Icon,
  testId,
  children,
}: {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  testId?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      data-testid={testId}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-5 rounded-[1.75rem] border border-border bg-card/95 p-5 shadow-[0_22px_55px_-38px_rgba(110,73,75,0.24)] md:p-6"
    >
      <div className="flex items-start gap-3 border-b border-border/80 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/12 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>

      {children}
    </motion.section>
  );
}
