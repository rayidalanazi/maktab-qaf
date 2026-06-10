"use client";

import { useEffect, useRef, useState } from "react";
import { mountGoogleSignIn, type GoogleSignInResult } from "@/lib/supabase/google-signin";

interface Props {
  onSuccess?: (result: GoogleSignInResult) => void;
  onError?: (err: string) => void;
  buttonText?: "signin_with" | "signup_with" | "continue_with";
}

export function GoogleSignInButton({ onSuccess, onError, buttonText = "signin_with" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
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
    // Defer GSI mount slightly so the rest of the form hydrates first.
    // Inside cross-origin sandboxed iframes (CI preview tools, embedded
    // dev tools) the GSI button iframe can be aborted, but the host page
    // is fine — this delay prevents the abort from blocking React hydration.
    if (typeof window === "undefined") return;
    if (!containerRef.current) return;
    let cleanup: (() => void) | null = null;

    const safeSetLoading = (v: boolean) => {
      if (mountedRef.current) setLoading(v);
    };
    const safeSetError = (e: string | null) => {
      if (mountedRef.current) setError(e);
    };

    const timer = setTimeout(() => {
      if (!mountedRef.current || !containerRef.current) return;

      mountGoogleSignIn({
        container: containerRef.current,
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
    }, 100);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buttonText]);

  return (
    <div className="w-full">
      <div
        ref={containerRef}
        className="w-full min-h-[44px] flex items-center justify-center"
      >
        {loading && (
          <div className="w-full h-11 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] grid place-items-center text-xs text-[var(--text-faint)]">
            تحميل Google...
          </div>
        )}
      </div>
      {error && (
        <div className="mt-2 text-[11px] text-[var(--warn)]">
          ⚠ {error}
        </div>
      )}
    </div>
  );
}
