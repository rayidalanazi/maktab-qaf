"use client";

import { getSupabase, GOOGLE_CLIENT_ID } from "./client";

/**
 * Google ID Token sign-in flow (matches lawyer-payments approach).
 *
 * Steps:
 *   1. Load Google's GSI library if not already loaded
 *   2. Generate a raw nonce and its SHA-256 hash
 *   3. Initialize Google's One Tap with the hashed nonce
 *   4. Render the official Google sign-in button into the given container
 *   5. On Google credential callback, exchange ID token for Supabase session
 *      using the RAW nonce (Supabase hashes internally to verify)
 *
 * Works on static sites (GitHub Pages) — no server redirect required.
 */

declare global {
  interface Window {
    google?: {
      accounts?: {
        id: {
          initialize: (cfg: GoogleInitConfig) => void;
          renderButton: (el: HTMLElement, opts: GoogleButtonOpts) => void;
          prompt: () => void;
          cancel: () => void;
          disableAutoSelect: () => void;
        };
      };
    };
  }
}

interface GoogleCredentialResponse {
  credential: string;
  select_by?: string;
}

interface GoogleInitConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  nonce: string;
  use_fedcm_for_prompt?: boolean;
  itp_support?: boolean;
  auto_select?: boolean;
}

interface GoogleButtonOpts {
  type?: "standard" | "icon";
  theme?: "outline" | "filled_blue" | "filled_black";
  size?: "large" | "medium" | "small";
  text?: "signin_with" | "signup_with" | "continue_with" | "signin";
  shape?: "rectangular" | "pill" | "circle" | "square";
  logo_alignment?: "left" | "center";
  width?: number;
  locale?: string;
}

const GSI_SRC = "https://accounts.google.com/gsi/client";

async function loadGSI(): Promise<void> {
  if (typeof window === "undefined") throw new Error("ssr");
  if (window.google?.accounts?.id) return;
  if (document.querySelector(`script[src="${GSI_SRC}"]`)) {
    // already loading — wait until window.google is ready
    await new Promise<void>((resolve) => {
      const check = () => {
        if (window.google?.accounts?.id) resolve();
        else setTimeout(check, 100);
      };
      check();
    });
    return;
  }
  await new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gsi-load-failed"));
    document.head.appendChild(s);
  });
}

async function sha256ToBase64Url(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  let bin = "";
  for (const b of new Uint8Array(hash)) bin += String.fromCharCode(b);
  // base64url
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function randomNonce(): string {
  const arr = new Uint8Array(24);
  crypto.getRandomValues(arr);
  let bin = "";
  for (const b of arr) bin += String.fromCharCode(b);
  return btoa(bin).replace(/=+$/, "");
}

export interface GoogleSignInResult {
  ok: boolean;
  error?: string;
  user?: { id: string; email?: string; name?: string };
}

export interface MountOptions {
  container: HTMLElement;
  onSuccess: (result: GoogleSignInResult) => void;
  onError?: (err: string) => void;
  buttonText?: GoogleButtonOpts["text"];
}

/**
 * Mount the Google sign-in button into the given container and wire it
 * to Supabase signInWithIdToken.
 *
 * Returns a cleanup function.
 */
export async function mountGoogleSignIn({
  container,
  onSuccess,
  onError,
  buttonText = "signin_with",
}: MountOptions): Promise<() => void> {
  let cancelled = false;

  try {
    await loadGSI();
    if (cancelled || !window.google?.accounts?.id) return () => {};

    const rawNonce = randomNonce();
    const hashedNonce = await sha256ToBase64Url(rawNonce);

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      nonce: hashedNonce,
      use_fedcm_for_prompt: true,
      itp_support: true,
      auto_select: false,
      callback: async (resp) => {
        if (cancelled || !resp.credential) return;
        try {
          const sb = getSupabase();
          const { data, error } = await sb.auth.signInWithIdToken({
            provider: "google",
            token: resp.credential,
            nonce: rawNonce,
          });
          if (error) {
            onError?.(error.message);
            onSuccess({ ok: false, error: error.message });
            return;
          }
          onSuccess({
            ok: true,
            user: {
              id: data.user?.id ?? "",
              email: data.user?.email,
              name: data.user?.user_metadata?.full_name,
            },
          });
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          onError?.(msg);
          onSuccess({ ok: false, error: msg });
        }
      },
    });

    // Make sure the container is empty before rendering
    container.innerHTML = "";
    window.google.accounts.id.renderButton(container, {
      type: "standard",
      theme: "filled_black",
      size: "large",
      text: buttonText,
      shape: "rectangular",
      logo_alignment: "left",
      width: Math.min(container.clientWidth || 320, 400),
      locale: "ar",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    onError?.(msg);
  }

  return () => {
    cancelled = true;
    try {
      window.google?.accounts?.id?.cancel?.();
    } catch {
      // ignore
    }
  };
}

/**
 * Helper to check if there's an active Supabase session.
 */
export async function getCurrentUser() {
  const sb = getSupabase();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return null;
  return data.user;
}

/**
 * Sign out everywhere.
 */
export async function signOut() {
  const sb = getSupabase();
  await sb.auth.signOut();
}
