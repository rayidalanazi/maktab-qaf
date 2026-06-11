"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";
import { ADDONS, BUNDLES } from "@/data/pricing";
import { ADMIN_TENANTS } from "@/data/admin-mock";

type GrantType = "free_addon" | "free_upgrade" | "extended_trial" | "discount" | "comp_seats";

const GRANT_TYPES: { key: GrantType; label: string; icon: string; desc: string }[] = [
  { key: "free_addon", label: "ميزة مجانية", icon: "🧩", desc: "فعّل إضافة مدفوعة مجاناً لفترة" },
  { key: "free_upgrade", label: "ترقية مجانية", icon: "⬆", desc: "ارفع باقته لفترة تجريبية" },
  { key: "extended_trial", label: "تمديد التجربة", icon: "⏳", desc: "أيام إضافية على التجربة المجانية" },
  { key: "discount", label: "خصم", icon: "٪", desc: "نسبة خصم على الاشتراك" },
  { key: "comp_seats", label: "مقاعد مجانية", icon: "👥", desc: "مستخدمون إضافيون بدون رسوم" },
];

const DURATIONS = [
  { d: 7, label: "7 أيام" },
  { d: 14, label: "14 يوم" },
  { d: 30, label: "30 يوم" },
  { d: 90, label: "90 يوم" },
  { d: 0, label: "دائم" },
];

type TenantOption = { id: string | number; slug: string; name: string; plan: string };

interface Props {
  open: boolean;
  onClose: () => void;
  /** Pre-select a tenant (when opened from a tenant page). */
  tenantSlug?: string;
  /** Tenant options (live rows or mapped mocks). Defaults to the built-in mock list. */
  tenants?: TenantOption[];
  /** LIVE mode: persist the grant. Demo (undefined) keeps the local-only behavior. */
  onGrant?: (args: {
    tenantId: string;
    addonKey: string;
    label: string;
    expiresAt: string | null;
    reason: string;
    grantType: GrantType;
  }) => Promise<void> | void;
}

