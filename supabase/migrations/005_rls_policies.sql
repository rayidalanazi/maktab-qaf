-- =============================================================================
-- قاف — Row Level Security policies for hard tenant isolation
-- =============================================================================
-- The golden rule: every tenant-scoped table must filter by
--   tenant_id = (auth.jwt() ->> 'tenant_id')::uuid
-- and addon-gated tables must also verify the addon is active.
-- =============================================================================

-- Helper: current tenant from JWT claim
create or replace function auth.current_tenant_id() returns uuid
language sql stable as $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id', '')::uuid;
$$;

-- Helper: current user role from JWT claim
create or replace function auth.current_role() returns text
language sql stable as $$
  select current_setting('request.jwt.claims', true)::jsonb ->> 'role';
$$;

-- Helper: is the current user a platform admin?
create or replace function auth.is_platform_admin() returns boolean
language sql stable as $$
  select exists (
    select 1 from public.platform_admins where user_id = auth.uid()
  );
$$;

-- Helper: is a specific addon enabled for current tenant?
create or replace function auth.has_addon(addon text) returns boolean
language sql stable as $$
  select exists (
    select 1 from public.tenant_addons
    where tenant_id = auth.current_tenant_id()
      and addon_key = addon
      and status = 'active'
  );
$$;

-- =============================================================================
-- Enable RLS on every tenant table
-- =============================================================================
alter table public.tenants enable row level security;
alter table public.subscriptions enable row level security;
alter table public.tenant_addons enable row level security;
alter table public.payments enable row level security;
alter table public.users enable row level security;
alter table public.user_invitations enable row level security;
alter table public.audit_log enable row level security;
alter table public.support_tickets enable row level security;
alter table public.cases enable row level security;
alter table public.case_timeline enable row level security;
alter table public.documents enable row level security;
alter table public.memos enable row level security;
alter table public.schedule_events enable row level security;
alter table public.tasks enable row level security;
alter table public.notifications enable row level security;
alter table public.invoices enable row level security;

-- =============================================================================
-- Tenants — only the tenant itself + platform admins can read
-- =============================================================================
create policy "tenants_select_own"
  on public.tenants for select to authenticated
  using (id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "tenants_update_own"
  on public.tenants for update to authenticated
  using (id = auth.current_tenant_id() and auth.current_role() in ('admin', 'general_manager'))
  with check (id = auth.current_tenant_id());

-- =============================================================================
-- Subscriptions, addons, payments — readable by tenant, mutable by platform
-- =============================================================================
create policy "subs_select" on public.subscriptions for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "addons_select" on public.tenant_addons for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "payments_select" on public.payments for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

-- =============================================================================
-- Users — only same-tenant users can read each other; admin can mutate
-- =============================================================================
create policy "users_select_same_tenant"
  on public.users for select to authenticated
  using (
    (tenant_id = auth.current_tenant_id() and deleted_at is null)
    or auth.is_platform_admin()
  );

create policy "users_admin_insert"
  on public.users for insert to authenticated
  with check (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'general_manager')
  );

create policy "users_admin_update"
  on public.users for update to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (
      auth.current_role() in ('admin', 'general_manager')
      or id = auth.uid()                            -- a user can update themselves
    )
  );

-- =============================================================================
-- Cases — readable by anyone in the tenant; lawyers see only assigned
-- =============================================================================
create policy "cases_select_by_role"
  on public.cases for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and (
      auth.current_role() in ('admin', 'general_manager', 'executive_director', 'partner', 'manager')
      or assigned_to = auth.uid()                   -- lawyers see assigned
    )
  );

create policy "cases_insert"
  on public.cases for insert to authenticated
  with check (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'general_manager', 'partner', 'manager')
  );

create policy "cases_update"
  on public.cases for update to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (
      auth.current_role() in ('admin', 'general_manager', 'partner', 'manager')
      or assigned_to = auth.uid()
    )
  );

-- =============================================================================
-- Documents — addon-gated by documents_vault
-- =============================================================================
create policy "documents_select"
  on public.documents for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and auth.has_addon('documents_vault')
  );

-- =============================================================================
-- Memos — addon-gated by memos_module
-- =============================================================================
create policy "memos_select"
  on public.memos for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and deleted_at is null
    and auth.has_addon('memos_module')
  );

-- =============================================================================
-- Invoices — addon-gated by invoicing_pro
-- =============================================================================
create policy "invoices_select"
  on public.invoices for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and auth.has_addon('invoicing_pro')
  );

-- =============================================================================
-- Tasks, Schedule, Notifications — always available (covered by base plan)
-- =============================================================================
create policy "tasks_select"
  on public.tasks for select to authenticated
  using (tenant_id = auth.current_tenant_id());

create policy "schedule_select"
  on public.schedule_events for select to authenticated
  using (tenant_id = auth.current_tenant_id());

create policy "notifications_select"
  on public.notifications for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and (target_user_id is null or target_user_id = auth.uid())
  );

-- =============================================================================
-- Audit + support — readable by tenant, writable only by service role
-- =============================================================================
create policy "audit_select"
  on public.audit_log for select to authenticated
  using (
    tenant_id = auth.current_tenant_id()
    and auth.current_role() in ('admin', 'auditor', 'general_manager')
  );

create policy "support_select"
  on public.support_tickets for select to authenticated
  using (tenant_id = auth.current_tenant_id() or auth.is_platform_admin());

create policy "support_insert"
  on public.support_tickets for insert to authenticated
  with check (tenant_id = auth.current_tenant_id());
