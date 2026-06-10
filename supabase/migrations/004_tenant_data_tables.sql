-- =============================================================================
-- قاف — Tenant-scoped data tables (every row has tenant_id, every read goes
-- through RLS).
-- =============================================================================
-- This file creates the schema only. RLS policies are in 005_rls.sql.
-- =============================================================================

-- ─── Cases ───────────────────────────────────────────────────────────────────
create table public.cases (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_number text not null,                       -- '2026/0142'
  court text,
  case_type case_type not null default 'civil',
  status case_status not null default 'open',
  priority case_priority not null default 'normal',
  plaintiff text not null,
  defendant text not null,
  current_action text,
  filing_date date,
  next_hearing_date date,
  deadline date,
  risk_score int default 0,
  expected_duration_days int,
  min_duration_days int,
  max_duration_days int,
  assigned_to uuid references public.users(id) on delete set null,
  archived_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_cases_tenant_status on public.cases (tenant_id, status)
  where deleted_at is null;
create index idx_cases_tenant_deadline on public.cases (tenant_id, deadline)
  where deleted_at is null and deadline is not null;
create index idx_cases_assigned on public.cases (tenant_id, assigned_to)
  where deleted_at is null;
create unique index idx_cases_number on public.cases (tenant_id, case_number)
  where deleted_at is null;

-- ─── Case timeline ───────────────────────────────────────────────────────────
create table public.case_timeline (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid not null references public.cases(id) on delete cascade,
  event_date date not null,
  event_type text not null,
  description text not null,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index idx_timeline_case on public.case_timeline (case_id, event_date desc);

-- ─── Documents ───────────────────────────────────────────────────────────────
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  storage_path text not null,                      -- {tenant_id}/cases/{case_id}/file.pdf
  name text not null,
  category document_category not null default 'other',
  file_type text,
  size_bytes bigint,
  uploaded_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_documents_tenant on public.documents (tenant_id, created_at desc)
  where deleted_at is null;
create index idx_documents_case on public.documents (case_id) where deleted_at is null;

-- ─── Memos ───────────────────────────────────────────────────────────────────
create table public.memos (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  title text not null,
  memo_type memo_type not null default 'memo_general',
  status memo_status not null default 'draft',
  body text not null,
  template_id uuid,
  author_id uuid references public.users(id) on delete set null,
  current_approver_id uuid references public.users(id) on delete set null,
  due_date date,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create index idx_memos_tenant_status on public.memos (tenant_id, status)
  where deleted_at is null;
create index idx_memos_case on public.memos (case_id) where deleted_at is null;
create index idx_memos_due on public.memos (tenant_id, due_date)
  where deleted_at is null and due_date is not null;

-- ─── Schedule ────────────────────────────────────────────────────────────────
create table public.schedule_events (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  event_type schedule_event_type not null,
  title text not null,
  description text,
  event_date date not null,
  event_time time,
  location text,
  attendees uuid[] not null default array[]::uuid[],
  reminder_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_schedule_tenant_date on public.schedule_events (tenant_id, event_date);

-- ─── Tasks ───────────────────────────────────────────────────────────────────
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  case_id uuid references public.cases(id) on delete set null,
  title text not null,
  description text,
  assigned_to uuid references public.users(id) on delete set null,
  status task_status not null default 'todo',
  priority task_priority not null default 'normal',
  due_date date,
  completed_at timestamptz,
  created_by uuid references public.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index idx_tasks_owner on public.tasks (tenant_id, assigned_to, status);

-- ─── Notifications ──────────────────────────────────────────────────────────
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  target_user_id uuid references public.users(id) on delete cascade,  -- null = whole tenant
  notif_type notification_type not null,
  title text not null,
  description text,
  link_path text,                                  -- /cases/abc
  urgency text not null default 'normal',          -- red | yellow | green
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create index idx_notifications_target on public.notifications (tenant_id, target_user_id, is_read);

-- ─── Invoices ───────────────────────────────────────────────────────────────
create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_name text not null,
  case_id uuid references public.cases(id) on delete set null,
  invoice_number text not null,
  amount_sar int not null,
  vat_amount_sar int not null default 0,
  total_sar int not null,
  status invoice_status not null default 'draft',
  issued_at date not null default current_date,
  due_at date,
  paid_at date,
  zatca_uuid text,                                 -- ZATCA Phase 2 reference
  zatca_hash text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_invoices_number on public.invoices (tenant_id, invoice_number);
create index idx_invoices_status on public.invoices (tenant_id, status);
