"use client";

import { useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";
import { useQafData } from "@/hooks/useQafData";
import { useSession } from "@/components/app/SessionProvider";
import {
  checkIn, fetchRecentCheckins, fetchOffices, setOfficeHere, deleteOffice,
} from "@/lib/data/queries";

function fmtTime(iso: string): string {
  try { return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }); }
  catch { return "—"; }
}
function isToday(iso: string): boolean {
  try { return new Date(iso).toDateString() === new Date().toDateString(); }
  catch { return false; }
}
function initials(name: string): string {
  const p = (name || "?").trim().split(/\s+/);
  return p.length === 1 ? p[0].slice(0, 2) : p[0][0] + p[1][0];
}

export default function AttendancePage() {
  const { profile, isReal } = useSession();
  const isManager = profile?.role === "admin" || profile?.role === "general_manager";

  const { data: checkins, reload } = useQafData(fetchRecentCheckins, []);
  const { data: offices, reload: reloadOffices } = useQafData(fetchOffices, []);

  const [busy, setBusy] = useState<"in" | "out" | null>(null);
  const [result, setResult] = useState<{ ok: boolean; text: string } | null>(null);
  const [officeBusy, setOfficeBusy] = useState(false);
  const [radius, setRadius] = useState(150);

  async function doCheck(kind: "in" | "out") {
    setBusy(kind);
    setResult(null);
    try {
      const r = await checkIn(kind);
      const ok = r.status === "accepted";
      const where = r.office ? ` · ${r.office}` : "";
      const dist = r.distance != null ? ` · ${r.distance}م` : "";
      setResult({
        ok,
        text: ok
          ? `تم تسجيل ${kind === "in" ? "الحضور" : "الانصراف"} ${r.at}${where}${dist}`
          : r.reason || "تعذّر التسجيل",
      });
      reload();
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "حدث خطأ" });
    } finally {
      setBusy(null);
    }
  }

  async function pinOffice() {
    setOfficeBusy(true);
    setResult(null);
    try {
      await setOfficeHere("المكتب الرئيسي", radius);
      reloadOffices();
      setResult({ ok: true, text: `تم ضبط موقع المكتب — النطاق ${radius}م` });
    } catch (e) {
      setResult({ ok: false, text: e instanceof Error ? e.message : "تعذّر ضبط الموقع" });
    } finally {
      setOfficeBusy(false);
    }
  }

  async function removeOffice(id: string) {
    try { await deleteOffice(id); reloadOffices(); } catch { /* ignore */ }
  }

  const today = checkins.filter((c) => isToday(c.time));
  const presentNames = new Set(today.filter((c) => c.status === "accepted" && c.kind === "in").map((c) => c.name));
  const rejectedToday = today.filter((c) => c.status === "rejected").length;
  const radiusLabel = offices[0] ? `${offices[0].radius}م` : "—";

  return (
    <>
      <Topbar
        title="الحضور بالموقع"
        sub="تسجيل حضور موثّق بالـ GPS — يُتحقّق على الخادم"
        breadcrumb={["الرئيسية", "الحضور"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader title="الحضور والانصراف" sub="بصمة موقع يصعب التحايل عليها — التحقّق يتم في الخادم لا في الجهاز" />

        {/* ---- Check-in card ---- */}
        <div className="card mb-5 relative overflow-hidden">
          <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
               style={{ background: "radial-gradient(circle at 85% 15%, var(--brand) 0%, transparent 55%)" }} />
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">📍</span>
            <h3 className="font-bold text-base">سجّل حضورك الآن</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)] mb-4">
            يجب أن تكون داخل نطاق المكتب فعليًا. يُلتقط موقعك مرة واحدة ويُرسل للخادم للتحقّق.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-md">
            <button
              onClick={() => doCheck("in")}
              disabled={busy !== null}
              className="btn btn-brand py-3.5 text-sm font-bold disabled:opacity-60"
            >
              {busy === "in" ? <Spinner label="جارٍ تحديد موقعك…" /> : "✓ تسجيل حضور"}
            </button>
            <button
              onClick={() => doCheck("out")}
              disabled={busy !== null}
              className="btn btn-ghost py-3.5 text-sm font-bold disabled:opacity-60"
            >
              {busy === "out" ? <Spinner label="جارٍ…" /> : "↩ تسجيل انصراف"}
            </button>
          </div>

          {result && (
            <div
              className="mt-4 rounded-lg px-3.5 py-3 text-sm font-medium border flex items-start gap-2"
              style={{
                background: `color-mix(in srgb, var(${result.ok ? "--success" : "--danger"}) 12%, transparent)`,
                borderColor: `color-mix(in srgb, var(${result.ok ? "--success" : "--danger"}) 35%, transparent)`,
                color: `var(${result.ok ? "--success" : "--danger"})`,
              }}
            >
              <span>{result.ok ? "✓" : "✕"}</span>
              <span>{result.text}</span>
            </div>
          )}

          {!isReal && (
            <p className="mt-3 text-[11px] text-[var(--text-faint)] font-mono">
              // وضع المعاينة — التسجيل الحقيقي يعمل بعد الدخول بحساب مكتب
            </p>
          )}
        </div>

        {/* ---- Stat row ---- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <StatCard label="حضور موثّق اليوم" value={presentNames.size} icon="✓" accent="success" hint="موظفون داخل النطاق" />
          <StatCard label="محاولات مرفوضة" value={rejectedToday} icon="⛔" accent="accent" hint="خارج النطاق/دقّة ضعيفة" />
          <StatCard label="مواقع المكتب" value={offices.length} icon="🏢" accent="info" hint="نقاط مُعرّفة" />
          <StatCard label="نطاق المكتب" value={radiusLabel} icon="🛡" accent="warn" hint="نصف القطر المسموح" />
        </div>

        {/* ---- Admin: office geofence ---- */}
        {isManager && (
          <div className="card mb-5">
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <div>
                <h3 className="font-bold text-sm">نطاق المكتب (Geofence)</h3>
                <p className="text-[11px] text-[var(--text-faint)]">قف داخل المكتب واضبط موقعه — أي تسجيل خارج النطاق يُرفض تلقائيًا</p>
              </div>
              <div className="flex items-end gap-2">
                <label className="block">
                  <span className="block text-[10px] text-[var(--text-faint)] mb-1">النطاق (م)</span>
                  <input
                    type="number" min={50} max={1000} value={radius}
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="num w-20 px-2.5 py-2 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm"
                    dir="ltr"
                  />
                </label>
                <button onClick={pinOffice} disabled={officeBusy} className="btn btn-brand text-sm py-2.5 disabled:opacity-60">
                  {officeBusy ? <Spinner label="جارٍ…" /> : "📍 ضبط موقع المكتب الحالي"}
                </button>
              </div>
            </div>

            {offices.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)] bg-[var(--warn)]/10 border border-[var(--warn)]/30 rounded-lg px-3 py-2.5">
                لم يُضبط موقع بعد — لن يُقبل أي تسجيل حتى تضبط نطاق المكتب من جهازك داخل المقر.
              </p>
            ) : (
              <div className="space-y-2">
                {offices.map((o) => (
                  <div key={o.id} className="flex items-center justify-between bg-[var(--bg-hover)] rounded-lg px-3 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span className="text-lg">🏢</span>
                      <div>
                        <div className="font-semibold text-sm">{o.label}</div>
                        <div className="num text-[11px] text-[var(--text-faint)]" dir="ltr">
                          {o.lat.toFixed(5)}, {o.lng.toFixed(5)} · r={o.radius}m
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeOffice(o.id)} className="text-[var(--danger)] text-xs hover:underline">حذف</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ---- Check-in log ---- */}
        <div className="card !p-0 overflow-x-auto">
          <div className="px-4 pt-4 pb-2 font-bold text-sm">سجل التسجيلات (غير قابل للتعديل)</div>
          <table className="w-full min-w-[680px] text-sm">
            <thead>
              <tr className="text-right text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium py-3 px-4">الموظف</th>
                <th className="font-medium py-3 px-4">النوع</th>
                <th className="font-medium py-3 px-4">الوقت</th>
                <th className="font-medium py-3 px-4">المسافة</th>
                <th className="font-medium py-3 px-4">الدقّة</th>
                <th className="font-medium py-3 px-4">النتيجة</th>
              </tr>
            </thead>
            <tbody>
              {checkins.map((c, i) => (
                <tr key={c.id} className={`text-right hover:bg-[var(--bg-hover)] ${i !== checkins.length - 1 ? "border-b border-[var(--border)]" : ""}`}>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="shrink-0 w-8 h-8 rounded-full grid place-items-center text-[11px] font-bold"
                            style={{ background: "color-mix(in srgb, var(--brand) 18%, transparent)", color: "var(--brand)" }}>
                        {initials(c.name)}
                      </span>
                      <span className="font-medium truncate">{c.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap text-[var(--text-muted)]">
                    {c.kind === "out" ? "↩ انصراف" : "✓ حضور"}
                  </td>
                  <td className="py-3 px-4 num text-[var(--text-muted)]" dir="ltr">{fmtTime(c.time)}</td>
                  <td className="py-3 px-4 num text-[var(--text-muted)]" dir="ltr">{c.distance != null ? `${c.distance}m` : "—"}</td>
                  <td className="py-3 px-4 num text-[var(--text-faint)]" dir="ltr">{c.accuracy != null ? `±${c.accuracy}m` : "—"}</td>
                  <td className="py-3 px-4">
                    {c.status === "accepted" ? (
                      <span className="pill text-xs font-medium whitespace-nowrap"
                            style={{ background: "color-mix(in srgb, var(--success) 15%, transparent)", color: "var(--success)" }}>
                        مقبول
                      </span>
                    ) : (
                      <span className="pill text-xs font-medium" title={c.reason ?? ""}
                            style={{ background: "color-mix(in srgb, var(--danger) 15%, transparent)", color: "var(--danger)" }}>
                        مرفوض{c.reason ? ` · ${c.reason}` : ""}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {checkins.length === 0 && (
                <tr><td colSpan={6} className="py-10 text-center text-[var(--text-muted)] text-sm">لا تسجيلات بعد — اضغط «تسجيل حضور» لأول بصمة.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ---- Anti-fraud explainer ---- */}
        <div className="card mt-5 bg-[var(--bg-hover)]/40">
          <h4 className="font-bold text-sm mb-2">🛡 لماذا يصعب التحايل عليه</h4>
          <ul className="text-[12px] text-[var(--text-muted)] space-y-1.5 leading-relaxed">
            <li>• <b>التحقّق في الخادم</b> — القرار (داخل/خارج النطاق) يُحسب في قاعدة البيانات، لا يثق بما يرسله الجهاز.</li>
            <li>• <b>الكتابة عبر دالة واحدة فقط</b> — لا يمكن حقن سجل حضور مزيّف مباشرة في القاعدة.</li>
            <li>• <b>وقت الخادم</b> — يُختم بوقت الخادم لا وقت الجوال، فلا تلاعب بالساعة.</li>
            <li>• <b>بوابة دقّة GPS</b> — يُرفض أي تسجيل دقّته أسوأ من 100م (يمنع المواقع التقريبية).</li>
            <li>• <b>كشف القفز المكاني</b> — انتقال بسرعة غير منطقية بين تسجيلين يُرفض ويُراجَع.</li>
            <li>• <b>سجل تدقيق كامل</b> — كل محاولة (مقبولة/مرفوضة) تُحفظ بالإحداثيات والدقّة وIP.</li>
          </ul>
        </div>
      </main>
    </>
  );
}

function Spinner({ label }: { label: string }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <span className="w-3.5 h-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
      {label}
    </span>
  );
}
