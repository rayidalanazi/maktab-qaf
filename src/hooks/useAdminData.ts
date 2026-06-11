"use client";

/**
 * Data hook for ADMIN (operator) pages.
 *
 *   • mode "live" (signed-in platform admin) → real cross-tenant rows from
 *     Supabase. Empty results stay empty — the operator sees the truth.
 *   • mode "demo" (passphrase showcase) → the provided mock, no network.
 *
 * Usage:
 *   const { data: tenants, isLive, reload } = useAdminData(fetchAdminTenants, ADMIN_TENANTS_MOCK);
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { useAdminSession } from "@/components/admin/AdminGate";
import { QafDbError } from "@/lib/data/queries";

export interface AdminDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
  isLive: boolean;
  /** re-fetch after a control action (grant, suspend, plan change) */
  reload: () => void;
}

export function useAdminData<T>(
  fetcher: () => Promise<T[]>,
  mock: T[],
): AdminDataResult<T> {
  const { mode } = useAdminSession();
  const [data, setData] = useState<T[]>(mock);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  useEffect(() => {
    let cancelled = false;

    if (mode === "loading") { setLoading(true); return; }

    if (mode === "demo") {
      setData(mock);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    fetcherRef.current()
      .then((rows) => { if (!cancelled) { setData(rows); setError(null); } })
      .catch((e) => {
        if (cancelled) return;
        if (e instanceof QafDbError && e.notReady) setData(mock);
        else setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, tick]);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  return { data, loading, error, isLive: mode === "live", reload };
}
