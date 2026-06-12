"use client";

import { useRef, useState } from "react";
import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { Modal } from "@/components/ui/Modal";
import { useQafData } from "@/hooks/useQafData";
import { fetchDocuments, uploadDocument, documentUrl } from "@/lib/data/queries";
import { MOCK_DOCUMENTS } from "@/data/app-mock";
import type { DocItem } from "@/lib/data/types";

const TYPE_ICON: Record<string, string> = {
  PDF: "📄", DOCX: "📝", DOC: "📝", JPG: "🖼", JPEG: "🖼", PNG: "🖼", IMG: "🖼", XLSX: "📊", XLS: "📊", ZIP: "🗜",
};

export default function DocumentsPage() {
  const { data: documents, reload } = useQafData(fetchDocuments, MOCK_DOCUMENTS);
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [caseNo, setCaseNo] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { setError("اختر ملفاً أولاً."); return; }
    setPending(true);
    setError(null);
    try {
      await uploadDocument(file, caseNo);
      reload();
      setOpen(false);
      setFile(null);
      setCaseNo("");
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setPending(false);
    }
  }

  async function openDoc(d: DocItem) {
    if (!d.path) return;
    try {
      const url = await documentUrl(d.path);
      if (url) window.open(url, "_blank", "noopener");
    } catch { /* signed-url failed — ignore */ }
  }

  return (
    <>
      <Topbar title="المستندات" sub="جميع ملفات المكتب" breadcrumb={["الرئيسية", "المستندات"]} />
      <main className="p-4 sm:p-6 max-w-7xl w-full">
        <PageHeader
          title="المستندات"
          sub={`${documents.length} ملف • خزنة آمنة خاصة بمكتبك`}
          actions={
            <button onClick={() => { setOpen(true); setError(null); }} className="btn btn-brand text-sm py-2.5">
              ⬆ رفع ملف
            </button>
          }
        />

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {documents.map((d) => (
            <div
              key={d.id}
              onClick={() => openDoc(d)}
              className="card group hover:border-[var(--brand)]/40 cursor-pointer"
              title={d.path ? "اضغط للفتح" : undefined}
            >
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
                  <span className="font-mono" dir="ltr">{d.case || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-faint)]">رفع بواسطة:</span>
                  <span>{d.uploader || "—"}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[var(--text-faint)]">التاريخ:</span>
                  <span className="font-mono" dir="ltr">{d.date}</span>
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="card sm:col-span-2 lg:col-span-3 text-center text-sm text-[var(--text-muted)] py-10">
              لا مستندات بعد — ارفع أول ملف 📁
            </div>
          )}
        </div>
      </main>

      <Modal open={open} onClose={() => setOpen(false)} title="رفع ملف" sub="يُحفظ في خزنة مكتبك الخاصة (معزولة بالكامل)">
        <form onSubmit={submit} className="space-y-4">
          <div
            onClick={() => fileInput.current?.click()}
            className="rounded-xl border-2 border-dashed border-[var(--border-strong)] hover:border-[var(--brand)] bg-[var(--bg-card)] p-6 text-center cursor-pointer transition-colors"
          >
            <div className="text-3xl mb-2">{file ? "📄" : "⬆"}</div>
            <div className="text-sm font-semibold truncate">
              {file ? file.name : "اضغط لاختيار ملف"}
            </div>
            {file && (
              <div className="text-[11px] text-[var(--text-faint)] mt-1 num" dir="ltr">
                {file.size >= 1048576 ? `${(file.size / 1048576).toFixed(1)} MB` : `${Math.round(file.size / 1024)} KB`}
              </div>
            )}
          </div>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => { setFile(e.target.files?.[0] ?? null); setError(null); }}
          />
          <div>
            <label className="block text-xs font-semibold mb-1.5">رقم القضية (اختياري)</label>
            <input
              value={caseNo}
              onChange={(e) => setCaseNo(e.target.value)}
              placeholder="2026/0142"
              dir="ltr"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[var(--bg-card)] border border-[var(--border)] outline-none focus:border-[var(--brand)] text-sm"
            />
          </div>
          {error && (
            <div className="text-[12px] text-[var(--danger)] bg-[var(--danger)]/10 border border-[var(--danger)]/30 rounded-lg p-2.5">
              {error}
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => setOpen(false)} disabled={pending} className="btn btn-ghost text-sm py-2.5 px-4 disabled:opacity-50">
              إلغاء
            </button>
            <button type="submit" disabled={pending} className="btn btn-brand text-sm py-2.5 px-5 disabled:opacity-50">
              {pending ? (
                <span className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                  جاري الرفع...
                </span>
              ) : (
                "رفع الملف"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
