import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type FinanceProfile = {
  user_id: string;
  legacy_public_user_id: string | null;
  first_name: string;
  last_name: string;
  country: string;
  phone_number: string;
  user_type: string;
  updates_opt_in: boolean;
  password_setup_completed: boolean;
  cash_balance: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  budgeting_focus: string;
  intent_focus: string;
  biggest_problem: string;
  money_style: string;
  guidance_style: string;
  goal_focus: string;
  subscription_awareness: string;
  target_monthly_savings: number;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type FinanceGoal = {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string;
  icon: string;
  created_at: string;
  updated_at: string;
};

type FinanceBudgetLimit = {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  created_at: string;
  updated_at: string;
};

type FinanceSpendingEvent = {
  id: string;
  user_id: string;
  date: string;
  items: Array<{ category: string; amount: number; description: string }>;
  raw_input: string;
  total: number;
  source: string;
  created_at: string;
};

type FinanceFinancialEntry = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  entry_type: "asset" | "liability";
  value: number;
  cashflow: number;
  balance: number;
  payment: number;
  description?: string | null;
  created_at: string;
  updated_at: string;
};

type FinanceSubscription = {
  id: string;
  user_id: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly";
  category: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

type LegacyPublicProfile = {
  public_user_id: string;
  first_name: string;
  last_name: string;
  country: string;
  phone_number?: string;
  user_type: string;
  updates_opt_in: boolean;
  password_setup_completed?: boolean;
  cash_balance: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  budgeting_focus: string;
  intent_focus: string;
  biggest_problem: string;
  money_style: string;
  guidance_style: string;
  goal_focus: string;
  subscription_awareness: string;
  target_monthly_savings: number;
  onboarding_completed: boolean;
  onboarding_completed_at: string | null;
};

type DashboardSummary = {
  cash_balance: number;
  total_assets: number;
  total_liabilities: number;
  net_worth: number;
  monthly_income: number;
  monthly_fixed_expenses: number;
  monthly_subscription_total: number;
  monthly_cashflow: number;
  savings_rate: number;
  health_score: number;
  spending_this_month: number;
  latest_spending_date: string | null;
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function parseNumber(value: unknown) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function parseBoolean(value: unknown) {
  return Boolean(value);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function getLegacyPublicUserId(value: unknown) {
  if (typeof value !== "string" || !UUID_PATTERN.test(value)) {
    return null;
  }

  return value;
}

export function createAdminClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("Supabase admin credentials are missing.");
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function createUserClient(authHeader: string) {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public credentials are missing.");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { Authorization: authHeader } },
  });
}

export async function requireAuthenticatedUser(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    throw new Error("Authentication required.");
  }

  const userClient = createUserClient(authHeader);
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error) {
    throw error;
  }

  if (!user) {
    throw new Error("Authentication required.");
  }

  return user;
}

function calculateHealthScore({
  monthlyIncome,
  monthlyCashflow,
  totalAssets,
  totalLiabilities,
  spendingEvents,
}: {
  monthlyIncome: number;
  monthlyCashflow: number;
  totalAssets: number;
  totalLiabilities: number;
  spendingEvents: FinanceSpendingEvent[];
}) {
  let score = 50;

  if (monthlyIncome > 0) {
    const savingsRate = monthlyCashflow / monthlyIncome;
    if (savingsRate >= 0.3) score += 20;
    else if (savingsRate >= 0.15) score += 10;
    else if (savingsRate < 0) score -= 15;
  }

  if (totalAssets > 0) {
    const leverage = totalLiabilities / totalAssets;
    if (leverage <= 0.25) score += 12;
    else if (leverage >= 0.75) score -= 10;
  }

  if (spendingEvents.length >= 10) score += 8;
  else if (spendingEvents.length >= 4) score += 4;

  return clamp(Math.round(score), 10, 100);
}

