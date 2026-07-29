"use client";

import { useCallback, useEffect, useState } from "react";

interface FetchState<T> {
  fetcher: (() => Promise<T>) | null;
  reloadCount: number;
  data: T | null;
  error: string | null;
}

/**
 * Runs `fetcher` on mount and again whenever its identity changes, so callers
 * wrap it in `useCallback` with whatever the request depends on (filters,
 * search terms, an id from the URL).
 *
 * `loading` is *derived* from whether the state we hold belongs to the request
 * we currently want, rather than being flipped on with a `setLoading(true)`
 * inside the effect. React 19 flags a synchronous setState in an effect as a
 * cascading render, and this keeps the loading flag correct when the fetcher
 * changes: it becomes true again on the very render that changes it, not one
 * render later.
 *
 * @example
 * const fetchUsers = useCallback(() => adminAPI.getUsers({ role }), [role]);
 * const { data, loading, reload } = useApiData(fetchUsers);
 */
export function useApiData<T>(fetcher: () => Promise<T>) {
  const [reloadCount, setReloadCount] = useState(0);
  const [state, setState] = useState<FetchState<T>>({
    fetcher: null,
    reloadCount: -1,
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    fetcher()
      .then((data) => {
        if (!cancelled) setState({ fetcher, reloadCount, data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setState({
            fetcher,
            reloadCount,
            data: null,
            error: err instanceof Error ? err.message : "Request failed",
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [fetcher, reloadCount]);

  const isCurrent =
    state.fetcher === fetcher && state.reloadCount === reloadCount;

  // Re-runs the current fetcher, e.g. after a mutation
  const reload = useCallback(() => setReloadCount((count) => count + 1), []);

  // Applies a local change without a round trip, e.g. after an optimistic update
  const mutate = useCallback((update: (current: T | null) => T | null) => {
    setState((current) => ({ ...current, data: update(current.data) }));
  }, []);

  return {
    data: isCurrent ? state.data : null,
    error: isCurrent ? state.error : null,
    loading: !isCurrent,
    reload,
    mutate,
  };
}
