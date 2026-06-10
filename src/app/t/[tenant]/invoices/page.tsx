import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type InvoiceStatus = "paid" | "sent" | "overdue" | "draft";

interface Invoice {
  no: string;
  client: string;
  net: number;
  vat: number;
  issued: string;
  due: string;
  status: InvoiceStatus;
}

const VAT_RATE = 0.15;

const INVOICES: Invoice[] = [
  {
    no: "QF-2026-0117",
    client: "شركة الخليج للمقاولات",
    net: 24000,
    vat: 24000 * VAT_RATE,
    issued: "2026-05-02",
    due: "2026-06-01",
    status: "paid",
  },
  {
    no: "QF-2026-0118",
    client: "مؤسسة نخيل الرياض التجارية",
    net: 8500,
    vat: 8500 * VAT_RATE,
    issued: "2026-05-09",
    due: "2026-06-08",
    status: "sent",
  },
  {
    no: "QF-2026-0119",
    client: "عبدالعزيز بن سعد الدوسري",
    net: 5200,
    vat: 5200 * VAT_RATE,
    issued: "2026-04-15",
    due: "2026-05-15",
    status: "overdue",
  },
  {
    no: "QF-2026-0120",
    client: "شركة وادي حنيفة القابضة",
    net: 41000,
    vat: 41000 * VAT_RATE,
    issued: "2026-05-18",
    due: "2026-06-17",
    status: "sent",
  },
  {
    no: "QF-2026-0121",
    client: "منيرة بنت فهد العتيبي",
    net: 3000,
    vat: 3000 * VAT_RATE,
    issued: "2026-03-28",
    due: "2026-04-27",
    status: "overdue",
  },
  {
    no: "QF-2026-0122",
    client: "مجموعة طويق الصناعية",
    net: 17500,
    vat: 17500 * VAT_RATE,
    issued: "2026-05-21",
    due: "2026-06-20",
    status: "paid",
  },
  {
    no: "QF-2026-0123",
    client: "شركة سدير اللوجستية",
    net: 9800,
    vat: 9800 * VAT_RATE,
    issued: "2026-05-25",
    due: "2026-06-24",
    status: "draft",
  },
];

const STATUS_META: Record<
  InvoiceStatus,
  { label: string; color: string }
> = {
  paid: { label: "مدفوعة", color: "var(--success)" },
  sent: { label: "مرسلة", color: "var(--info)" },
  overdue: { label: "متأخرة", color: "var(--danger)" },
  draft: { label: "مسودة", color: "var(--text-muted)" },
};

function fmt(n: number) {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export default async function InvoicesPage({
  params,
}: {
  params: Promise<{ tenant: string }>;
}) {
  await params;

  const total = (inv: Invoice) => inv.net + inv.vat;

  const collected = INVOICES.filter((i) => i.status === "paid").reduce(
    (s, i) => s + total(i),
    0,
  );
  const pending = INVOICES.filter(
    (i) => i.status === "sent" || i.status === "draft",
  ).reduce((s, i) => s + total(i), 0);
  const overdue = INVOICES.filter((i) => i.status === "overdue").reduce(
    (s, i) => s + total(i),
    0,
  );

  return (
    <>
      <Topbar
        title="الفوترة الذكية"
        sub="فواتير ضريبية + احتساب VAT — تكامل زاتكا قيد الاعتماد"
        breadcrumb={["الرئيسية", "الفواتير"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الفوترة الذكية"
          sub="إصدار فواتير ضريبية مع احتساب ضريبة القيمة المضافة 15% تلقائيًا. التكامل المعتمد مع فاتورة/زاتكا (المرحلة الثانية) قيد الاعتماد."
          actions={
            <button className="btn btn-brand text-sm py-2.5">
              + فاتورة جديدة
            </button>
          }
        />

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <StatCard
            label="إجمالي محصّل"
            value={fmt(collected)}
            icon="✅"
            accent="success"
            trend={{ v: "+12%", up: true }}
            hint="ر.س — فواتير مدفوعة"
          />
          <StatCard
            label="معلّق"
            value={fmt(pending)}
            icon="⏳"
            accent="info"
            hint="ر.س — مرسلة + مسودات"
          />
          <StatCard
            label="متأخر"
            value={fmt(overdue)}
            icon="⚠"
            accent="warn"
            trend={{ v: "+2", up: false }}
            hint="ر.س — تجاوزت الاستحقاق"
          />
          <StatCard
            label="عدد الفواتير"
            value={INVOICES.length}
            icon="🧾"
            accent="brand"
            hint="خلال الدورة الحالية"
          />
        </div>

        {/* Invoices table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="text-right text-[11px] uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-semibold px-4 py-3">رقم الفاتورة</th>
                <th className="font-semibold px-4 py-3">العميل</th>
                <th className="font-semibold px-4 py-3">المبلغ (شامل الضريبة)</th>
                <th className="font-semibold px-4 py-3">تاريخ الإصدار</th>
                <th className="font-semibold px-4 py-3">الاستحقاق</th>
                <th className="font-semibold px-4 py-3">الحالة</th>
              </tr>
            </thead>
            <tbody>
              {INVOICES.map((inv) => {
                const meta = STATUS_META[inv.status];
                return (
                  <tr
                    key={inv.no}
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg-hover)] transition-colors"
                  >
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="num font-mono text-[var(--brand)]" dir="ltr">
                        {inv.no}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      <span className="block truncate text-[var(--text)]">
                        {inv.client}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-semibold">
                        <span className="num" dir="ltr">
                          {fmt(inv.net + inv.vat)}
                        </span>{" "}
                        <span className="text-[var(--text-faint)] text-xs">ر.س</span>
                      </div>
                      <div className="text-[11px] text-[var(--text-faint)]">
                        ضريبة{" "}
                        <span className="num" dir="ltr">
                          {fmt(inv.vat)}
                        </span>{" "}
                        (15%)
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">
                        {inv.issued}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-[var(--text-muted)]">
                      <span className="num" dir="ltr">
                        {inv.due}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className="pill text-xs font-semibold"
                        style={{
                          background: `color-mix(in srgb, ${meta.color} 15%, transparent)`,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="text-[11px] text-[var(--text-faint)] mt-3">
          // التكامل المعتمد مع فاتورة/زاتكا (المرحلة الثانية: QR + الختم التشفيري + المقاصّة اللحظية) قيد الاعتماد — مستهدف قبل موجة 2026. حالياً: قالب فاتورة ضريبية + احتساب VAT 15%.
        </p>
      </main>
    </>
  );
}
