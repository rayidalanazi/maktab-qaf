-- =============================================================================
-- قاف — SETUP V7: mark the subscription OWNER (vs employees) ---------------------
-- The owner = the account that created the firm (signup). Everyone else — invited
-- teammates or accounts the owner created — is an employee, regardless of role
-- (even if the owner grants someone the 'admin' role, they are NOT the owner).
-- Idempotent. Apply on top of the live SETUP_SHARED/V5/V6.
-- =============================================================================

-- 1) owner marker on the firm (plain uuid = the owner's qaf_users.id) -----------
alter table public.qaf_tenants add column if not exists owner_id uuid;

-- 2) backfill existing firms: owner = earliest admin, else earliest member ------
update public.qaf_tenants t set owner_id = sub.uid
from (
  select u.tenant_id,
         u.id as uid,
         row_number() over (
           partition by u.tenant_id
           order by (u.role = 'admin') desc, u.created_at asc
         ) as rn
  from public.qaf_users u
) sub
where sub.tenant_id = t.id and sub.rn = 1 and t.owner_id is null;

-- 3) provision sets owner_id going forward (the signup account owns the firm) ----
create or replace function public.qaf_provision_tenant(
  p_slug text, p_name text, p_email_domain text default null,
  p_full_name text default null, p_plan text default 'bundle_base'
) returns uuid
language plpgsql security definer set search_path = public as $$
declare v_tenant uuid; v_uid uuid := auth.uid(); v_email text;
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  select tenant_id into v_tenant from public.qaf_users where id = v_uid;
  if v_tenant is not null then return v_tenant; end if;

  insert into public.qaf_tenants (slug, name, email_domain, plan, status, trial_ends_at, enabled_addons, owner_id)
  values (lower(p_slug), p_name, p_email_domain, p_plan, 'trialing', now() + interval '14 days',
          array['core_cases','schedule_attendance','documents_vault'], v_uid)
  returning id into v_tenant;

  select email into v_email from auth.users where id = v_uid;
  insert into public.qaf_users (id, tenant_id, role, status, full_name, email)
  values (v_uid, v_tenant, 'admin', 'active', coalesce(p_full_name, v_email), v_email)
  on conflict (id) do update set tenant_id = v_tenant, role = 'admin', status = 'active';

  return v_tenant;
end $$;
grant execute on function public.qaf_provision_tenant(text,text,text,text,text) to authenticated;

-- =============================================================================
-- DONE V7. UI shows "مالك" when qaf_users.id = qaf_tenants.owner_id, else "موظف".
-- =============================================================================
