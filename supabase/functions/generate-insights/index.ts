import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildBootstrap,
  corsHeaders,
  requireAuthenticatedUser,
} from "../_shared/financeCore.ts";
import {
  buildFallbackInsights,
  generateInsightsWithAi,
} from "../_shared/evaOrchestrator.ts";

type Frequency = "daily" | "weekly" | "monthly";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { frequency = "monthly" } = await req.json().catch(() => ({}));
    const user = await requireAuthenticatedUser(req);
    const safeFrequency = (["daily", "weekly", "monthly"].includes(frequency)
      ? frequency
      : "monthly") as Frequency;
    const bootstrap = await buildBootstrap(user.id, user.email ?? null);

    if (bootstrap.spending_events.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Log some spending first so eva can generate real insights.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const fallbackInsights = buildFallbackInsights(safeFrequency, bootstrap);
    const insights = await generateInsightsWithAi(safeFrequency, bootstrap, fallbackInsights);

    return new Response(JSON.stringify(insights), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-insights error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
