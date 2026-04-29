import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import { UUID_PATTERN } from "./utils.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
