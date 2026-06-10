"use client";

import { useState } from "react";
import { Input } from "@/components/ui/Input";
import {
  validateEmail,
  validatePassword,
  validateFullName,
  normalizeSaudiPhone,
} from "@/lib/signup-validation";

export interface IdentityValues {
  fullName: string;
  email: string;
  password: string;
  phone: string;
}

interface Props {
  values: IdentityValues;
  setValues: (v: IdentityValues) => void;
  onNext: () => void;
  onGoogle: () => void;
}

export function IdentityStep({ values, setValues, onNext, onGoogle }: Props) {
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof IdentityValues, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof IdentityValues, boolean>>>({});

  const passResult = validatePassword(values.password);

  function update<K extends keyof IdentityValues>(key: K, v: IdentityValues[K]) {
    setValues({ ...values, [key]: v });
    if (errors[key]) setErrors({ ...errors, [key]: undefined });
  }

  function blur(key: keyof IdentityValues) {
    setTouched({ ...touched, [key]: true });
    runValidate({ ...errors }, key);
  }

  function runValidate(next: typeof errors, only?: keyof IdentityValues): boolean {
    if (!only || only === "fullName") {
      const r = validateFullName(values.fullName);
      next.fullName = r.ok ? undefined : r.reason;
    }
    if (!only || only === "email") {
      const r = validateEmail(values.email);
      next.email = r.ok ? undefined : r.reason;
    }
    if (!only || only === "password") {
      const r = validatePassword(values.password);
      next.password = r.ok ? undefined : r.reason;
    }
    if (!only || only === "phone") {
      if (values.phone) {
        const n = normalizeSaudiPhone(values.phone);
        next.phone = n ? undefined : "الجوال يبدأ بـ 5 ويتكون من 9 أرقام بعدها.";
      } else {
        next.phone = undefined;
      }
    }
    setErrors(next);
    return !next.fullName && !next.email && !next.password && !next.phone;
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (runValidate({})) {
      // Normalize phone before moving forward
      if (values.phone) {
        const n = normalizeSaudiPhone(values.phone);
        if (n) setValues({ ...values, phone: n });
      }
      onNext();
    }
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <button
        type="button"
        onClick={onGoogle}
        className="btn btn-ghost w-full py-3 text-sm"
      >
        <span className="text-base">🇬</span>
        تابع بـ Google — أسرع طريق
      </button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-mono text-[var(--text-faint)]">
          <span className="bg-[var(--bg)] px-3">أو بالإيميل</span>
        </div>
      </div>

      <Input
        label="اسمك الكامل"
        type="text"
        autoComplete="name"
        required
        placeholder="محمد عبدالله الراشد"
        value={values.fullName}
        onChange={(e) => update("fullName", e.target.value)}
        onBlur={() => blur("fullName")}
        error={touched.fullName ? errors.fullName : undefined}
      />

      <Input
        label="بريدك الإلكتروني"
        type="email"
        autoComplete="email"
        inputMode="email"
        dir="ltr"
        required
        placeholder="you@firm.sa"
        value={values.email}
        onChange={(e) => update("email", e.target.value.trim())}
        onBlur={() => blur("email")}
        error={touched.email ? errors.email : undefined}
        help="نرسل عليه رابط التفعيل وفواتيرك"
      />

      <div>
        <Input
          label="كلمة المرور"
          type={showPass ? "text" : "password"}
          autoComplete="new-password"
          required
          dir="ltr"
          placeholder="8 أحرف على الأقل"
          value={values.password}
          onChange={(e) => update("password", e.target.value)}
          onBlur={() => blur("password")}
          error={touched.password ? errors.password : undefined}
          rightAddon={
            <button
              type="button"
              onClick={() => setShowPass((v) => !v)}
              className="text-xs hover:text-[var(--brand)]"
            >
              {showPass ? "إخفاء" : "إظهار"}
            </button>
          }
        />
        {values.password && (
          <div className="mt-2 flex gap-1">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex-1 h-1 rounded-full transition-colors"
                style={{
                  background:
                    i <= passResult.strength
                      ? passResult.strength === 4
                        ? "var(--brand)"
                        : passResult.strength === 3
                          ? "var(--brand-soft)"
                          : "var(--warn)"
                      : "var(--border)",
                }}
              />
            ))}
          </div>
        )}
      </div>

      <Input
        label="جوالك"
        help="اختياري — للاستعادة عبر واتساب"
        type="tel"
        autoComplete="tel"
        inputMode="numeric"
        dir="ltr"
        placeholder="5XXXXXXXX"
        value={values.phone}
        onChange={(e) => update("phone", e.target.value)}
        onBlur={() => blur("phone")}
        error={touched.phone ? errors.phone : undefined}
        leftAddon={<span className="font-mono text-xs">+966</span>}
      />

      <button type="submit" className="btn btn-brand w-full py-3.5">
        التالي: اختر اسم نطاقك
        <span className="arrow-flip">→</span>
      </button>

      <p className="text-[10px] text-[var(--text-faint)] text-center font-mono">
        // بالضغط، توافق على الشروط وسياسة الخصوصية المتوافقة مع PDPL
      </p>
    </form>
  );
}
