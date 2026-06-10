"use client";

import { useEffect, useRef, useState } from "react";
import { mountGoogleSignIn, type GoogleSignInResult } from "@/lib/supabase/google-signin";

interface Props {
  onSuccess?: (result: GoogleSignInResult) => void;
  onError?: (err: string) => void;
  buttonText?: "signin_with" | "signup_with" | "continue_with";
}

/**
 * Google sign-in button.
 *
 * CRITICAL: The Google GSI library injects its own iframe into the target div
 * via `container.innerHTML = ""` + renderButton. If React also manages children
 * inside that same node, React's reconciliation crashes with
 * "Failed to execute 'removeChild' on 'Node'".
 *
 * Fix: the Google target div is rendered EMPTY and React never puts children
 * in it (self-closing, suppressHydrationWarning). The loading/error UI lives in
 * SEPARATE sibling nodes that React fully controls. This is the canonical
 * pattern for mounting third-party DOM widgets inside React.
 */
export function GoogleSignInButton({ onSuccess, onError, buttonText = "signin_with" }: Props) {
  const targetRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const target = targetRef.current;
    if (!target) return;

    let cleanup: (() => void) | null = null;

    const safeSetLoading = (v: boolean) => {
      if (mountedRef.current) setLoading(v);
    };
    const safeSetError = (e: string | null) => {
      if (mountedRef.current) setError(e);
    };

    // Defer the GSI mount one tick so React has finished hydrating this
    // subtree before Google mutates the (empty) target node.
    const timer = setTimeout(() => {
      if (!mountedRef.current) return;

      mountGoogleSignIn({
        container: target,
        buttonText,
        onSuccess: (result) => {
          safeSetLoading(false);
          if (!result.ok) safeSetError(result.error || "فشل الدخول بـ Google");
          if (mountedRef.current) onSuccess?.(result);
        },
        onError: (err) => {
          safeSetLoading(false);
          safeSetError(err);
          if (mountedRef.current) onError?.(err);
        },
      })
        .then((c) => {
          cleanup = c;
          safeSetLoading(false);
        })
        .catch((err: unknown) => {
          const msg = err instanceof Error ? err.message : String(err);
          safeSetError(msg);
          safeSetLoading(false);
        });
    }, 0);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonText]);

  return (
    <div className="w-full">
      {/* Google renders its iframe here. React MUST NOT manage children inside. */}
      <div
        ref={targetRef}
        suppressHydrationWarning
        className="w-full min-h-[44px] flex items-center justify-center [color-scheme:light]"
      />
      {/* Loading + error are SEPARATE siblings — React-controlled, never touched by Google */}
      {loading && (
        <div className="w-full h-11 -mt-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] grid place-items-center text-xs text-[var(--text-faint)] pointer-events-none">
          تحميل Google...
        </div>
      )}
      {error && (
        <div className="mt-2 text-[11px] text-[var(--warn)]">⚠ {error}</div>
      )}
    </div>
  );
}
