/**
 * Real Supabase reads/writes for قاف, scoped automatically by RLS to the
 * signed-in user's tenant (no tenant_id needs to be passed from the client).
 *
 * Every fetcher maps raw `qaf_*` rows into the UI shapes in `types.ts`.
 * Tables live in the shared lawyer-payments project, prefixed `qaf_` — see
 * supabase/SETUP_SHARED.sql.
 */

import { getSupabase } from "@/lib/supabase/client";
import type {
  Case, DocItem, EventItem, TaskItem, UserItem, NotificationItem,
  InvoiceItem, ExpenseItem, ClientItem, MemoItem, QafProfile, QafTenant,
  AttendanceItem, RequestItem, SalaryItem, TicketItem,
  AdminTenantRow, AdminUserRow, AdminGrantRow, AdminPaymentRow,
} from "./types";

/** Thrown shape is normalised so hooks can decide demo-fallback vs real-empty. */
export class QafDbError extends Error {
  /** true when the qaf_* tables don't exist yet (DB not set up). */
  notReady: boolean;
  constructor(message: string, notReady = false) {
    super(message);
    this.name = "QafDbError";
    this.notReady = notReady;
  }
}

function wrap(error: { message: string; code?: string } | null): void {
  if (!error) return;
  // 42P01 = undefined_table, PGRST205 = table not found in schema cache
  const notReady =
    error.code === "42P01" ||
    error.code === "PGRST205" ||
    /does not exist|not found|schema cache/i.test(error.message);
  throw new QafDbError(error.message, notReady);
}

// ---------------------------------------------------------------- session
export async function fetchMyProfile(): Promise<QafProfile | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_users")
    .select("id, tenant_id, role, status, full_name, email, initials, avatar_url")
    .limit(1)
    .maybeSingle();
  wrap(error);
  return (data as QafProfile) ?? null;
}

export async function fetchMyTenant(tenantId: string): Promise<QafTenant | null> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_tenants")
    .select("id, slug, name, name_en, plan, enabled_addons, status, trial_ends_at")
    .eq("id", tenantId)
    .maybeSingle();
  wrap(error);
  return (data as QafTenant) ?? null;
}

/** Create the caller's firm + make them its admin. Returns the new tenant id. */
export async function provisionTenant(args: {
  slug: string;
  name: string;
  emailDomain?: string;
  fullName?: string;
  plan?: string;
}): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb.rpc("qaf_provision_tenant", {
    p_slug: args.slug,
    p_name: args.name,
    p_email_domain: args.emailDomain ?? null,
    p_full_name: args.fullName ?? null,
    p_plan: args.plan ?? "bundle_base",
  });
  wrap(error);
  return data as string;
}

/**
 * Apply a chosen bundle to a firm: set the plan + enable EXACTLY the addons that
 * bundle includes (so the office only sees its plan's features, matching the
 * landing page). Callable by the firm owner (RLS: admin updates own tenant).
 */
export async function applyBundleToTenant(
  tenantId: string, plan: string, addons: string[],
): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_tenants")
    .update({ plan, enabled_addons: addons, updated_at: new Date().toISOString() })
    .eq("id", tenantId);
  wrap(error);
}

/** localStorage key holding a firm the user started creating at signup. */
export const PENDING_FIRM_KEY = "qaf_pending_firm";

/**
 * Finish provisioning a firm the user started at signup but couldn't complete
 * because their session wasn't ready yet (e.g. email-confirmation flow).
 * Safe to call on every authenticated load — no-op when nothing is pending.
 * Returns the new tenant id, or null if there was nothing to provision.
 * Throws QafDbError(notReady) when the qaf_* objects don't exist yet.
 */
export async function maybeProvisionPendingFirm(): Promise<string | null> {
  let raw: string | null = null;
  try { raw = localStorage.getItem(PENDING_FIRM_KEY); } catch { return null; }
  if (!raw) return null;
  let pend: { slug?: string; name?: string; fullName?: string; plan?: string; addons?: string[] };
  try { pend = JSON.parse(raw); } catch { return null; }
  if (!pend.slug || !pend.name) return null;
  const id = await provisionTenant({
    slug: pend.slug, name: pend.name, fullName: pend.fullName, plan: pend.plan,
  });
  if (id && pend.plan && pend.addons?.length) {
    try { await applyBundleToTenant(id, pend.plan, pend.addons); } catch { /* non-fatal */ }
  }
  try { localStorage.removeItem(PENDING_FIRM_KEY); } catch { /* ignore */ }
  return id;
}

