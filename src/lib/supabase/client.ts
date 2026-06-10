"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser-side Supabase client (singleton).
 *
 * Defaults: shared with the lawyer-payments project so existing Google OAuth +
 * user accounts work out of the box. To point قاف at its own Supabase project,
 * set NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local.
 *
 * Anon keys are PUBLIC by design — RLS at the DB enforces real authorization.
 */

const FALLBACK_URL = "https://lyubbwadtflgouzptvcd.supabase.co";
const FALLBACK_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx5dWJid2FkdGZsZ291enB0dmNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMTc4MTMsImV4cCI6MjA5NDU5MzgxM30.pE5611t9fmjbfQMpNpgBzr8YB905xbmRIoKQI_OQE8o";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_URL;
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_ANON;

// Google OAuth client ID — shared with lawyer-payments project.
// Configured in Google Cloud Console under "Web application" → authorized JS origins.
export const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  "106593971410-kmup8pm7il92hthri5luegsnm2jbppdq.apps.googleusercontent.com";

let cached: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (cached) return cached;
  cached = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return cached;
}
