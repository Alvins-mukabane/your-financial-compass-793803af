import { buildBootstrap } from "./bootstrap.ts";
import { createAdminClient } from "./db.ts";

export async function generateScheduledSummaries() {
  const admin = createAdminClient();
  const { data: profiles, error: profilesError } = await admin
    .from("finance_profiles")
    .select("user_id, updates_opt_in, onboarding_completed")
    .eq("onboarding_completed", true);

  if (profilesError) throw profilesError;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);

  let dailyCreated = 0;
  let weeklyCreated = 0;

  for (const profile of profiles ?? []) {
    if (!profile.updates_opt_in) continue;

    const bootstrap = await buildBootstrap(profile.user_id);
    const [dailySummary, weeklySummary] = bootstrap.summaries ?? [];
    const candidateSummaries = [
      {
        type: "summary_daily",
        summary: dailySummary,
        since: todayStart.toISOString(),
      },
      {
        type: "summary_weekly",
        summary: weeklySummary,
        since: weekStart.toISOString(),
      },
    ];

    for (const candidate of candidateSummaries) {
      if (!candidate.summary || candidate.summary.status !== "ready") continue;

      const { count, error: countError } = await admin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", profile.user_id)
        .eq("type", candidate.type)
        .gte("created_at", candidate.since);

      if (countError) throw countError;
      if ((count ?? 0) > 0) continue;

      const { error: insertError } = await admin.from("notifications").insert({
        user_id: profile.user_id,
        type: candidate.type,
        title: candidate.summary.headline,
        body: candidate.summary.body,
      });

      if (insertError) throw insertError;

      if (candidate.type === "summary_daily") dailyCreated += 1;
      if (candidate.type === "summary_weekly") weeklyCreated += 1;
    }
  }

  return {
    ok: true,
    daily_created: dailyCreated,
    weekly_created: weeklyCreated,
  };
}