// ---------------------------------------------------------------- cases
const RISK_FALLBACK = 0;
export async function fetchCases(): Promise<Case[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_cases")
    .select("*")
    .is("archived_at", null)
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): Case => ({
    id: r.id,
    name: r.case_number,
    court: r.court ?? "",
    type: r.case_type ?? "",
    plaintiff: r.plaintiff ?? "",
    defendant: r.defendant ?? "",
    status: r.status_label ?? statusToLabel(r.status),
    action: r.current_action ?? "",
    deadline: r.deadline ?? "",
    risk: r.risk_score ?? RISK_FALLBACK,
    assignedTo: r.assigned_to_name ?? "",
  }));
}

function statusToLabel(s: string): string {
  const map: Record<string, string> = {
    open: "نشط", in_progress: "نشط", hearing_scheduled: "نشط",
    awaiting_judgment: "معلق", won: "مغلق", lost: "مغلق",
    settled: "مغلق", withdrawn: "مغلق", archived: "مؤرشف", draft: "مسودة",
  };
  return map[s] ?? "نشط";
}

// ---------------------------------------------------------------- documents
export async function fetchDocuments(): Promise<DocItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_documents")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): DocItem => ({
    id: r.id,
    name: r.name,
    type: r.file_type ?? "PDF",
    size: r.size_label ?? "",
    case: r.case_number ?? "",
    uploader: r.uploader_name ?? "",
    date: (r.created_at ?? "").slice(0, 10),
  }));
}

// ---------------------------------------------------------------- events
export async function fetchEvents(): Promise<EventItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_schedule_events")
    .select("*")
    .order("event_date", { ascending: true });
  wrap(error);
  return (data ?? []).map((r): EventItem => ({
    id: r.id,
    title: r.title,
    date: r.event_date,
    time: r.event_time ?? "",
    type: r.event_type ?? "جلسة",
    desc: r.description ?? r.location ?? "",
  }));
}

// ---------------------------------------------------------------- tasks
export async function fetchTasks(): Promise<TaskItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_tasks")
    .select("*")
    .order("due_date", { ascending: true });
  wrap(error);
  return (data ?? []).map((r): TaskItem => ({
    id: r.id,
    title: r.title,
    priority: r.priority ?? "متوسطة",
    due: r.due_date ?? "",
    status: r.status ?? "todo",
  }));
}

// ---------------------------------------------------------------- users
export async function fetchUsers(): Promise<UserItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_users")
    .select("*")
    .order("created_at", { ascending: true });
  wrap(error);
  return (data ?? []).map((r): UserItem => ({
    id: r.id,
    name: r.full_name,
    email: r.email,
    role: roleToLabel(r.role),
    status: r.status === "active" ? "نشط" : r.status,
    lastLogin: r.last_seen_at ? r.last_seen_at.slice(0, 10) : "—",
    initials: r.initials ?? initialsOf(r.full_name),
  }));
}

function initialsOf(name: string): string {
  const parts = (name || "").trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}

function roleToLabel(role: string): string {
  const map: Record<string, string> = {
    admin: "مدير النظام", general_manager: "مدير عام",
    executive_director: "مدير تنفيذي", partner: "شريك", manager: "مدير القضايا",
    lawyer: "محامي", consultant: "مستشار قانوني", marketer: "مسوّق",
    auditor: "مدقّق قانوني", accountant: "محاسب", secretary: "سكرتير",
  };
  return map[role] ?? role;
}

// ---------------------------------------------------------------- notifications
export async function fetchNotifications(): Promise<NotificationItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_notifications")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): NotificationItem => ({
    id: r.id,
    title: r.title,
    desc: r.description ?? "",
    time: timeAgo(r.created_at),
    urgency: r.urgency ?? "green",
    unread: !r.is_read,
  }));
}

function timeAgo(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

// ---------------------------------------------------------------- invoices
export async function fetchInvoices(): Promise<InvoiceItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_invoices")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): InvoiceItem => ({
    id: r.id,
    client: r.client_name,
    number: r.invoice_number,
    amount: r.amount_sar ?? 0,
    vat: r.vat_sar ?? 0,
    total: r.total_sar ?? 0,
    status: r.status ?? "draft",
    issued: r.issued_at ?? "",
    due: r.due_at ?? "",
  }));
}

