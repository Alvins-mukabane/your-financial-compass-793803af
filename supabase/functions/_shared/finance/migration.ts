import { createAdminClient } from "./db.ts";
import { mapLegacyProfileToFinanceProfile } from "./bootstrap.ts";
import type { LegacyPublicProfile } from "./types.ts";
import { parseBoolean, parseNumber } from "./utils.ts";

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