function buildDashboardSummary(
  profile: FinanceProfile | null,
  spendingEvents: FinanceSpendingEvent[],
  financialEntries: FinanceFinancialEntry[],
  subscriptions: FinanceSubscription[],
): DashboardSummary {
  const cashBalance = parseNumber(profile?.cash_balance);
  const monthlyIncome = parseNumber(profile?.monthly_income);
  const monthlyFixedExpenses = parseNumber(profile?.monthly_fixed_expenses);
  const totalAssets =
    cashBalance +
    financialEntries
      .filter((entry) => entry.entry_type === "asset")
      .reduce((sum, entry) => sum + parseNumber(entry.value), 0);
  const totalLiabilities = financialEntries
    .filter((entry) => entry.entry_type === "liability")
    .reduce((sum, entry) => sum + parseNumber(entry.balance), 0);
  const monthlySubscriptionTotal = subscriptions
    .filter((subscription) => subscription.is_active)
    .reduce((sum, subscription) => {
      const amount = parseNumber(subscription.price);
      return sum + (subscription.billing_cycle === "yearly" ? amount / 12 : amount);
    }, 0);
  const monthlyCashflow = monthlyIncome - monthlyFixedExpenses - monthlySubscriptionTotal;
  const savingsRate =
    monthlyIncome > 0 ? clamp(Math.round((monthlyCashflow / monthlyIncome) * 100), -100, 100) : 0;
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const spendingThisMonth = spendingEvents
    .filter((event) => event.date.startsWith(currentMonth))
    .reduce((sum, event) => sum + parseNumber(event.total), 0);
  const latestSpendingDate = spendingEvents[0]?.date ?? null;

  return {
    cash_balance: cashBalance,
    total_assets: totalAssets,
    total_liabilities: totalLiabilities,
    net_worth: totalAssets - totalLiabilities,
    monthly_income: monthlyIncome,
    monthly_fixed_expenses: monthlyFixedExpenses,
    monthly_subscription_total: monthlySubscriptionTotal,
    monthly_cashflow: monthlyCashflow,
    savings_rate: savingsRate,
    health_score: calculateHealthScore({
      monthlyIncome,
      monthlyCashflow,
      totalAssets,
      totalLiabilities,
      spendingEvents,
    }),
    spending_this_month: spendingThisMonth,
    latest_spending_date: latestSpendingDate,
  };
}

function mapLegacyProfileToFinanceProfile(
  userId: string,
  profile: Partial<LegacyPublicProfile> | Record<string, unknown>,
  legacyPublicUserId: string | null,
  existingProfile?: Partial<FinanceProfile> | null,
) {
  return {
    user_id: userId,
    legacy_public_user_id:
      legacyPublicUserId ?? existingProfile?.legacy_public_user_id ?? null,
    first_name: String(profile.first_name ?? existingProfile?.first_name ?? ""),
    last_name: String(profile.last_name ?? existingProfile?.last_name ?? ""),
    country: String(profile.country ?? existingProfile?.country ?? ""),
    phone_number: String(profile.phone_number ?? existingProfile?.phone_number ?? ""),
    user_type:
      profile.user_type === "business" || existingProfile?.user_type === "business"
        ? "business"
        : "personal",
    updates_opt_in: parseBoolean(
      profile.updates_opt_in ?? existingProfile?.updates_opt_in ?? true,
    ),
    password_setup_completed: parseBoolean(
      profile.password_setup_completed ?? existingProfile?.password_setup_completed ?? false,
    ),
    cash_balance: parseNumber(profile.cash_balance ?? existingProfile?.cash_balance),
    monthly_income: parseNumber(profile.monthly_income ?? existingProfile?.monthly_income),
    monthly_fixed_expenses: parseNumber(
      profile.monthly_fixed_expenses ?? existingProfile?.monthly_fixed_expenses,
    ),
    budgeting_focus: String(profile.budgeting_focus ?? existingProfile?.budgeting_focus ?? ""),
    intent_focus: String(profile.intent_focus ?? existingProfile?.intent_focus ?? ""),
    biggest_problem: String(profile.biggest_problem ?? existingProfile?.biggest_problem ?? ""),
    money_style: String(profile.money_style ?? existingProfile?.money_style ?? ""),
    guidance_style: String(profile.guidance_style ?? existingProfile?.guidance_style ?? "balanced"),
    goal_focus: String(profile.goal_focus ?? existingProfile?.goal_focus ?? ""),
    subscription_awareness: String(
      profile.subscription_awareness ?? existingProfile?.subscription_awareness ?? "",
    ),
    target_monthly_savings: parseNumber(
      profile.target_monthly_savings ?? existingProfile?.target_monthly_savings,
    ),
  };
}

