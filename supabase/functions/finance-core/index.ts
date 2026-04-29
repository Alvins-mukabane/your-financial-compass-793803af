import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import {
  corsHeaders,
  getLegacyPublicUserId,
  requireAuthenticatedUser,
} from "../_shared/financeCore.ts";
import { handleFinanceCoreAction } from "../_shared/finance/actions.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = (await req.json().catch(() => ({}))) as Record<string, unknown>;
    const legacyPublicUserId = getLegacyPublicUserId(body.legacy_public_user_id);
    const user = await requireAuthenticatedUser(req);
    const result = await handleFinanceCoreAction({
      body,
      user: { id: user.id, email: user.email ?? null },
      legacyPublicUserId,
    });

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("finance-core error:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