// ---------------------------------------------------------------- expenses
export async function fetchExpenses(): Promise<ExpenseItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_expenses")
    .select("*")
    .order("spent_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): ExpenseItem => ({
    id: r.id,
    item: r.item,
    amount: r.amount_sar ?? 0,
    category: r.category ?? "",
    paidBy: r.paid_by ?? "",
    status: r.status ?? "معتمد",
    caseNumber: r.case_number ?? "",
    date: r.spent_at ?? "",
  }));
}

// ---------------------------------------------------------------- clients
export async function fetchClients(): Promise<ClientItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_clients")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): ClientItem => ({
    id: r.id,
    name: r.name,
    type: r.type === "company" ? "شركة" : "فرد",
    contact: r.contact ?? "",
    status: r.status ?? "نشط",
    lawyer: r.lawyer_name ?? "",
  }));
}

// ---------------------------------------------------------------- memos
export async function fetchMemos(): Promise<MemoItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_memos")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): MemoItem => ({
    id: r.id,
    title: r.title,
    type: r.memo_type ?? "memo",
    status: r.status ?? "draft",
    author: r.author_name ?? "",
    due: r.due_date ?? "",
  }));
}

// ---------------------------------------------------------------- archived cases
export async function fetchArchivedCases(): Promise<Case[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_cases")
    .select("*")
    .or("status.eq.won,status.eq.lost,status.eq.settled,status.eq.withdrawn,status.eq.archived,archived_at.not.is.null")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): Case => ({
    id: r.id,
    name: r.case_number,
    court: r.court ?? "",
    type: r.case_type ?? "",
    plaintiff: r.plaintiff ?? "",
    defendant: r.defendant ?? "",
    status: r.status_label ?? "مغلق",
    action: r.current_action ?? "",
    deadline: r.deadline ?? "",
    risk: r.risk_score ?? 0,
    assignedTo: r.assigned_to_name ?? "",
  }));
}

// ---------------------------------------------------------------- attendance
export async function fetchAttendance(): Promise<AttendanceItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_attendance")
    .select("*")
    .order("att_date", { ascending: false })
    .order("employee_name", { ascending: true })
    .limit(50);
  wrap(error);
  // Show the latest recorded day only (today's sheet).
  const rows = data ?? [];
  const latest = rows[0]?.att_date;
  return rows
    .filter((r) => r.att_date === latest)
    .map((r): AttendanceItem => ({
      id: r.id,
      name: r.employee_name,
      role: r.role_title ?? "",
      status: r.status ?? "present",
      checkIn: r.check_in ?? "—",
      commitment: r.commitment_pct ?? 100,
    }));
}

// ---------------------------------------------------------------- requests
export async function fetchRequests(): Promise<RequestItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_requests")
    .select("*")
    .order("submitted_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): RequestItem => ({
    id: r.id,
    code: r.req_code,
    employee: r.employee_name,
    role: r.role_title ?? "",
    type: r.req_type,
    period: r.period_label ?? "",
    reason: r.reason ?? "",
    amount: r.amount_label ?? undefined,
    submitted: r.submitted_at ?? "",
    status: r.status ?? "بانتظار الموافقة",
  }));
}

/** Approve or reject an internal request (admin/GM in the firm). */
export async function decideRequest(id: string | number, approve: boolean): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_requests")
    .update({ status: approve ? "معتمدة" : "مرفوضة", decided_at: new Date().toISOString() })
    .eq("id", id);
  wrap(error);
}

// ---------------------------------------------------------------- salaries
export async function fetchSalaries(): Promise<SalaryItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_salaries")
    .select("*")
    .order("base_sar", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): SalaryItem => ({
    id: r.id,
    name: r.employee_name,
    role: r.role_title ?? "",
    base: r.base_sar ?? 0,
    allowances: r.allowances_sar ?? 0,
    deductions: r.deductions_sar ?? 0,
    status: r.status ?? "معلّق",
    month: r.pay_month ?? "",
  }));
}

// ---------------------------------------------------------------- support tickets
export async function fetchTickets(): Promise<TicketItem[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_support_tickets")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): TicketItem => ({
    id: r.id,
    subject: r.subject,
    body: r.body ?? "",
    priority: r.priority ?? "عادية",
    status: r.status ?? "open",
    requester: r.requester_name ?? "",
    created: (r.created_at ?? "").slice(0, 10),
  }));
}

