"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { Modal } from "@/components/ui/Modal";
import { useSession } from "@/components/app/SessionProvider";
import { purchaseAddons } from "@/lib/data/queries";
import { ADDONS, CATEGORIES } from "@/data/pricing";
import type { Addon } from "@/types/pricing";

/** Resolve an addon + its unmet dependencies (the keys we'd actually enable). */
function resolveDeps(key: string, owned: Set<string>, map: Map<string, Addon>): string[] {
  const out = new Set<string>();
  const visit = (k: string) => {
    if (owned.has(k) || out.has(k)) return;
    out.add(k);
    (map.get(k)?.requires || []).forEach(visit);
  };
  visit(key);
  return [...out];
}

type FilterKey = "all" | "available" | "owned";

export default function MarketPage() {
  const { tenant, isReal, refresh } = useSession();
  const owned = useMemo(() => new Set(tenant?.enabled_addons ?? []), [tenant]);
  const addonMap = useMemo(() => new Map(ADDONS.map((a) => [a.key, a])), []);

  const [buying, setBuying] = useState<Addon | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("available");

  const toEnable = buying ? resolveDeps(buying.key, owned, addonMap) : [];
  const totalPrice = toEnable.reduce(
    (s, k) => s + (addonMap.get(k)?.price_monthly_sar ?? 0), 0,
  );

  async function confirmPurchase() {
    if (!buying) return;
    setPending(true);
    setError(null);
    try {
      await purchaseAddons(toEnable, totalPrice);
      setDone(true);
      refresh(); // reload the session → sidebar + owned set pick up the new addon
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setPending(false);
    }
  }

  const activeCount = ADDONS.filter((a) => owned.has(a.key)).length;
  const availableCount = ADDONS.filter((a) => !owned.has(a.key)).length;

  const catSorted = [...CATEGORIES].sort((a, b) => a.order - b.order);
  const fmt = (n: number) => n.toLocaleString("en-US");

  function passes(a: Addon): boolean {
    if (filter === "owned") return owned.has(a.key);
    if (filter === "available") return !owned.has(a.key);
    return true;
  }

  return (
    <>
      <Topbar title="سوق الإضافات" sub="فعّل ما تحتاجه فقط" breadcrumb={["الرئيسية", "السوق"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="🛒 سوق الإضافات"
          sub="ادفع بالقطعة — أضِف الميزة وقت ما تحتاجها، وتظهر فوراً في قائمتك. // ما تحتاجه فقط، لا أكثر"
        />

        {!isReal && (
          <div className="mb-5 rounded-xl border border-[var(--warn)]/30 bg-[var(--warn)]/10 text-[var(--warn)] text-sm px-4 py-3 flex items-center justify-between gap-3">
            <span>سجّل دخولك بمكتبك عشان تقدر تفعّل الإضافات.</span>
            <Link href="/login" className="underline hover:no-underline shrink-0">دخول ←</Link>
          </div>
        )}

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-5">
          <StatCard label="إضافات مفعّلة" value={activeCount} icon="✅" accent="success" hint="ضمن باقتك حالياً" />
          <StatCard label="متاحة للإضافة" value={availableCount} icon="🧩" accent="brand" hint="جاهزة بضغطة" />
          <StatCard label="باقتك" value={tenant?.plan?.replace("bundle_", "") ?? "—"} icon="📦" accent="info" hint="تقدر ترقّي وقت ما تبي" />
        </div>

        {/* Filter tabs */}
        <div className="flex flex-wrap gap-2 mb-5">
          {([
            { k: "available" as const, label: "متاحة للإضافة" },
            { k: "owned" as const, label: "المفعّلة لديك" },
            { k: "all" as const, label: "الكل" },
          ]).map((f) => (
            <button
              key={f.k}
              onClick={() => setFilter(f.k)}
              className={`px-3.5 py-1.5 rounded-full text-xs border transition-colors ${
                filter === f.k
                  ? "bg-[var(--brand)]/10 border-[var(--brand)] text-[var(--brand)]"
                  : "border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--border-strong)]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-7">
          {catSorted.map((cat) => {
            const items = ADDONS.filter((a) => a.category === cat.key).filter(passes);
            if (!items.length) return null;
            return (
              <section key={cat.key}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg">{cat.icon}</span>
                  <h3 className="font-bold text-sm">{cat.label_ar}</h3>
                  <span className="text-[10px] text-[var(--text-faint)]">({items.length})</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {items.map((a) => {
                    const isOwned = owned.has(a.key);
                    return (
                      <div
                        key={a.key}
                        className={`card flex flex-col gap-2 ${isOwned ? "border-[var(--success)]/40" : ""}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="font-bold text-sm leading-tight">{a.name_ar}</div>
                          <div className="shrink-0 text-left">
                            {a.price_monthly_sar > 0 ? (
                              <>
                                <span className="font-display font-black num text-[var(--brand)]" dir="ltr">{a.price_monthly_sar}</span>
                                <span className="text-[9px] text-[var(--text-faint)]"> ر.س/شهر</span>
                              </>
                            ) : (
                              <span className="text-[10px] text-[var(--text-faint)]">مجانية</span>
                            )}
                          </div>
                        </div>
                        <div className="text-[11px] text-[var(--text-muted)] leading-relaxed flex-1">
                          {a.description_ar}
                        </div>
                        {a.snark_ar && (
                          <div className="text-[10px] text-[var(--text-faint)] font-mono leading-relaxed">
                            {a.snark_ar}
                          </div>
                        )}
                        {isOwned ? (
                          <div className="mt-1 text-xs font-bold text-[var(--success)] inline-flex items-center gap-1.5">
                            <span className="w-4 h-4 rounded-full bg-[var(--success)] text-white grid place-items-center text-[9px]">✓</span>
                            مفعّلة في قائمتك
                          </div>
                        ) : (
                          <button
                            onClick={() => { setBuying(a); setDone(false); setError(null); }}
                            className="btn btn-brand text-xs py-2 mt-1"
                          >
                            + أضِف للباقة
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-8 text-center font-mono">
          // الدفع الآن محاكاة لإثبات الفكرة — يُربط ببوابة ميسر لاحقاً
        </p>
      </main>

      {/* Purchase (simulated) modal */}
      <Modal
        open={!!buying}
        onClose={() => setBuying(null)}
        title={done ? "تمّت الإضافة 🎉" : "تأكيد الإضافة"}
        sub={done ? undefined : "محاكاة دفع — تُربط ببوابة ميسر لاحقاً"}
      >
        {!buying ? null : done ? (
          <div className="text-center py-3">
            <div className="text-5xl mb-3">🎉</div>
            <p className="text-sm text-[var(--text)] mb-1">
              <span className="font-bold">{buying.name_ar}</span> صارت مفعّلة.
            </p>
            <p className="text-xs text-[var(--text-muted)] mb-5">
              تلقاها الآن في قائمتك الجانبية وكل صفحاتها شغّالة.
            </p>
            <button onClick={() => setBuying(null)} className="btn btn-brand w-full py-2.5 text-sm">
              تمام
            </button>
          </div>
        ) : !isReal ? (
          <div className="text-center py-3">
            <div className="text-4xl mb-3">🔒</div>
            <p className="text-sm text-[var(--text-muted)] mb-5">
              سجّل دخولك بمكتبك عشان تفعّل <span className="font-bold text-[var(--text)]">{buying.name_ar}</span>.
            </p>
            <Link href="/login" className="btn btn-brand w-full py-2.5 text-sm">دخول</Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-card)] p-3">
              <div className="font-bold text-sm mb-1">{buying.name_ar}</div>
              <div className="text-[11px] text-[var(--text-muted)] leading-relaxed">{buying.description_ar}</div>
            </div>

            {toEnable.length > 1 && (
              <div className="text-[11px] text-[var(--text-muted)]">
                تتطلب أيضاً تفعيل إضافات مرتبطة:
                <ul className="mt-1.5 space-y-1">
                  {toEnable.map((k) => {
                    const a = addonMap.get(k);
                    if (!a) return null;
                    return (
                      <li key={k} className="flex items-center justify-between gap-2">
                        <span>{a.name_ar}</span>
                        <span className="num text-[var(--text-faint)]" dir="ltr">{fmt(a.price_monthly_sar)} ر.س</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-[var(--border)] pt-3">
              <span className="text-sm text-[var(--text-muted)]">الإجمالي الشهري</span>
              <span className="font-display font-black text-lg num text-[var(--brand)]" dir="ltr">
                {fmt(totalPrice)} <span className="text-xs text-[var(--text-faint)]">ر.س/شهر</span>
              </span>
            </div>

            {error && (
              <div className="text-[12px] text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg p-2.5">
                {error}
              </div>
            )}

            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setBuying(null)} disabled={pending} className="btn btn-ghost text-sm py-2.5 px-4 disabled:opacity-50">
                إلغاء
              </button>
              <button onClick={confirmPurchase} disabled={pending} className="btn btn-brand text-sm py-2.5 px-5 disabled:opacity-50">
                {pending ? (
                  <span className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                    جاري التفعيل...
                  </span>
                ) : (
                  "تأكيد الشراء (محاكاة)"
                )}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
