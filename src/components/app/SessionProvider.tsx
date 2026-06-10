"use client";

/**
 * Client-side session + tenant context for the قاف app shell.
 *
 * Because the app is a static export (GitHub Pages — no server runtime), every
 * page resolves "who am I / which firm" on the client from the Supabase session.
 *
 * mode:
 *   • "loading" — still resolving the session
 *   • "real"    — signed in AND has a provisioned qaf_users row + tenant → show REAL data
 *   • "demo"    — no session, or DB not set up yet → pages fall back to MOCK_* so the
 *                  marketing/demo experience stays rich during the transition.
 */

import {
  createContext, useContext, useEffect, useMemo, useState, type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase/client";
import {
  fetchMyProfile, fetchMyTenant, maybeProvisionPendingFirm, QafDbError,
} from "@/lib/data/queries";
import type { QafProfile, QafTenant } from "@/lib/data/types";

export type SessionMode = "loading" | "real" | "demo";

interface SessionState {
  mode: SessionMode;
  userId: string | null;
  email: string | null;
  profile: QafProfile | null;
  tenant: QafTenant | null;
  /** convenience: true once a signed-in user has a provisioned firm */
  isReal: boolean;
  /** force a re-fetch (e.g. right after provisioning) */
  refresh: () => void;
}

const Ctx = createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<SessionMode>("loading");
  const [userId, setUserId] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [profile, setProfile] = useState<QafProfile | null>(null);
  const [tenant, setTenant] = useState<QafTenant | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabase();

    async function resolve() {
      const { data: sess } = await sb.auth.getSession();
      const session = sess.session;
      if (!session) {
        if (!cancelled) {
          setUserId(null); setEmail(null); setProfile(null); setTenant(null);
          setMode("demo");
        }
        return;
      }
      if (!cancelled) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
      }
      try {
        let prof = await fetchMyProfile();
        if (!prof || !prof.tenant_id) {
          // Signed in but no firm yet → try to finish a signup-started firm.
          const newId = await maybeProvisionPendingFirm();
          if (newId) {
            prof = await fetchMyProfile();
          }
          if (!prof || !prof.tenant_id) {
            if (!cancelled) { setProfile(prof); setTenant(null); setMode("demo"); }
            return;
          }
        }
        const tn = await fetchMyTenant(prof.tenant_id);
        if (!cancelled) {
          setProfile(prof);
          setTenant(tn);
          setMode(tn ? "real" : "demo");
        }
      } catch (e) {
        // DB not set up yet (qaf_* tables missing) → graceful demo, never crash.
        if (e instanceof QafDbError && e.notReady) {
          if (!cancelled) setMode("demo");
        } else if (!cancelled) {
          setMode("demo");
        }
      }
    }

    resolve();

    const { data: listener } = sb.auth.onAuthStateChange(() => {
      setTick((t) => t + 1); // re-resolve on sign in/out
    });
    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
  }, [tick]);

  const value = useMemo<SessionState>(() => ({
    mode,
    userId,
    email,
    profile,
    tenant,
    isReal: mode === "real",
    refresh: () => setTick((t) => t + 1),
  }), [mode, userId, email, profile, tenant]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Allows components rendered outside the provider (e.g. marketing pages) to
    // call useSession() harmlessly — they just get a static demo state.
    return {
      mode: "demo", userId: null, email: null, profile: null, tenant: null,
      isReal: false, refresh: () => {},
    };
  }
  return ctx;
}