/** File a new support ticket from the tenant app. */
export async function createTicket(args: {
  subject: string; body: string; priority?: string; requester?: string;
}): Promise<void> {
  const sb = getSupabase();
  const { data: prof } = await sb.from("qaf_users").select("tenant_id, full_name").limit(1).maybeSingle();
  if (!prof?.tenant_id) throw new QafDbError("no tenant", false);
  const { error } = await sb.from("qaf_support_tickets").insert({
    tenant_id: prof.tenant_id,
    subject: args.subject,
    body: args.body,
    priority: args.priority ?? "عادية",
    requester_name: args.requester ?? prof.full_name ?? "",
  });
  wrap(error);
}

// =============================================================================
// CREATE / MUTATE — the "+ New X" buttons. RLS forces tenant_id = my firm.
// =============================================================================

/** The signed-in user's firm id (throws a friendly error if none). */
async function myTenantId(): Promise<string> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_users").select("tenant_id").limit(1).maybeSingle();
  wrap(error);
  const id = data?.tenant_id as string | null | undefined;
  if (!id) throw new QafDbError("سجّل دخولك بحساب مكتب لإضافة بيانات حقيقية.", false);
  return id;
}

const num = (v: string | undefined) => {
  const n = parseInt(String(v ?? "").replace(/[^\d-]/g, ""), 10);
  return Number.isFinite(n) ? n : 0;
};
const orNull = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

type V = Record<string, string>;

export async function createCase(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_cases").insert({
    tenant_id,
    case_number: v.name,
    court: orNull(v.court),
    case_type: v.type || "مدني",
    status: "open",
    status_label: "نشط",
    plaintiff: orNull(v.plaintiff),
    defendant: orNull(v.defendant),
    current_action: orNull(v.action),
    deadline: orNull(v.deadline),
    assigned_to_name: orNull(v.assignedTo),
  });
  wrap(error);
}

export async function createTask(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_tasks").insert({
    tenant_id,
    title: v.title,
    status: v.status || "todo",
    priority: v.priority || "متوسطة",
    due_date: orNull(v.due),
    owner_name: orNull(v.owner),
  });
  wrap(error);
}

export async function markTaskStatus(id: string | number, status: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb.from("qaf_tasks").update({ status }).eq("id", id);
  wrap(error);
}

export async function createEvent(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_schedule_events").insert({
    tenant_id,
    event_type: v.type || "جلسة",
    title: v.title,
    description: orNull(v.desc),
    event_date: v.date,
    event_time: orNull(v.time),
    location: orNull(v.location),
  });
  wrap(error);
}

export async function createMemo(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_memos").insert({
    tenant_id,
    title: v.title,
    memo_type: v.type || "مذكرة",
    status: v.status || "draft",
    author_name: orNull(v.author),
    due_date: orNull(v.due),
  });
  wrap(error);
}

export async function createInvoice(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const amount = num(v.amount);
  const vat = Math.round(amount * 0.15);
  const sb = getSupabase();
  const { error } = await sb.from("qaf_invoices").insert({
    tenant_id,
    client_name: v.client,
    invoice_number: v.number || `INV-${Date.now().toString().slice(-6)}`,
    amount_sar: amount,
    vat_sar: vat,
    total_sar: amount + vat,
    status: v.status || "draft",
    issued_at: v.issued || undefined,
    due_at: orNull(v.due),
  });
  wrap(error);
}

export async function createExpense(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_expenses").insert({
    tenant_id,
    item: v.item,
    amount_sar: num(v.amount),
    category: orNull(v.category),
    paid_by: orNull(v.paidBy),
    status: v.status || "معتمد",
    case_number: orNull(v.caseNumber),
    spent_at: v.date || undefined,
  });
  wrap(error);
}

export async function createClient(v: V): Promise<void> {
  const tenant_id = await myTenantId();
  const sb = getSupabase();
  const { error } = await sb.from("qaf_clients").insert({
    tenant_id,
    name: v.name,
    type: v.type || "individual",
    contact: orNull(v.contact),
    status: v.status || "نشط",
    lawyer_name: orNull(v.lawyer),
  });
  wrap(error);
}

// =============================================================================
// PLATFORM ADMIN (operator) — live cross-tenant reads + control actions.
// RLS only returns cross-tenant rows when auth.uid() ∈ qaf_platform_admins.
// =============================================================================

