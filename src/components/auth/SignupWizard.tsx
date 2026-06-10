"use client";

import { useState, useEffect, useTransition } from "react";
import { IdentityStep, type IdentityValues } from "./signup/IdentityStep";
import { WorkspaceStep, type WorkspaceValues } from "./signup/WorkspaceStep";
import { SuccessStep } from "./signup/SuccessStep";

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

  function handleGoogle() {
    setServerError(
      "// تسجيل Google قريباً — يتفعّل بعد توصيل Supabase Auth.",
    );
  }

  function handleSubmit() {
    setServerError(null);
    startTransition(async () => {
      // TODO: real call to /api/auth/signup once Supabase is wired.
      await new Promise((r) => setTimeout(r, 1200));

      // For now we simulate success.
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {
        // ignore
      }
      setStep(3);
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
