-- =============================================================================
-- قاف — SECURITY PATCH for an ALREADY-DEPLOYED SETUP_SHARED.sql
-- =============================================================================
-- Closes 3 issues found in adversarial review. Idempotent, only touches qaf_*.
-- RUN: Supabase → SQL Editor → paste ALL → Run.  (Run BEFORE seeding / going live.)
--
--   1) [CRITICAL] qaf_platform_admins had RLS OFF → anyone could insert themselves
--      as a cross-tenant super-admin. Enable RLS, revoke writes, read-only self.
--   2) [CRITICAL] qaf_users self-update had no WITH CHECK → a user could set their
--      own role='admin' or jump tenant_id to another firm. Pin role + tenant.
--   3) [LOW] notifications were readable by any same-firm member. Scope per-recipient.
-- =============================================================================

-- ---- 1) Lock down qaf_platform_admins ----
alter table public.qaf_platform_admins enable row level security;
revoke all on public.qaf_platform_admins from anon, authenticated;
grant select on public.qaf_platform_admins to authenticated;
drop policy if exists qaf_platform_admins_self on public.qaf_platform_admins;
create policy qaf_platform_admins_self on public.qaf_platform_admins for select to authenticated
  using (user_id = auth.uid());

-- ---- 2) Fix qaf_users update policies (no self-escalation / no tenant jump) ----
drop policy if exists qaf_users_self_update on public.qaf_users;
create policy qaf_users_self_update on public.qaf_users for update to authenticated
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and tenant_id is not distinct from public.qaf_current_tenant()
    and role::text = public.qaf_current_role()
  );

drop policy if exists qaf_users_admin_update on public.qaf_users;
create policy qaf_users_admin_update on public.qaf_users for update to authenticated
  using (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
  with check (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'));

-- ---- 3) Per-recipient notifications policy ----
drop policy if exists qaf_notifications_all on public.qaf_notifications;
drop policy if exists qaf_notifications_rw on public.qaf_notifications;
create policy qaf_notifications_rw on public.qaf_notifications for all to authenticated
  using (
    public.qaf_is_platform_admin()
    or (
      tenant_id = public.qaf_current_tenant()
      and (
        target_user_id = auth.uid()
        or target_user_id is null
        or public.qaf_current_role() in ('admin','general_manager')
      )
    )
  )
  with check (
    public.qaf_is_platform_admin()
    or (
      tenant_id = public.qaf_current_tenant()
      and (
        public.qaf_current_role() in ('admin','general_manager')
        or target_user_id = auth.uid()
      )
    )
  );

-- =============================================================================
-- DONE. Tenant isolation is now hard. Next: run SEED_DEMO.sql, then sign in.
-- =============================================================================
