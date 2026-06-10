/**
 * Sidebar navigation config — addon-gated and role-gated.
 * Each item lists the addon_key it requires (empty = always visible)
 * and the roles allowed to see it.
 */

export type NavItem = {
  key: string;
  label_ar: string;
  href: string;
  icon: string;
  requires_addon?: string;
  roles?: string[];
  badge?: number;
};

export type NavSection = {
  title_ar?: string;
  items: NavItem[];
};

const ALL_ROLES = [
  "admin", "general_manager", "executive_director", "partner",
  "manager", "lawyer", "consultant", "marketer", "auditor",
  "accountant", "secretary",
];

export const APP_NAV: NavSection[] = [
  {
    items: [
      { key: "home", label_ar: "الرئيسية", href: "", icon: "🏠", roles: ALL_ROLES },
      { key: "my-tasks", label_ar: "مهامي", href: "/my-tasks", icon: "📌", roles: ALL_ROLES },
    ],
  },
  {
    title_ar: "القضايا",
    items: [
      {
        key: "cases", label_ar: "القضايا", href: "/cases", icon: "⚖",
        requires_addon: "core_cases",
        roles: ["admin", "general_manager", "executive_director", "partner", "manager", "lawyer"],
      },
      {
        key: "archive", label_ar: "الأرشيف", href: "/cases/archive", icon: "🗄",
        requires_addon: "case_timeline_plus",
        roles: ["admin", "general_manager", "executive_director", "partner", "manager", "lawyer"],
      },
      {
        key: "client-cases", label_ar: "قضايا العملاء", href: "/client-cases", icon: "📁",
        requires_addon: "core_cases",
        roles: ["admin", "general_manager", "executive_director", "partner", "manager", "lawyer"],
      },
    ],
  },
  {
    title_ar: "المرجع القانوني",
    items: [
      { key: "memos", label_ar: "المذكرات", href: "/memos", icon: "📝", requires_addon: "memos_module" },
      { key: "templates", label_ar: "القوالب", href: "/templates", icon: "📋", requires_addon: "templates_library" },
      { key: "precedents", label_ar: "السوابق", href: "/precedents", icon: "📚", requires_addon: "precedents_engine" },
      { key: "regulations", label_ar: "الأنظمة", href: "/regulations", icon: "📜", requires_addon: "regulations_hub" },
    ],
  },
  {
    title_ar: "الإدارة",
    items: [
      { key: "schedule", label_ar: "الجدولة", href: "/schedule", icon: "📅", requires_addon: "schedule_attendance" },
      { key: "attendance", label_ar: "الحضور", href: "/attendance", icon: "✓", requires_addon: "schedule_attendance" },
      { key: "documents", label_ar: "المستندات", href: "/documents", icon: "📄", requires_addon: "documents_vault" },
      { key: "requests", label_ar: "الطلبات", href: "/requests", icon: "📋", requires_addon: "requests_workflow" },
    ],
  },
  {
    title_ar: "المالية",
    items: [
      { key: "invoices", label_ar: "الفواتير", href: "/invoices", icon: "🧾", requires_addon: "invoicing_pro" },
      { key: "expenses", label_ar: "المصروفات", href: "/expenses", icon: "💰", requires_addon: "expenses_loans" },
      { key: "salaries", label_ar: "الرواتب", href: "/salaries", icon: "💼", requires_addon: "salaries_payroll" },
    ],
  },
  {
    title_ar: "التقارير",
    items: [
      { key: "reports", label_ar: "التقارير", href: "/reports", icon: "📊", requires_addon: "reports_basic" },
      { key: "kpi", label_ar: "مؤشّرات الأداء", href: "/kpi", icon: "📈", requires_addon: "kpi_dashboard" },
      { key: "executive", label_ar: "اللوحة التنفيذية", href: "/executive", icon: "🎯", requires_addon: "executive_suite" },
    ],
  },
  {
    title_ar: "النظام",
    items: [
      { key: "users", label_ar: "المستخدمون", href: "/users", icon: "👥", roles: ["admin", "general_manager"] },
      { key: "notifications", label_ar: "الإشعارات", href: "/notifications", icon: "🔔" },
      { key: "settings", label_ar: "الإعدادات", href: "/settings", icon: "⚙", roles: ["admin"] },
      { key: "support", label_ar: "الدعم", href: "/support", icon: "💬" },
    ],
  },
];

/**
 * Filter nav for a tenant's plan + current user role.
 */
export function filterNav(
  sections: NavSection[],
  enabledAddons: string[],
  role: string,
): NavSection[] {
  const out: NavSection[] = [];
  for (const sec of sections) {
    const items = sec.items.filter((it) => {
      if (it.requires_addon && !enabledAddons.includes(it.requires_addon)) return false;
      if (it.roles && !it.roles.includes(role)) return false;
      return true;
    });
    if (items.length) out.push({ ...sec, items });
  }
  return out;
}
