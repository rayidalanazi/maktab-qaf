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
  createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode,
} from "react";
import { getSupabase } from "@/lib/supabase/client";
import {
  fetchMyProfile, fetchMyTenant, maybeProvisionPendingFirm, maybeAcceptInvitation,
  isPlatformAdmin, QafDbError,
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
  /** true when this user is the subscription OWNER (created the firm), vs an employee */
  isOwner: boolean;
  /** true when the signed-in user is a قاف platform operator (qaf_platform_admins) */
  isOperator: boolean;
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
  const [isOperator, setIsOperator] = useState(false);
  const resolveRef = useRef<() => void>(() => {});

  useEffect(() => {
    let cancelled = false;
    const sb = getSupabase();

    async function resolve() {
      const { data: sess } = await sb.auth.getSession();
      const session = sess.session;
      if (!session) {
        if (!cancelled) {
          setUserId(null); setEmail(null); setProfile(null); setTenant(null);
          setIsOperator(false);
          setMode("demo");
        }
        return;
      }
      if (!cancelled) {
        setUserId(session.user.id);
        setEmail(session.user.email ?? null);
      }
      // Operator check runs in parallel with profile resolution — non-blocking.
      isPlatformAdmin()
        .then((v) => { if (!cancelled) setIsOperator(v); })
        .catch(() => { if (!cancelled) setIsOperator(false); });
      try {
        let prof = await fetchMyProfile();
        if (!prof || !prof.tenant_id) {
          // Signed in but no firm yet → try to finish a signup-started firm.
          const newId = await maybeProvisionPendingFirm();
          if (newId) {
            prof = await fetchMyProfile();
          }
          // …or join a firm that invited this email (team invitation).
          if (!prof || !prof.tenant_id) {
            const joinedId = await maybeAcceptInvitation();
            if (joinedId) prof = await fetchMyProfile();
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

    resolveRef.current = () => { void resolve(); };

    // Resolve once on mount.
    void resolve();

    // Subscribe ONCE and re-resolve ONLY on real auth transitions. We must NOT
    // make this effect depend on a counter we bump from inside the callback:
    // onAuthStateChange emits INITIAL_SESSION immediately on every subscribe, so
    // re-subscribing per change created an INITIAL_SESSION feedback loop that
    // pegged the main thread and froze the page on any interaction.
    const { data: listener } = sb.auth.onAuthStateChange((event) => {
      if (
        event === "SIGNED_IN" || event === "SIGNED_OUT" ||
        event === "TOKEN_REFRESHED" || event === "USER_UPDATED"
      ) {
        void resolve();
      }
    });

    return () => {
      cancelled = true;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<SessionState>(() => ({
    mode,
    userId,
    email,
    profile,
    tenant,
    isReal: mode === "real",
    isOwner: !!(profile && tenant?.owner_id && profile.id === tenant.owner_id),
    isOperator,
    refresh: () => resolveRef.current(),
  }), [mode, userId, email, profile, tenant, isOperator]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSession(): SessionState {
  const ctx = useContext(Ctx);
  if (!ctx) {
    // Allows components rendered outside the provider (e.g. marketing pages) to
    // call useSession() harmlessly — they just get a static demo state.
    return {
      mode: "demo", userId: null, email: null, profile: null, tenant: null,
      isReal: false, isOwner: false, isOperator: false, refresh: () => {},
    };
  }
  return ctx;
}
