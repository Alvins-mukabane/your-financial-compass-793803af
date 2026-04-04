import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase, hasSupabaseConfig, SUPABASE_SETUP_MESSAGE } from "@/integrations/supabase/client";
import {
  completeOnboarding,
  deleteBudgetLimit,
  deleteFinancialEntry,
  deleteGoal,
  deleteSubscription,
  fetchBootstrap,
  getEmptyBootstrap,
  saveBudgetLimit,
  saveFinancialEntry,
  saveGoal,
  saveSubscription,
  updateProfile,
} from "@/lib/workspaceData";
import type {
  BootstrapData,
  BudgetLimit,
  FinancialEntry,
  OnboardingPayload,
  Subscription,
  UserGoal,
  UserProfile,
} from "@/lib/evaContracts";
import { handleAppError, normalizeAppError } from "@/lib/appErrors";
import { getStoredPublicUserId } from "@/lib/publicUser";

type PublicUserContextValue = {
  session: Session | null;
  user: User | null;
  userId: string;
  legacyPublicUserId: string;
  isAuthenticated: boolean;
  authLoading: boolean;
  bootstrap: BootstrapData;
  loading: boolean;
  refreshing: boolean;
  saving: boolean;
  signInWithMagicLink: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  completeOnboarding: (payload: OnboardingPayload) => Promise<void>;
  updateProfile: (payload: Partial<UserProfile>) => Promise<void>;
  saveGoal: (goal: Partial<UserGoal>) => Promise<void>;
  deleteGoal: (goalId: string) => Promise<void>;
  saveBudgetLimit: (limit: Partial<BudgetLimit>) => Promise<void>;
  deleteBudgetLimit: (limitId: string) => Promise<void>;
  saveSubscription: (subscription: Partial<Subscription>) => Promise<void>;
  deleteSubscription: (subscriptionId: string) => Promise<void>;
  saveFinancialEntry: (entry: Partial<FinancialEntry>) => Promise<void>;
  deleteFinancialEntry: (entryId: string) => Promise<void>;
};

const PublicUserContext = createContext<PublicUserContextValue | undefined>(undefined);
const BOOTSTRAP_CACHE_KEY = "eva-workspace-cache";

function readCachedBootstrap(userId: string) {
  if (typeof window === "undefined" || !userId) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(BOOTSTRAP_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const cached = JSON.parse(raw) as BootstrapData;
    return cached.user_id === userId ? cached : null;
  } catch {
    return null;
  }
}

function writeCachedBootstrap(bootstrap: BootstrapData) {
  if (typeof window === "undefined" || !bootstrap.user_id) {
    return;
  }

  window.localStorage.setItem(BOOTSTRAP_CACHE_KEY, JSON.stringify(bootstrap));
}

function clearCachedBootstrap() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(BOOTSTRAP_CACHE_KEY);
}