/** True when the signed-in user is a platform admin (operator of قاف). */
export async function isPlatformAdmin(): Promise<boolean> {
  const sb = getSupabase();
  const { data: sess } = await sb.auth.getSession();
  if (!sess.session) return false;
  const { data, error } = await sb.rpc("qaf_is_platform_admin");
  if (error) return false;
  return data === true;
}

export async function fetchAdminTenants(): Promise<AdminTenantRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_tenants")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): AdminTenantRow => ({
    id: r.id,
    slug: r.slug,
    name: r.name,
    plan: r.plan ?? "bundle_base",
    status: r.status ?? "trialing",
    enabledAddons: r.enabled_addons ?? [],
    trialEndsAt: r.trial_ends_at ? r.trial_ends_at.slice(0, 10) : null,
    createdAt: (r.created_at ?? "").slice(0, 10),
  }));
}

export async function fetchAdminUsers(): Promise<AdminUserRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_users")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): AdminUserRow => ({
    id: r.id,
    name: r.full_name,
    email: r.email,
    role: r.role,
    status: r.status,
    tenantId: r.tenant_id,
    lastSeen: r.last_seen_at ? r.last_seen_at.slice(0, 10) : "—",
    createdAt: (r.created_at ?? "").slice(0, 10),
  }));
}

export async function fetchAdminGrants(): Promise<AdminGrantRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_grants")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): AdminGrantRow => ({
    id: r.id,
    tenantId: r.tenant_id,
    grantType: r.grant_type,
    label: r.label,
    addonKey: r.addon_key,
    startsAt: r.starts_at ?? "",
    expiresAt: r.expires_at,
    autoConvert: !!r.auto_convert,
    reason: r.reason ?? "",
    status: r.status ?? "active",
  }));
}

export async function fetchAdminPayments(): Promise<AdminPaymentRow[]> {
  const sb = getSupabase();
  const { data, error } = await sb
    .from("qaf_payments")
    .select("*")
    .order("created_at", { ascending: false });
  wrap(error);
  return (data ?? []).map((r): AdminPaymentRow => ({
    id: r.id,
    tenantId: r.tenant_id,
    amount: r.amount_sar ?? 0,
    status: r.status ?? "paid",
    paymentType: r.payment_type ?? "subscription",
    paidAt: r.paid_at ? r.paid_at.slice(0, 10) : null,
    createdAt: (r.created_at ?? "").slice(0, 10),
  }));
}

/**
 * THE headline admin action: grant a firm a free feature for a limited time.
 * Inserts a grant record AND enables the addon on the tenant immediately.
 */
export async function grantFeature(args: {
  tenantId: string;
  addonKey: string;
  label: string;
  expiresAt?: string | null; // YYYY-MM-DD or null = permanent
  reason?: string;
  grantType?: string;
}): Promise<void> {
  const sb = getSupabase();
  const { error: gErr } = await sb.from("qaf_grants").insert({
    tenant_id: args.tenantId,
    grant_type: args.grantType ?? "free_addon",
    label: args.label,
    addon_key: args.addonKey,
    expires_at: args.expiresAt ?? null,
    reason: args.reason ?? "",
    status: "active",
  });
  wrap(gErr);

  // Enable the addon on the tenant (idempotent append).
  const { data: t, error: tErr } = await sb
    .from("qaf_tenants").select("enabled_addons").eq("id", args.tenantId).maybeSingle();
  wrap(tErr);
  const current: string[] = t?.enabled_addons ?? [];
  if (!current.includes(args.addonKey)) {
    const { error: uErr } = await sb
      .from("qaf_tenants")
      .update({ enabled_addons: [...current, args.addonKey], updated_at: new Date().toISOString() })
      .eq("id", args.tenantId);
    wrap(uErr);
  }
}

export async function setTenantPlan(tenantId: string, plan: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_tenants")
    .update({ plan, updated_at: new Date().toISOString() })
    .eq("id", tenantId);
  wrap(error);
}

export async function setTenantStatus(tenantId: string, status: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_tenants")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", tenantId);
  wrap(error);
}

export async function setUserStatus(userId: string, status: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_users")
    .update({ status })
    .eq("id", userId);
  wrap(error);
}

export async function expireGrant(grantId: string): Promise<void> {
  const sb = getSupabase();
  const { error } = await sb
    .from("qaf_grants")
    .update({ status: "expired" })
    .eq("id", grantId);
  wrap(error);
}
