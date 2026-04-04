import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  buildBootstrap,
  corsHeaders,
  requireAuthenticatedUser,
} from "../_shared/financeCore.ts";
import {
  buildFallbackStatement,
  generateStatementWithAi,
} from "../_shared/evaOrchestrator.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const user = await requireAuthenticatedUser(req);
    const bootstrap = await buildBootstrap(user.id, user.email ?? null);

    if (!bootstrap.profile) {
      return new Response(
        JSON.stringify({
          error: "Finish onboarding first so eva can generate your financial statement.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }

    const fallbackStatement = buildFallbackStatement(bootstrap);
    const statement = await generateStatementWithAi(bootstrap, fallbackStatement);

    return new Response(JSON.stringify(statement), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("generate-statement error:", error);
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
