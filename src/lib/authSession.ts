import type { Session, User } from "@supabase/supabase-js";
import { hasSupabaseConfig, supabase } from "@/integrations/supabase/client";

type TrustedSessionResult = {
  session: Session | null;
  user: User | null;
};

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function validateSession(session: Session | null): Promise<TrustedSessionResult> {
  if (!session?.access_token) {
    return { session: null, user: null };
  }

  const { data, error } = await supabase.auth.getUser(session.access_token);
  if (error || !data.user) {
    return { session: null, user: null };
  }

  return {
    session: {
      ...session,
      user: data.user,
    },
    user: data.user,
  };
}

async function refreshTrustedSession(
  currentSession: Session | null,
): Promise<TrustedSessionResult> {
  if (!currentSession?.refresh_token) {
    return { session: null, user: null };
  }

  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: currentSession.refresh_token,
  });

  if (error || !data.session) {
    return { session: null, user: null };
  }

  return validateSession(data.session);
}

export async function resolveTrustedSession(
  initialSession?: Session | null,
  {
    attempts = 3,
    waitMs = 1200,
  }: {
    attempts?: number;
    waitMs?: number;
  } = {},
): Promise<TrustedSessionResult> {
  if (!hasSupabaseConfig) {
    return { session: null, user: null };
  }

  let candidate = initialSession ?? null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (!candidate) {
      const { data } = await supabase.auth.getSession();
      candidate = data.session ?? null;
    }

    const trusted = await validateSession(candidate);
    if (trusted.session && trusted.user) {
      return trusted;
    }

    const refreshed = await refreshTrustedSession(candidate);
    if (refreshed.session && refreshed.user) {
      return refreshed;
    }

    candidate = null;

    if (attempt < attempts - 1) {
      await sleep(waitMs);
    }
  }

  return { session: null, user: null };
}

export async function getTrustedAccessToken(options?: {
  initialSession?: Session | null;
  attempts?: number;
  waitMs?: number;
}) {
  const trusted = await resolveTrustedSession(options?.initialSession, {
    attempts: options?.attempts,
    waitMs: options?.waitMs,
  });

  return trusted.session?.access_token ?? null;
}
