"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { IdentityStep, type IdentityValues } from "./signup/IdentityStep";
import { WorkspaceStep, type WorkspaceValues } from "./signup/WorkspaceStep";
import { SuccessStep } from "./signup/SuccessStep";
import { getSupabase } from "@/lib/supabase/client";
import { provisionTenant, PENDING_FIRM_KEY, QafDbError } from "@/lib/data/queries";
import type { GoogleSignInResult } from "@/lib/supabase/google-signin";

/** The app shell route. The real firm is resolved from the session on the client. */
const APP_SHELL_HREF = "/t/raed";

type Step = 1 | 2 | 3;

const DRAFT_KEY = "qaf_signup_draft";
const DRAFT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface DraftShape {
  identity: Omit<IdentityValues, "password">;
  workspace: WorkspaceValues;
  step: Step;
  savedAt: number;
}

export function SignupWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [identity, setIdentity] = useState<IdentityValues>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
  });
  const [workspace, setWorkspace] = useState<WorkspaceValues>({
    firmNameAr: "",
    subdomain: "",
    firmSize: "",
    tosAccept: false,
  });
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);

  // Restore draft from localStorage (password never stored).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const draft = JSON.parse(raw) as DraftShape;
      if (Date.now() - draft.savedAt > DRAFT_TTL_MS) {
        localStorage.removeItem(DRAFT_KEY);
        return;
      }
      setIdentity((p) => ({ ...p, ...draft.identity }));
      setWorkspace(draft.workspace);
      setStep(draft.step);
    } catch {
      // ignore corrupt draft
    }
  }, []);

  // Persist draft on change (excluding password).
  useEffect(() => {
    try {
      const draft: DraftShape = {
        identity: {
          fullName: identity.fullName,
          email: identity.email,
          phone: identity.phone,
        },
        workspace,
        step,
        savedAt: Date.now(),
      };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    } catch {
      // localStorage unavailable / quota — ignore
    }
  }, [identity.fullName, identity.email, identity.phone, workspace, step]);

  function handleGoogle(result: GoogleSignInResult) {
    if (!result.ok) {
      setServerError(result.error || "فشل الدخول بـ Google");
      return;
    }
    // Google signed up = identity step done. Pre-fill identity from Google
    // and advance to workspace selection.
    if (result.user) {
      setIdentity((p) => ({
        ...p,
        fullName: result.user?.name || p.fullName,
        email: result.user?.email || p.email,
      }));
    }
    setStep(2);
  }

  function handleSubmit() {
    setServerError(null);
    startTransition(async () => {
      try {
        const sb = getSupabase();

        // Only create an auth user if we don't already have a session
        // (Google sign-in completes earlier and gives us one).
        const { data: sessionData } = await sb.auth.getSession();
        let haveSession = !!sessionData.session;
        if (!haveSession) {
          const { data: signUpData, error: signupErr } = await sb.auth.signUp({
            email: identity.email,
            password: identity.password,
            options: {
              data: {
                full_name: identity.fullName,
                phone: identity.phone,
              },
            },
          });
          if (signupErr) {
            setServerError(translateSignupError(signupErr.message));
            return;
          }
          haveSession = !!signUpData.session; // false when email confirmation is on
        }

        // Remember the firm so provisioning completes even if the session isn't
        // ready yet (email-confirmation flow finishes it on first real login).
        const pending = {
          slug: workspace.subdomain.toLowerCase(),
          name: workspace.firmNameAr,
          fullName: identity.fullName,
        };
        try {
          localStorage.setItem(PENDING_FIRM_KEY, JSON.stringify(pending));
        } catch {
          // ignore
        }

        // If we already have a live session, create the firm right now.
        if (haveSession) {
          try {
            await provisionTenant({
              slug: pending.slug,
              name: pending.name,
              fullName: pending.fullName,
            });
            try { localStorage.removeItem(PENDING_FIRM_KEY); } catch { /* ignore */ }
          } catch (e) {
            // qaf_* not set up yet → keep the pending firm; app runs in demo mode.
            if (!(e instanceof QafDbError && e.notReady)) {
              const msg = e instanceof Error ? e.message : String(e);
              // Non-fatal: surface but still let them into the app.
              console.warn("provisionTenant failed:", msg);
            }
          }
        }

        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          // ignore
        }
        setStep(3);

        // Auto-redirect into the app shell (real firm resolved from session).
        setTimeout(() => router.replace(APP_SHELL_HREF), 3000);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setServerError(`صار خلل: ${msg}`);
      }
    });
  }

  return (
    <div>
      {/* Progress strip */}
      {step < 3 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            {[1, 2].map((n) => (
              <div
                key={n}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{
                  background: step >= n ? "var(--brand)" : "var(--border)",
                }}
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-widest text-[var(--text-faint)]">
            <span>الخطوة {step} من 2</span>
            <span>~ 60 ثانية</span>
          </div>
        </div>
      )}

      {step === 1 && (
        <div>
          <div className="mb-5">
            <h1 className="font-display font-black text-3xl sm:text-4xl mb-2 leading-tight">
              ابدأ تجربتك المجانية
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              14 يوم. بدون بطاقة. بدون التزام. // اللي يبي يجرب، يجرب الحين
            </p>
          </div>
          <IdentityStep
            values={identity}
            setValues={setIdentity}
            onNext={() => setStep(2)}
            onGoogle={handleGoogle}
          />
        </div>
      )}

      {step === 2 && (
        <div>
          <div className="mb-5">
            <h1 className="font-display font-black text-3xl sm:text-4xl mb-2 leading-tight">
              سمِّ مكتبك
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              اسم النطاق يصير عنوان مكتبك على قاف. // الاسم خفيف، التوقيع ثقيل
            </p>
          </div>
          <WorkspaceStep
            values={workspace}
            setValues={setWorkspace}
            onBack={() => setStep(1)}
            onSubmit={handleSubmit}
            submitting={pending}
          />
        </div>
      )}

      {step === 3 && (
        <SuccessStep
          firmNameAr={workspace.firmNameAr}
          subdomain={workspace.subdomain}
        />
      )}

      {serverError && step !== 3 && (
        <div className="mt-4 text-[12px] text-[var(--warn)] bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg p-3 leading-relaxed">
          {serverError}
        </div>
      )}
    </div>
  );
}

function translateSignupError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("already registered") || m.includes("already exists") || m.includes("user already")) {
    return "في حساب موجود بهالإيميل. ادخل من تسجيل الدخول.";
  }
  if (m.includes("password should be")) {
    return "كلمة المرور ضعيفة. 8 خانات على الأقل، فيها رقم ورمز.";
  }
  if (m.includes("invalid email")) {
    return "البريد الإلكتروني غير صالح.";
  }
  if (m.includes("rate limit") || m.includes("too many")) {
    return "حاولت كثير. خذ نَفَس وارجع بعد دقيقة.";
  }
  return msg;
}
