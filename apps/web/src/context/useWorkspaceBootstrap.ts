import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { handleAppError, normalizeAppError } from "@/lib/appErrors";
import type { BootstrapData } from "@/lib/evaContracts";
import { fetchBootstrap, getEmptyBootstrap } from "@/lib/workspaceData";
import {
  buildWorkspaceFallbackBootstrap,
  clearCachedBootstrap,
  readCachedBootstrap,
  writeCachedBootstrap,
} from "./publicUserBootstrapCache";
import type { WorkspaceUser } from "./publicUserTypes";

export function useWorkspaceBootstrap({
  user,
  authLoading,
  legacyPublicUserId,
}: {
  user: User | null;
  authLoading: boolean;
  legacyPublicUserId: string;
}) {
  const [bootstrap, setBootstrap] = useState<BootstrapData>(getEmptyBootstrap());
  const [workspaceLoading, setWorkspaceLoading] = useState(true);
  const [workspaceResolvedUserId, setWorkspaceResolvedUserId] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workspaceError, setWorkspaceError] = useState<string | null>(null);
  const bootstrapRef = useRef<BootstrapData>(getEmptyBootstrap());

  const activeWorkspaceUser = useMemo<WorkspaceUser | null>(
    () => (user?.id ? { id: user.id, email: user.email ?? null } : null),
    [user?.email, user?.id],
  );

  const applyBootstrap = useCallback((data: BootstrapData) => {
    setBootstrap(data);
    bootstrapRef.current = data;
    setWorkspaceError(null);
    writeCachedBootstrap(data);
  }, []);

  const resetWorkspace = useCallback((nextUser: WorkspaceUser | null) => {
    if (!nextUser) {
      clearCachedBootstrap();
      const emptyBootstrap = getEmptyBootstrap();
      bootstrapRef.current = emptyBootstrap;
      setBootstrap(emptyBootstrap);
      setWorkspaceError(null);
      setWorkspaceResolvedUserId(null);
      return;
    }

    const cached = readCachedBootstrap(nextUser.id);
    const nextBootstrap = cached ?? getEmptyBootstrap(nextUser.id, nextUser.email ?? null);
    bootstrapRef.current = nextBootstrap;
    setBootstrap(nextBootstrap);
    setWorkspaceError(null);
  }, []);

  const handleRefreshFailure = useCallback((targetUser: WorkspaceUser | null, error: unknown) => {
    const fallbackBootstrap = buildWorkspaceFallbackBootstrap(
      bootstrapRef.current,
      targetUser,
    );
    bootstrapRef.current = fallbackBootstrap;
    setBootstrap(fallbackBootstrap);

    const message =
      error instanceof Error
        ? error.message
        : handleAppError(error, "We could not load your workspace. Please try again.").message;
    setWorkspaceError(message);
    console.warn(message);
  }, []);

  const initialize = useCallback(
    async (nextUser: WorkspaceUser | null) => {
      if (!nextUser) {
        resetWorkspace(null);
        setWorkspaceLoading(false);
        setWorkspaceError(null);
        setWorkspaceResolvedUserId(null);
        return;
      }

      setWorkspaceLoading(true);
      try {
        const data = await fetchBootstrap({ legacyPublicUserId });
        applyBootstrap(data);
        setWorkspaceResolvedUserId(nextUser.id);
      } catch (error) {
        handleRefreshFailure(nextUser, error);
        setWorkspaceResolvedUserId(nextUser.id);
      } finally {
        setWorkspaceLoading(false);
      }
    },
    [applyBootstrap, handleRefreshFailure, legacyPublicUserId, resetWorkspace],
  );

  useEffect(() => {
    if (authLoading) {
      return;
    }

    resetWorkspace(activeWorkspaceUser);
    void initialize(activeWorkspaceUser);
  }, [activeWorkspaceUser, authLoading, initialize, resetWorkspace]);

  const refresh = useCallback(async () => {
    if (!user) {
      return;
    }

    setRefreshing(true);
    setWorkspaceError(null);
    try {
      const data = await fetchBootstrap({ legacyPublicUserId });
      applyBootstrap(data);
      setWorkspaceResolvedUserId(user.id);
    } catch (error) {
      handleRefreshFailure(
        user ? { id: user.id, email: user.email ?? null } : null,
        error,
      );
      setWorkspaceResolvedUserId(user.id);
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

  const clearWorkspaceState = useCallback(() => {
    clearCachedBootstrap();
    setWorkspaceError(null);
    setWorkspaceResolvedUserId(null);
    const emptyBootstrap = getEmptyBootstrap();
    bootstrapRef.current = emptyBootstrap;
    setBootstrap(emptyBootstrap);
  }, []);

  const loading =
    authLoading ||
    workspaceLoading ||
    (Boolean(user) && workspaceResolvedUserId !== user.id);

  return {
    bootstrap,
    loading,
    refreshing,
    saving,
    workspaceError,
    applyBootstrap,
    refresh,
    runMutation,
    clearWorkspaceState,
  };
}