export function normalizeProfile(
  userId: string,
  profile: Record<string, unknown>,
  legacyPublicUserId: string | null,
  existingProfile?: Partial<FinanceProfile> | null,
) {
  return mapLegacyProfileToFinanceProfile(userId, profile, legacyPublicUserId, existingProfile);
}

export async function buildBootstrap(userId: string, email: string | null = null) {
  const admin = createAdminClient();
  const [
    profileResult,
    goalsResult,
    budgetResult,
    eventsResult,
    financialEntriesResult,
    subscriptionResult,
  ] = await Promise.all([
    admin.from("finance_profiles").select("*").eq("user_id", userId).maybeSingle(),
    admin.from("finance_goals").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    admin.from("finance_budget_limits").select("*").eq("user_id", userId).order("category", { ascending: true }),
    admin.from("finance_spending_events").select("*").eq("user_id", userId).order("date", { ascending: false }).limit(120),
    admin.from("finance_financial_entries").select("*").eq("user_id", userId).order("created_at", { ascending: true }),
    admin.from("finance_subscriptions").select("*").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (goalsResult.error) throw goalsResult.error;
  if (budgetResult.error) throw budgetResult.error;
  if (eventsResult.error) throw eventsResult.error;
  if (financialEntriesResult.error) throw financialEntriesResult.error;
  if (subscriptionResult.error) throw subscriptionResult.error;

  const profile = (profileResult.data as FinanceProfile | null) ?? null;
  const goals = (goalsResult.data as FinanceGoal[]) ?? [];
  const budgetLimits = (budgetResult.data as FinanceBudgetLimit[]) ?? [];
  const spendingEvents = (eventsResult.data as FinanceSpendingEvent[]) ?? [];
  const financialEntries = (financialEntriesResult.data as FinanceFinancialEntry[]) ?? [];
  const subscriptions = (subscriptionResult.data as FinanceSubscription[]) ?? [];

  const dashboardSummary = buildDashboardSummary(
    profile,
    spendingEvents,
    financialEntries,
    subscriptions,
  );

  return {
    user_id: userId,
    email,
    has_onboarded: Boolean(profile?.onboarding_completed),
    migration: {
      legacy_public_user_id: profile?.legacy_public_user_id ?? null,
      migrated_from_public: Boolean(profile?.legacy_public_user_id),
    },
    profile,
    goals,
    budget_limits: budgetLimits,
    spending_events: spendingEvents,
    spending_logs: spendingEvents,
    financial_entries: financialEntries,
    subscriptions,
    dashboard_summary: dashboardSummary,
    empty_flags: {
      has_spending_history: spendingEvents.length > 0,
      has_goals: goals.length > 0,
      has_budget_limits: budgetLimits.length > 0,
      has_subscriptions: subscriptions.length > 0,
      has_balance_sheet: financialEntries.length > 0 || dashboardSummary.cash_balance > 0,
    },
  };
}

export async function replaceOnboardingData(
  userId: string,
  payload: Record<string, unknown>,
  legacyPublicUserId: string | null,
) {
  const admin = createAdminClient();
  const { data: existingProfile, error: existingProfileError } = await admin
    .from("finance_profiles")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingProfileError) throw existingProfileError;

  const normalizedProfile = normalizeProfile(
    userId,
    (payload.profile as Record<string, unknown>) ?? {},
    legacyPublicUserId,
    existingProfile as FinanceProfile | null,
  );

  const { error: profileError } = await admin.from("finance_profiles").upsert({
    ...normalizedProfile,
    onboarding_completed: true,
    onboarding_completed_at:
      existingProfile?.onboarding_completed_at ?? new Date().toISOString(),
  });

  if (profileError) throw profileError;

  await Promise.all([
    admin.from("finance_goals").delete().eq("user_id", userId),
    admin.from("finance_budget_limits").delete().eq("user_id", userId),
    admin.from("finance_financial_entries").delete().eq("user_id", userId),
    admin.from("finance_subscriptions").delete().eq("user_id", userId),
  ]);

  const goals = Array.isArray(payload.goals) ? payload.goals : [];
  const budgetLimits = Array.isArray(payload.budget_limits) ? payload.budget_limits : [];
  const financialEntries = Array.isArray(payload.financial_entries) ? payload.financial_entries : [];
  const subscriptions = Array.isArray(payload.subscriptions) ? payload.subscriptions : [];

  if (goals.length > 0) {
    const { error } = await admin.from("finance_goals").insert(
      goals.map((goal) => ({
        user_id: userId,
        name: String((goal as Record<string, unknown>).name ?? ""),
        target_amount: parseNumber((goal as Record<string, unknown>).target_amount),
        current_amount: parseNumber((goal as Record<string, unknown>).current_amount),
        deadline: String((goal as Record<string, unknown>).deadline ?? ""),
        icon: String((goal as Record<string, unknown>).icon ?? "🎯"),
      })),
    );
    if (error) throw error;
  }

  if (budgetLimits.length > 0) {
    const { error } = await admin.from("finance_budget_limits").insert(
      budgetLimits.map((limit) => ({
        user_id: userId,
        category: String((limit as Record<string, unknown>).category ?? ""),
        monthly_limit: parseNumber((limit as Record<string, unknown>).monthly_limit),
      })),
    );
    if (error) throw error;
  }

  if (financialEntries.length > 0) {
    const { error } = await admin.from("finance_financial_entries").insert(
      financialEntries.map((entry) => ({
        user_id: userId,
        name: String((entry as Record<string, unknown>).name ?? ""),
        type: String((entry as Record<string, unknown>).type ?? "other"),
        entry_type:
          (entry as Record<string, unknown>).entry_type === "liability"
            ? "liability"
            : "asset",
        value: parseNumber((entry as Record<string, unknown>).value),
        cashflow: parseNumber((entry as Record<string, unknown>).cashflow),
        balance: parseNumber((entry as Record<string, unknown>).balance),
        payment: parseNumber((entry as Record<string, unknown>).payment),
        description: String((entry as Record<string, unknown>).description ?? ""),
      })),
    );
    if (error) throw error;
  }

  if (subscriptions.length > 0) {
    const { error } = await admin.from("finance_subscriptions").insert(
      subscriptions.map((subscription) => ({
        user_id: userId,
        name: String((subscription as Record<string, unknown>).name ?? ""),
        price: parseNumber((subscription as Record<string, unknown>).price),
        billing_cycle:
          (subscription as Record<string, unknown>).billing_cycle === "yearly"
            ? "yearly"
            : "monthly",
        category: String((subscription as Record<string, unknown>).category ?? "Other"),
        is_active: parseBoolean((subscription as Record<string, unknown>).is_active ?? true),
      })),
    );
    if (error) throw error;
  }
}

export async function migrateLegacyPublicData(
  userId: string,
  legacyPublicUserId: string | null,
) {
  if (!legacyPublicUserId) {
    return false;
  }

  const admin = createAdminClient();
  const { data: existingProfile, error: existingProfileError } = await admin
    .from("finance_profiles")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (existingProfileError) throw existingProfileError;
  if (existingProfile) {
    return false;
  }

  const [
    profileResult,
    goalsResult,
    budgetResult,
    logsResult,
    financialEntriesResult,
    subscriptionResult,
  ] = await Promise.all([
    admin.from("public_user_profiles").select("*").eq("public_user_id", legacyPublicUserId).maybeSingle(),
    admin.from("public_user_goals").select("*").eq("public_user_id", legacyPublicUserId),
    admin.from("public_user_budget_limits").select("*").eq("public_user_id", legacyPublicUserId),
    admin.from("public_user_spending_logs").select("*").eq("public_user_id", legacyPublicUserId),
    admin.from("public_user_financial_entries").select("*").eq("public_user_id", legacyPublicUserId),
    admin.from("public_user_subscriptions").select("*").eq("public_user_id", legacyPublicUserId),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (goalsResult.error) throw goalsResult.error;
  if (budgetResult.error) throw budgetResult.error;
  if (logsResult.error) throw logsResult.error;
  if (financialEntriesResult.error) throw financialEntriesResult.error;
  if (subscriptionResult.error) throw subscriptionResult.error;

  const legacyProfile = (profileResult.data as LegacyPublicProfile | null) ?? null;
  const goals = goalsResult.data ?? [];
  const budgetLimits = budgetResult.data ?? [];
  const spendingLogs = logsResult.data ?? [];
  const financialEntries = financialEntriesResult.data ?? [];
  const subscriptions = subscriptionResult.data ?? [];

  const hasAnyData =
    Boolean(legacyProfile) ||
    goals.length > 0 ||
    budgetLimits.length > 0 ||
    spendingLogs.length > 0 ||
    financialEntries.length > 0 ||
    subscriptions.length > 0;

  if (!hasAnyData) {
    return false;
  }

  const profilePayload = mapLegacyProfileToFinanceProfile(
    userId,
    legacyProfile ?? {},
    legacyPublicUserId,
    null,
  );

  const { error: profileInsertError } = await admin.from("finance_profiles").upsert({
    ...profilePayload,
    onboarding_completed: legacyProfile?.onboarding_completed ?? false,
    onboarding_completed_at: legacyProfile?.onboarding_completed_at ?? null,
  });

  if (profileInsertError) throw profileInsertError;

  if (goals.length > 0) {
    const { error } = await admin.from("finance_goals").insert(
      goals.map((goal) => ({
        user_id: userId,
        name: String(goal.name ?? ""),
        target_amount: parseNumber(goal.target_amount),
        current_amount: parseNumber(goal.current_amount),
        deadline: String(goal.deadline ?? new Date().toISOString().split("T")[0]),
        icon: String(goal.icon ?? "🎯"),
        created_at: goal.created_at,
        updated_at: goal.updated_at,
      })),
    );
    if (error) throw error;
  }

  if (budgetLimits.length > 0) {
    const { error } = await admin.from("finance_budget_limits").insert(
      budgetLimits.map((limit) => ({
        user_id: userId,
        category: String(limit.category ?? ""),
        monthly_limit: parseNumber(limit.monthly_limit),
        created_at: limit.created_at,
        updated_at: limit.updated_at,
      })),
    );
    if (error) throw error;
  }

  if (spendingLogs.length > 0) {
    const { error } = await admin.from("finance_spending_events").insert(
      spendingLogs.map((log) => ({
        user_id: userId,
        date: String(log.date ?? new Date().toISOString().split("T")[0]),
        items: Array.isArray(log.items) ? log.items : [],
        raw_input: String(log.raw_input ?? ""),
        total: parseNumber(log.total),
        source: "legacy_public_migration",
        created_at: log.created_at,
      })),
    );
    if (error) throw error;
  }

  if (financialEntries.length > 0) {
    const { error } = await admin.from("finance_financial_entries").insert(
      financialEntries.map((entry) => ({
        user_id: userId,
        name: String(entry.name ?? ""),
        type: String(entry.type ?? "other"),
        entry_type: entry.entry_type === "liability" ? "liability" : "asset",
        value: parseNumber(entry.value),
        cashflow: parseNumber(entry.cashflow),
        balance: parseNumber(entry.balance),
        payment: parseNumber(entry.payment),
        description: String(entry.description ?? ""),
        created_at: entry.created_at,
        updated_at: entry.updated_at,
      })),
    );
    if (error) throw error;
  }

  if (subscriptions.length > 0) {
    const { error } = await admin.from("finance_subscriptions").insert(
      subscriptions.map((subscription) => ({
        user_id: userId,
        name: String(subscription.name ?? ""),
        price: parseNumber(subscription.price),
        billing_cycle: subscription.billing_cycle === "yearly" ? "yearly" : "monthly",
        category: String(subscription.category ?? "Other"),
        is_active: parseBoolean(subscription.is_active ?? true),
        created_at: subscription.created_at,
        updated_at: subscription.updated_at,
      })),
    );
    if (error) throw error;
  }

  return true;
}
