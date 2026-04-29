import type { AssetEntry, LiabilityEntry } from "@/components/financial/ManualEntryForm";
import type {
  BiggestProblem,
  GoalFocus,
  GuidanceStyle,
  IntentFocus,
  MoneyStyle,
  SubscriptionAwareness,
} from "./onboardingConfig";

const ONBOARDING_DRAFT_STORAGE_KEY = "eva-onboarding-draft";

export type OnboardingDraft = {
  stepIndex: number;
  profile: {
    first_name: string;
    last_name: string;
    country: string;
    phone_number: string;
    user_type: "personal" | "business";
    updates_opt_in: boolean;
    password_setup_completed: boolean;
    cash_balance: string;
    monthly_income: string;
    monthly_fixed_expenses: string;
  };
  intentFocus: IntentFocus | null;
  biggestProblem: BiggestProblem | null;
  moneyStyle: MoneyStyle | null;
  guidanceStyle: GuidanceStyle;
  goalFocus: GoalFocus | null;
  targetMonthlySavings: string;
  subscriptionAwareness: SubscriptionAwareness;
  budgetForm: {
    category: string;
    monthly_limit: string;
  };
  budgetLimits: Array<{ id: string; category: string; monthly_limit: string }>;
  subscriptionForm: {
    name: string;
    price: string;
    billing_cycle: "monthly" | "yearly";
    category: string;
  };
  subscriptions: Array<{
    id: string;
    name: string;
    price: string;
    billing_cycle: "monthly" | "yearly";
    category: string;
  }>;
  manualAssets: AssetEntry[];
  manualLiabilities: LiabilityEntry[];
  showBalanceSheet: boolean;
  showSubscriptions: boolean;
  showBudgets: boolean;
  firstActionPrompt: string;
};

export function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

function getOnboardingDraftKey(userId: string) {
  return `${ONBOARDING_DRAFT_STORAGE_KEY}:${userId}`;
}

export function readOnboardingDraft(userId: string) {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getOnboardingDraftKey(userId));
    return raw ? (JSON.parse(raw) as OnboardingDraft) : null;
  } catch {
    return null;
  }
}

export function writeOnboardingDraft(userId: string, draft: OnboardingDraft) {
  if (typeof window === "undefined" || !userId) {
    return;
  }

  window.localStorage.setItem(getOnboardingDraftKey(userId), JSON.stringify(draft));
}

export function clearOnboardingDraft(userId: string) {
  if (typeof window === "undefined" || !userId) {
    return;
  }

  window.localStorage.removeItem(getOnboardingDraftKey(userId));
}