export function PublicUserProvider({ children }: { children: ReactNode }) {
  const legacyPublicUserId = useMemo(() => getStoredPublicUserId(), []);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [bootstrap, setBootstrap] = useState<BootstrapData>(getEmptyBootstrap());
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyBootstrap = useCallback((data: BootstrapData) => {
    setBootstrap(data);
    writeCachedBootstrap(data);
  }, []);

  const resetWorkspace = useCallback(
    (nextUser: User | null) => {
      if (!nextUser) {
        clearCachedBootstrap();
        setBootstrap(getEmptyBootstrap());
        return;
      }

      const cached = readCachedBootstrap(nextUser.id);
      setBootstrap(cached ?? getEmptyBootstrap(nextUser.id, nextUser.email ?? null));
    },
    [],
  );

  const handleRefreshFailure = useCallback(
    (targetUser: User | null, error: unknown) => {
      if (targetUser) {
        const cached = readCachedBootstrap(targetUser.id);
        if (cached) {
          setBootstrap(cached);
        } else {
          setBootstrap(getEmptyBootstrap(targetUser.id, targetUser.email ?? null));
        }
      } else {
        setBootstrap(getEmptyBootstrap());
      }

      const message =
        error instanceof Error
          ? error.message
          : handleAppError(error, "We could not load your workspace. Please try again.").message;
      console.warn(message);
    },
    [],
  );

  const initialize = useCallback(
    async (activeUser: User | null) => {
      if (!activeUser) {
        resetWorkspace(null);
        setWorkspaceLoading(false);
        return;
      }

      setWorkspaceLoading(true);
      try {
        const data = await fetchBootstrap({ legacyPublicUserId });
        applyBootstrap(data);
      } catch (error) {
        handleRefreshFailure(activeUser, error);
      } finally {
        setWorkspaceLoading(false);
      }
    },
    [applyBootstrap, handleRefreshFailure, legacyPublicUserId, resetWorkspace],
  );

  useEffect(() => {
    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!isMounted) {
          return;
        }

        setSession(data.session ?? null);
        setUser(data.session?.user ?? null);
      })
      .finally(() => {
        if (isMounted) {
          setAuthLoading(false);
        }
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession ?? null);
      setUser(nextSession?.user ?? null);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    resetWorkspace(user);
    void initialize(user);
  }, [authLoading, initialize, resetWorkspace, user]);

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }

    setRefreshing(true);
    try {
      const data = await fetchBootstrap({ legacyPublicUserId });
      applyBootstrap(data);
    } catch (error) {
      handleRefreshFailure(user, error);
    } finally {
      setRefreshing(false);
    }
  }, [applyBootstrap, handleRefreshFailure, legacyPublicUserId, user]);

  const runMutation = useCallback(
    async (callback: () => Promise<BootstrapData>) => {
      if (!user) {
        throw new Error("Sign in to continue.");
      }

      setSaving(true);
      try {
        const data = await callback();
        applyBootstrap(data);
      } catch (error) {
        throw error instanceof Error
          ? error
          : normalizeAppError(error, "We could not save your changes. Please try again.");
      } finally {
        setSaving(false);
      }
    },
    [applyBootstrap, user],
  );

  const signInWithMagicLink = useCallback(async (email: string) => {
    if (!hasSupabaseConfig) {
      throw new Error(SUPABASE_SETUP_MESSAGE);
    }

    const redirectTo =
      typeof window === "undefined" ? undefined : `${window.location.origin}/auth`;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw normalizeAppError(error, "We could not send the magic link. Please try again.");
    }
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw normalizeAppError(error, "We could not sign you out. Please try again.");
    }

    clearCachedBootstrap();
    setBootstrap(getEmptyBootstrap());
  }, []);

  const loading = authLoading || workspaceLoading;

  const value = useMemo<PublicUserContextValue>(
    () => ({
      session,
      user,
      userId: user?.id ?? "",
      legacyPublicUserId,
      isAuthenticated: Boolean(user),
      authLoading,
      bootstrap,
      loading,
      refreshing,
      saving,
      signInWithMagicLink,
      signOut,
      refresh,
      completeOnboarding: async (payload) =>
        runMutation(() => completeOnboarding(payload, { legacyPublicUserId })),
      updateProfile: async (payload) => runMutation(() => updateProfile(payload)),
      saveGoal: async (goal) => runMutation(() => saveGoal(goal)),
      deleteGoal: async (goalId) => runMutation(() => deleteGoal(goalId)),
      saveBudgetLimit: async (limit) => runMutation(() => saveBudgetLimit(limit)),
      deleteBudgetLimit: async (limitId) => runMutation(() => deleteBudgetLimit(limitId)),
      saveSubscription: async (subscription) => runMutation(() => saveSubscription(subscription)),
      deleteSubscription: async (subscriptionId) =>
        runMutation(() => deleteSubscription(subscriptionId)),
      saveFinancialEntry: async (entry) => runMutation(() => saveFinancialEntry(entry)),
      deleteFinancialEntry: async (entryId) =>
        runMutation(() => deleteFinancialEntry(entryId)),
    }),
    [
      authLoading,
      bootstrap,
      legacyPublicUserId,
      loading,
      refresh,
      refreshing,
      runMutation,
      saving,
      session,
      signInWithMagicLink,
      signOut,
      user,
    ],
  );

  return (
    <PublicUserContext.Provider value={value}>
      {children}
    </PublicUserContext.Provider>
  );
}

export function usePublicUser() {
  const context = useContext(PublicUserContext);
  if (!context) {
    throw new Error("usePublicUser must be used inside PublicUserProvider");
  }
  return context;
}