export function GrantFeatureDialog({ open, onClose, tenantSlug, tenants, onGrant }: Props) {
  const { toast } = useToast();
  const tenantList: TenantOption[] = tenants && tenants.length > 0 ? tenants : ADMIN_TENANTS;
  const [type, setType] = useState<GrantType>("free_addon");
  const [tenant, setTenant] = useState(tenantSlug || tenantList[0].slug);
  const [addonKey, setAddonKey] = useState(ADDONS.find((a) => a.price_monthly_sar > 0)?.key || "");
  const [bundleKey, setBundleKey] = useState(BUNDLES[2]?.key || "");
  const [days, setDays] = useState(14);
  const [percent, setPercent] = useState(25);
  const [seats, setSeats] = useState(3);
  const [reason, setReason] = useState("");
  const [notify, setNotify] = useState(true);
  const [autoConvert, setAutoConvert] = useState(false);

  const selectedTenant = tenantList.find((t) => t.slug === tenant) ?? tenantList[0];
  const tenantName = selectedTenant?.name || tenant;

  const summary = useMemo(() => {
    const dur = days === 0 ? "بشكل دائم" : `لمدة ${days} يوم`;
    switch (type) {
      case "free_addon": {
        const a = ADDONS.find((x) => x.key === addonKey);
        return `منح «${a?.name_ar}» مجاناً لـ ${tenantName} ${dur}.`;
      }
      case "free_upgrade": {
        const b = BUNDLES.find((x) => x.key === bundleKey);
        return `ترقية ${tenantName} إلى باقة «${b?.name_ar}» مجاناً ${dur}.`;
      }
      case "extended_trial":
        return `تمديد تجربة ${tenantName} بـ ${days} يوم إضافية.`;
      case "discount":
        return `خصم ${percent}% على اشتراك ${tenantName} ${dur}.`;
      case "comp_seats":
        return `منح ${tenantName} عدد ${seats} مقاعد مجانية ${dur}.`;
    }
  }, [type, addonKey, bundleKey, days, percent, seats, tenantName]);

  function submit() {
    if (onGrant && selectedTenant) {
      // LIVE — persist the grant (insert + enable addon), then confirm.
      const expiresAt = days === 0 ? null : new Date(Date.now() + days * 86_400_000).toISOString().slice(0, 10);
      const grantedKey = type === "free_addon" ? addonKey : type === "free_upgrade" ? bundleKey : type;
      const label =
        type === "free_addon" ? (ADDONS.find((x) => x.key === addonKey)?.name_ar ?? addonKey)
        : type === "free_upgrade" ? `ترقية لباقة ${BUNDLES.find((x) => x.key === bundleKey)?.name_ar ?? bundleKey}`
        : type === "extended_trial" ? `تمديد التجربة ${days} يوم`
        : type === "discount" ? `خصم ${percent}%`
        : `${seats} مقاعد مجانية`;
      void Promise.resolve(onGrant({
        tenantId: String(selectedTenant.id),
        addonKey: grantedKey,
        label,
        expiresAt,
        reason,
        grantType: type,
      }))
        .then(() => { toast(summary || "تم المنح", "success"); onClose(); })
        .catch((e) => toast(e instanceof Error ? e.message : String(e), "warn"));
      return;
    }
    // Demo — no backend: confirm the action visually + log the intent.
    // eslint-disable-next-line no-console
    console.log("[grant]", { type, tenant, addonKey, bundleKey, days, percent, seats, reason, notify, autoConvert });
    toast(summary || "تم المنح", "success");
    onClose();
  }

  const field = (label: string, node: React.ReactNode, help?: string) => (
    <label className="block mb-4">
      <div className="text-xs font-semibold mb-1.5">{label}</div>
      {node}
      {help && <div className="text-[10px] text-[var(--text-faint)] mt-1">{help}</div>}
    </label>
  );

  const selectCls =
    "w-full px-3 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm";

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="🎁 منح ميزة / ترقية"
      sub="فعّل ميزة أو ترقية مجاناً لفترة محددة — تماماً كبداية اشتراك جديد"
      size="lg"
      footer={
        <>
          <button onClick={onClose} className="btn btn-ghost text-sm py-2.5">إلغاء</button>
          <button onClick={submit} className="btn btn-brand text-sm py-2.5">تأكيد المنح</button>
        </>
      }
    >
      {/* Grant type */}
      <div className="text-xs font-semibold mb-2">نوع المنح</div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
        {GRANT_TYPES.map((g) => (
          <button
            key={g.key}
            type="button"
            onClick={() => setType(g.key)}
            className={`text-right p-2.5 rounded-lg border transition-all ${
              type === g.key
                ? "border-[var(--brand)] bg-[var(--brand)]/10"
                : "border-[var(--border)] hover:border-[var(--border-strong)]"
            }`}
          >
            <div className="text-lg mb-0.5">{g.icon}</div>
            <div className="text-xs font-bold">{g.label}</div>
            <div className="text-[10px] text-[var(--text-faint)] leading-tight">{g.desc}</div>
          </button>
        ))}
      </div>

      {/* Tenant */}
      {field(
        "المكتب",
        <select value={selectedTenant?.slug ?? tenant} onChange={(e) => setTenant(e.target.value)} className={selectCls}>
          {tenantList.map((t) => (
            <option key={t.slug} value={t.slug}>{t.name} — {t.plan}</option>
          ))}
        </select>,
      )}

      {/* Type-specific target */}
      {type === "free_addon" &&
        field(
          "الإضافة",
          <select value={addonKey} onChange={(e) => setAddonKey(e.target.value)} className={selectCls}>
            {ADDONS.filter((a) => a.price_monthly_sar > 0).map((a) => (
              <option key={a.key} value={a.key}>{a.name_ar} ({a.price_monthly_sar} ر.س/شهر)</option>
            ))}
          </select>,
        )}
      {type === "free_upgrade" &&
        field(
          "الباقة",
          <select value={bundleKey} onChange={(e) => setBundleKey(e.target.value)} className={selectCls}>
            {BUNDLES.map((b) => (
              <option key={b.key} value={b.key}>{b.name_ar} ({b.price_monthly_sar} ر.س/شهر)</option>
            ))}
          </select>,
        )}
      {type === "discount" &&
        field(
          `نسبة الخصم: ${percent}%`,
          <input type="range" min={5} max={100} step={5} value={percent}
            onChange={(e) => setPercent(+e.target.value)} className="w-full accent-[var(--brand)]" />,
        )}
      {type === "comp_seats" &&
        field(
          "عدد المقاعد المجانية",
          <input type="number" min={1} max={50} value={seats}
            onChange={(e) => setSeats(+e.target.value)} className={selectCls} dir="ltr" />,
        )}

      {/* Duration (not for permanent comp_seats which can be permanent too) */}
      {field(
        "المدة",
        <div className="flex flex-wrap gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d.d}
              type="button"
              onClick={() => setDays(d.d)}
              className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${
                days === d.d
                  ? "border-[var(--brand)] bg-[var(--brand)]/10 text-[var(--brand)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>,
        type === "extended_trial" ? "عدد الأيام المضافة للتجربة" : "بعد المدة تعود الميزة لحالتها أو تتحوّل لمدفوعة",
      )}

      {/* Reason */}
      {field(
        "السبب (داخلي)",
        <input value={reason} onChange={(e) => setReason(e.target.value)}
          placeholder="مثال: عرض إطلاق / إقناع بالترقية / شريك إحالة"
          className={selectCls} />,
      )}

      {/* Options */}
      <div className="space-y-2 mb-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer">
          <input type="checkbox" checked={notify} onChange={(e) => setNotify(e.target.checked)} className="accent-[var(--brand)]" />
          إشعار المكتب بالمنحة (يصله بريد + إشعار داخل النظام)
        </label>
        {days !== 0 && (
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input type="checkbox" checked={autoConvert} onChange={(e) => setAutoConvert(e.target.checked)} className="accent-[var(--brand)]" />
            تحويلها لمدفوعة تلقائياً عند الانتهاء (بدل الإلغاء)
          </label>
        )}
      </div>

      {/* Live summary */}
      <div className="rounded-lg border border-[var(--brand)]/30 bg-[var(--brand)]/8 p-3 text-sm">
        <span className="text-[10px] font-mono text-[var(--brand)] block mb-1">// الملخّص</span>
        {summary}
      </div>
    </Modal>
  );
}
