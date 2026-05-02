import { createAdminClient } from "../_shared/finance/db.ts";
import { runAgentCycle } from "../_shared/finance/execution.ts";
import { corsHeaders } from "../_shared/financeCore.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const configuredSecret = Deno.env.get("EVA_AGENT_SCHEDULE_SECRET");
  const providedSecret = req.headers.get("x-eva-agent-secret") ?? "";
  if (!configuredSecret || providedSecret !== configuredSecret) {
    return new Response(JSON.stringify({ error: "Unauthorized agent cycle request" }), {
      status: 401,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("finance_profiles")
      .select("user_id, agent_mode")
      .eq("onboarding_completed", true)
      .in("agent_mode", ["assisted", "autopilot"])
      .limit(100);

    if (error) throw error;

    const results = [];
    for (const profile of data ?? []) {
      try {
        const cycle = await runAgentCycle(String(profile.user_id), "scheduled");
        results.push({ user_id: profile.user_id, ok: true, cycle });
      } catch (error) {
        results.push({
          user_id: profile.user_id,
          ok: false,
          error: error instanceof Error ? error.message : "Unknown agent-cycle error",
        });
      }
    }

    return new Response(JSON.stringify({ ok: true, users_checked: results.length, results }), {
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error instanceof Error ? error.message : "Agent cycle failed",
    }), {
      status: 500,
      headers: { ...corsHeaders, "content-type": "application/json" },
    });
  }
});
