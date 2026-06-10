"use client";

import { Topbar } from "@/components/app/Topbar";
import { PageHeader } from "@/components/app/PageHeader";
import { useQafData } from "@/hooks/useQafData";
import { fetchTasks } from "@/lib/data/queries";
import { MOCK_TASKS } from "@/data/app-mock";

const PRIORITY_COLOR: Record<string, string> = {
  "عالية": "var(--accent)",
  "متوسطة": "var(--warn)",
  "منخفضة": "var(--text-faint)",
};

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  "todo": { label: "للتنفيذ", color: "var(--text-muted)" },
  "in-progress": { label: "قيد التنفيذ", color: "var(--brand)" },
  "in_progress": { label: "قيد التنفيذ", color: "var(--brand)" },
  "done": { label: "تم", color: "var(--success)" },
};

export default function MyTasksPage() {
  const { data: tasks } = useQafData(fetchTasks, MOCK_TASKS);
  return (
    <>
      <Topbar title="مهامي" sub="ما يحتاج إنجازك" breadcrumb={["الرئيسية", "مهامي"]} />
      <main className="p-4 sm:p-6 max-w-5xl w-full">
        <PageHeader
          title="مهامي"
          sub={`${tasks.filter((t) => t.status !== "done").length} مهمة قيد التنفيذ`}
          actions={<button className="btn btn-brand text-sm py-2.5">+ مهمة جديدة</button>}
        />

        <div className="space-y-2">
          {tasks.map((t) => {
            const st = STATUS_LABEL[t.status] ?? STATUS_LABEL["todo"];
            return (
              <div key={t.id} className="card flex items-start gap-3 hover:border-[var(--brand)]/40 cursor-pointer">
                <button
                  className="w-5 h-5 rounded-full border-2 border-[var(--border-strong)] mt-0.5 shrink-0 hover:border-[var(--brand)]"
                  aria-label="إنجاز"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-sm mb-1">{t.title}</div>
                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                      style={{
                        background: `color-mix(in srgb, ${PRIORITY_COLOR[t.priority]} 15%, transparent)`,
                        color: PRIORITY_COLOR[t.priority],
                      }}
                    >
                      ⚡ {t.priority}
                    </span>
                    <span
                      className="px-2 py-0.5 rounded-full text-[10px]"
                      style={{
                        background: `color-mix(in srgb, ${st.color} 15%, transparent)`,
                        color: st.color,
                      }}
                    >
                      {st.label}
                    </span>
                    <span className="text-[var(--text-faint)] font-mono" dir="ltr">
                      📅 {t.due}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
}
