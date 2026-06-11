"use client";

/**
 * Generic data hook for قاف app pages.
 *
 * Behaviour by session mode:
 *   • "real" → fetch live rows from Supabase (RLS-scoped to the firm). Returns
 *              them even when empty (a real firm with 0 cases sees an empty state,
 *              NOT mock data).
 *   • "demo" → return the provided MOCK_* immediately (no network), so the public
 *              demo stays rich until the firm's DB is set up + seeded.
 *   • "loading" → loading=true until the session resolves.
 *
 * Usage in a page (client component):
 *   const { data, loading, mode } = useQafData(fetchCases, MOCK_CASES);
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/components/app/SessionProvider";
import { QafDbError } from "@/lib/data/queries";

export interface QafDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  mode: "loading" | "real" | "demo";
  /** true when showing MOCK fallback rather than live rows */
  isDemo: boolean;
  /** re-fetch after a create/update (e.g. after "+ new case") */
  reload: () => void;
}

export function useQafData<T>(
  fetcher: () => Promise<T[]>,
  mock: T[],
): QafDataResult<T> {
  const { mode } = useSession();
  const [data, setData] = useState<T[]>(mock);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    if (mode === "loading") {
      setLoading(true);
      return;
    }

    if (mode === "demo") {
      setData(mock);
      setLoading(false);
      setError(null);
      return;
    }

    // mode === "real"
    setLoading(true);
    fetcherRef.current()
      .then((rows) => {
        if (cancelled) return;
        setData(rows);
        setError(null);
      })
      .catch((e) => {
        if (cancelled) return;
        // DB vanished mid-session → degrade to mock rather than blanking the page.
        if (e instanceof QafDbError && e.notReady) {
          setData(mock);
        } else {
          setError(e instanceof Error ? e.message : String(e));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, mode, isDemo: mode !== "real", reload };
}
