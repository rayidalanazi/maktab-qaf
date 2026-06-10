import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type PaymentStatus = "مدفوعة" | "فاشلة" | "مستردة";
type PaymentMethod = "مدى" | "Visa" | "Apple Pay";

interface Transaction {
  id: string;
  firm: string;
  amount: number; // إجمالي شامل ضريبة القيمة المضافة (15%)
  date: string;
  method: PaymentMethod;
  status: PaymentStatus;
}

// كل العمليات عبر بوابة الدفع "ميسر" (Moyasar)
const TRANSACTIONS: Transaction[] = [
  { id: "INV-2026-0419", firm: "شركة رائد للمحاماة", amount: 2299, date: "2026-06-08", method: "مدى", status: "مدفوعة" },
  { id: "INV-2026-0418", firm: "مكتب الفيصل", amount: 1149, date: "2026-06-07", method: "Visa", status: "مدفوعة" },
  { id: "INV-2026-0417", firm: "مكتب القحطاني", amount: 2299, date: "2026-06-06", method: "Apple Pay", status: "مدفوعة" },
  { id: "INV-2026-0416", firm: "مكتب الخوري", amount: 575, date: "2026-06-05", method: "مدى", status: "فاشلة" },
  { id: "INV-2026-0415", firm: "مكتب المطيري", amount: 1149, date: "2026-06-04", method: "Visa", status: "مدفوعة" },
  { id: "INV-2026-0414", firm: "مكتب الشمري", amount: 2299, date: "2026-06-03", method: "مدى", status: "مستردة" },
  { id: "INV-2026-0413", firm: "مكتب العنزي", amount: 575, date: "2026-06-02", method: "Apple Pay", status: "مدفوعة" },
  { id: "INV-2026-0412", firm: "مؤسسة العتيبي", amount: 1149, date: "2026-06-01", method: "Visa", status: "فاشلة" },
  { id: "INV-2026-0411", firm: "شركة رائد للمحاماة", amount: 2299, date: "2026-05-31", method: "مدى", status: "مدفوعة" },
];

const STATUS_COLOR: Record<PaymentStatus, string> = {
  "مدفوعة": "var(--success)",
  "فاشلة": "var(--danger)",
  "مستردة": "var(--warn)",
};

const METHOD_ICON: Record<PaymentMethod, string> = {
  "مدى": "💳",
  "Visa": "💠",
  "Apple Pay": "",
};

const fmt = (n: number) => n.toLocaleString("en-US");

