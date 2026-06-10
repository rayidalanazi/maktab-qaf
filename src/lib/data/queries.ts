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
  let pend: { slug?: string; name?: string; fullName?: string };
  try { pend = JSON.parse(raw); } catch { return null; }
  if (!pend.slug || !pend.name) return null;
  const id = await provisionTenant({
    slug: pend.slug, name: pend.name, fullName: pend.fullName,
  });
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
