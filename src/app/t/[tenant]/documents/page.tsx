import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { MOCK_DOCUMENTS } from "@/data/app-mock";

const TYPE_ICON: Record<string, string> = {
  PDF: "📄", DOCX: "📝", JPG: "🖼", IMG: "🖼", XLSX: "📊",
};

export default async function DocumentsPage({ params }: { params: Promise<{ tenant: string }> }) {
  await params;
  return (
    <>
      <Topbar title="المستندات" sub="جميع ملفات المكتب" breadcrumb={["الرئيسية", "المستندات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المستندات"
          sub={`${MOCK_DOCUMENTS.length} ملف • 2.3 GB / 5 GB`}
          actions={<button className="btn btn-brand text-sm py-2.5">⬆ رفع ملف</button>}
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_DOCUMENTS.map((d) => (
            <div key={d.id} className="card group hover:border-[var(--brand)]/40 cursor-pointer">
              <div className="flex items-start gap-3 mb-3">
                <span className="text-3xl shrink-0">{TYPE_ICON[d.type] || "📄"}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm truncate">{d.name}</div>
                  <div className="text-[10px] text-[var(--text-faint)]">
                    {d.type} • {d.size}
                  </div>
                </div>
              </div>
              <div className="space-y-1 text-[11px] text-[var(--text-muted)]">
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-faint)]">قضية:</span>
                  <span className="font-mono" dir="ltr">{d.case}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-faint)]">رفع بواسطة:</span>
                  <span>{d.uploader}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-faint)]">التاريخ:</span>
                  <span className="font-mono" dir="ltr">{d.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
