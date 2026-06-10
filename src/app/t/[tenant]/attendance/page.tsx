import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { StatCard } from "@/components/app/StatCard";

type Status = "present" | "absent" | "late" | "leave";

type Employee = {
  name: string;
  role: string;
  status: Status;
  checkIn: string;
  commitment: number;
};

const EMPLOYEES: Employee[] = [
  { name: "عبدالله الشهري", role: "محامٍ أول", status: "present", checkIn: "07:52", commitment: 97 },
  { name: "نورة القحطاني", role: "مستشارة قانونية", status: "present", checkIn: "08:05", commitment: 94 },
  { name: "فيصل العتيبي", role: "محامٍ مترافع", status: "late", checkIn: "09:18", commitment: 82 },
  { name: "ريم الدوسري", role: "باحثة قانونية", status: "leave", checkIn: "—", commitment: 91 },
  { name: "ماجد الحربي", role: "أخصائي تنفيذ", status: "absent", checkIn: "—", commitment: 76 },
  { name: "سارة المطيري", role: "سكرتيرة تنفيذية", status: "present", checkIn: "07:46", commitment: 99 },
  { name: "تركي الغامدي", role: "محاسب قانوني", status: "late", checkIn: "09:02", commitment: 88 },
];

const STATUS_META: Record<Status, { label: string; varName: string }> = {
  present: { label: "حاضر", varName: "--success" },
  absent: { label: "غائب", varName: "--danger" },
  late: { label: "متأخر", varName: "--warn" },
  leave: { label: "إجازة", varName: "--info" },
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2);
  return parts[0][0] + parts[1][0];
}

function StatusBadge({ status }: { status: Status }) {
  const meta = STATUS_META[status];
  return (
    <span
      className="pill text-xs font-medium whitespace-nowrap"
      style={{
        background: `color-mix(in srgb, var(${meta.varName}) 15%, transparent)`,
        color: `var(${meta.varName})`,
      }}
    >
      {meta.label}
    </span>
  );
}

function CommitmentBar({ value }: { value: number }) {
  const varName = value >= 90 ? "--success" : value >= 80 ? "--warn" : "--danger";
  return (
    <div className="flex items-center gap-2 min-w-[120px]">
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-[var(--bg-hover)]">
        <div
          className="h-full rounded-full"
          style={{ width: `${value}%`, background: `var(${varName})` }}
        />
      </div>
      <span className="num text-xs font-semibold tabular-nums" dir="ltr" style={{ color: `var(${varName})` }}>
        {value}%
      </span>
    </div>
  );
}

export default async function AttendancePage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;

  const present = EMPLOYEES.filter((e) => e.status === "present").length;
  const absent = EMPLOYEES.filter((e) => e.status === "absent").length;
  const late = EMPLOYEES.filter((e) => e.status === "late").length;
  const leave = EMPLOYEES.filter((e) => e.status === "leave").length;

  return (
    <>
      <Topbar
        title="الحضور والانصراف"
        sub="متابعة حضور فريق المكتب لهذا اليوم"
        breadcrumb={["الرئيسية", "الحضور"]}
      />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="الحضور والانصراف"
          sub={`اليوم 2026-06-10 · إجمالي الموظفين ${EMPLOYEES.length}`}
          actions={<button className="btn btn-brand text-sm py-2.5">+ تسجيل حضور</button>}
        />

        {/* Stat row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
          <StatCard label="حاضر اليوم" value={present} icon="✓" accent="success" trend={{ v: "+1", up: true }} hint="من أصل الفريق" />
          <StatCard label="غائب" value={absent} icon="✕" accent="accent" hint="بدون إشعار" />
          <StatCard label="متأخر" value={late} icon="⏰" accent="warn" trend={{ v: "+1", up: false }} hint="بعد 09:00" />
          <StatCard label="إجازة" value={leave} icon="🌴" accent="info" hint="موافق عليها" />
        </div>

        {/* Attendance table */}
        <div className="card !p-0 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-right text-[var(--text-muted)] border-b border-[var(--border)]">
                <th className="font-medium py-3.5 px-4">الموظف</th>
                <th className="font-medium py-3.5 px-4">الدور</th>
                <th className="font-medium py-3.5 px-4">وقت الحضور</th>
                <th className="font-medium py-3.5 px-4">حالة اليوم</th>
                <th className="font-medium py-3.5 px-4">نسبة الالتزام الشهرية</th>
              </tr>
            </thead>
            <tbody>
              {EMPLOYEES.map((emp, i) => (
                <tr
                  key={emp.name}
                  className={`text-right hover:bg-[var(--bg-hover)] transition-colors ${
                    i !== EMPLOYEES.length - 1 ? "border-b border-[var(--border)]" : ""
                  }`}
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <span
                        className="shrink-0 w-9 h-9 rounded-full grid place-items-center text-xs font-bold"
                        style={{
                          background: `color-mix(in srgb, var(--brand) 18%, transparent)`,
                          color: "var(--brand)",
                        }}
                      >
                        {initials(emp.name)}
                      </span>
                      <span className="font-medium text-[var(--text)] truncate">{emp.name}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[var(--text-muted)] whitespace-nowrap">{emp.role}</td>
                  <td className="py-3.5 px-4">
                    <span className="num text-[var(--text-muted)]" dir="ltr">
                      {emp.checkIn}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusBadge status={emp.status} />
                  </td>
                  <td className="py-3.5 px-4">
                    <CommitmentBar value={emp.commitment} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-[var(--text-faint)] mt-4">
          // تُحدّث البيانات تلقائيًا عند تسجيل البصمة — لا يوجد تأخير غير مبرّر هنا.
        </p>
      </main>
    </>
  );
}