export default function AdminPaymentsPage() {
  const collected = TRANSACTIONS.filter((t) => t.status === "مدفوعة").reduce((s, t) => s + t.amount, 0);
  const paidCount = TRANSACTIONS.filter((t) => t.status === "مدفوعة").length;
  const failedCount = TRANSACTIONS.filter((t) => t.status === "فاشلة").length;
  const refundedCount = TRANSACTIONS.filter((t) => t.status === "مستردة").length;

  // توزيع طرق الدفع للعمليات الناجحة
  const methods: PaymentMethod[] = ["مدى", "Visa", "Apple Pay"];
  const byMethod = methods.map((m) => ({
    method: m,
    count: TRANSACTIONS.filter((t) => t.status === "مدفوعة" && t.method === m).length,
  }));
  const maxMethod = Math.max(1, ...byMethod.map((m) => m.count));

  return (
    <>
      <Topbar title="المدفوعات والفواتير" breadcrumb={["Admin", "المدفوعات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المدفوعات والفواتير"
          sub="// كل العمليات عبر بوابة ميسر (Moyasar) — الأسعار شاملة ضريبة القيمة المضافة 15%"
          actions={<button className="btn btn-ghost text-sm py-2.5">📥 تصدير</button>}
        />

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard
            label="محصّل هذا الشهر"
            value={`${fmt(collected)}`}
            icon="💰"
            accent="success"
            trend={{ v: "+12%", up: true }}
            hint="ر.س — شامل الضريبة"
          />
          <StatCard label="فواتير ناجحة" value={paidCount} icon="✅" accent="brand" hint="عملية مدفوعة" />
          <StatCard label="فواتير فاشلة" value={failedCount} icon="⚠️" accent="warn" hint="تحتاج إعادة محاولة" />
          <StatCard label="مستردة" value={refundedCount} icon="↩️" accent="info" hint="مبالغ معادة للعميل" />
        </div>

        <div className="grid lg:grid-cols-3 gap-4 mb-5">
          {/* توزيع طرق الدفع */}
          <div className="card">
            <div className="font-bold mb-4">طرق الدفع — العمليات الناجحة</div>
            <div className="space-y-3">
              {byMethod.map((m) => {
                const pct = (m.count / maxMethod) * 100;
                return (
                  <div key={m.method}>
                    <div className="flex items-center justify-between mb-1.5 text-xs">
                      <span className="font-bold">
                        {METHOD_ICON[m.method]} {m.method}
                      </span>
                      <span className="font-mono text-[var(--text-muted)] num" dir="ltr">
                        {m.count}
                      </span>
                    </div>
                    <div className="h-2.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--brand)] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ملخص الحالات */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold">ملخص الحالات</div>
              <span
                className="text-[10px] font-bold px-2 py-1 rounded-full"
                style={{
                  background: "color-mix(in srgb, var(--brand) 15%, transparent)",
                  color: "var(--brand)",
                }}
              >
                ميسر · Moyasar
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {(["مدفوعة", "فاشلة", "مستردة"] as PaymentStatus[]).map((st) => {
                const items = TRANSACTIONS.filter((t) => t.status === st);
                const sum = items.reduce((s, t) => s + t.amount, 0);
                const color = STATUS_COLOR[st];
                return (
                  <div key={st} className="p-3 rounded-lg bg-[var(--bg-hover)]">
                    <div className="text-[11px] text-[var(--text-muted)] mb-1">{st}</div>
                    <div className="font-display font-black text-xl num leading-none" style={{ color }}>
                      {items.length}
                    </div>
                    <div className="text-[10px] text-[var(--text-faint)] mt-1 num" dir="ltr">
                      {fmt(sum)} ر.س
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-[11px] text-[var(--text-faint)] mt-4 leading-relaxed">
              تتم تسوية المبالغ تلقائياً عبر ميسر خلال 1–2 يوم عمل. الفواتير الفاشلة تُعاد محاولتها آلياً بعد 24 ساعة.
            </div>
          </div>
        </div>

        {/* جدول العمليات */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="text-[var(--text-muted)] text-[11px] border-b border-[var(--border)]">
                <th className="text-right font-medium px-4 py-3">رقم الفاتورة</th>
                <th className="text-right font-medium px-4 py-3">المكتب</th>
                <th className="text-right font-medium px-4 py-3">المبلغ ر.س</th>
                <th className="text-right font-medium px-4 py-3">التاريخ</th>
                <th className="text-right font-medium px-4 py-3">طريقة الدفع</th>
                <th className="text-right font-medium px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {TRANSACTIONS.map((t) => {
                const color = STATUS_COLOR[t.status];
                const vat = Math.round((t.amount - t.amount / 1.15) * 100) / 100;
                return (
                  <tr
                    key={t.id}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className="num font-mono text-[var(--text)]" dir="ltr">
                        {t.id}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--text)] whitespace-nowrap">{t.firm}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[var(--text)] num" dir="ltr">
                        {fmt(t.amount)}
                      </div>
                      <div className="text-[10px] text-[var(--text-faint)] num" dir="ltr">
                        منها {fmt(vat)} ضريبة
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)]">
                      <span className="num font-mono" dir="ltr">
                        {t.date}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                      <span className="ml-1">{METHOD_ICON[t.method]}</span>
                      {t.method === "مدى" ? (
                        <span>مدى</span>
                      ) : (
                        <span className="num font-mono" dir="ltr">
                          {t.method}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                        style={{
                          background: `color-mix(in srgb, ${color} 15%, transparent)`,
                          color,
                        }}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="text-[11px] text-[var(--text-faint)] mt-3 px-1">
          المصدر: لوحة عمليات ميسر (Moyasar) — تُحدّث آلياً عبر Webhook. آخر مزامنة 2026-06-08.
        </div>
      </main>
    </>
  );
}
