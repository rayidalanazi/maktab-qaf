-- =============================================================================
-- قاف — SETUP V4: document storage + team invitations
-- =============================================================================
-- Idempotent. Only qaf_ objects (+ a private storage bucket + its policies,
-- scoped to bucket_id='qaf-documents' so lawyer-payments storage is untouched).
-- =============================================================================

-- 1) Private bucket for firm documents -----------------------------------------
insert into storage.buckets (id, name, public)
values ('qaf-documents', 'qaf-documents', false)
on conflict (id) do nothing;

-- Each firm sees/writes ONLY its own folder: {tenant_id}/<file>.
drop policy if exists qaf_docs_select on storage.objects;
create policy qaf_docs_select on storage.objects for select to authenticated
  using (bucket_id = 'qaf-documents' and (storage.foldername(name))[1] = public.qaf_current_tenant()::text);

drop policy if exists qaf_docs_insert on storage.objects;
create policy qaf_docs_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'qaf-documents' and (storage.foldername(name))[1] = public.qaf_current_tenant()::text);

drop policy if exists qaf_docs_delete on storage.objects;
create policy qaf_docs_delete on storage.objects for delete to authenticated
  using (bucket_id = 'qaf-documents' and (storage.foldername(name))[1] = public.qaf_current_tenant()::text);

-- 2) Team invitations ----------------------------------------------------------
create table if not exists public.qaf_invitations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.qaf_tenants(id) on delete cascade,
  email text not null,
  full_name text,
  role qaf_user_role not null default 'lawyer',
  status text not null default 'invited',   -- invited | accepted | revoked
  invited_by uuid,
  created_at timestamptz not null default now()
);
create index if not exists idx_qaf_invitations_tenant on public.qaf_invitations (tenant_id);
create index if not exists idx_qaf_invitations_email on public.qaf_invitations (lower(email));
alter table public.qaf_invitations enable row level security;

-- Firm admin/GM manage their firm's invitations; platform admin sees all.
drop policy if exists qaf_invitations_all on public.qaf_invitations;
create policy qaf_invitations_all on public.qaf_invitations for all to authenticated
  using (
    (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
    or public.qaf_is_platform_admin()
  )
  with check (
    (tenant_id = public.qaf_current_tenant() and public.qaf_current_role() in ('admin','general_manager'))
    or public.qaf_is_platform_admin()
  );

-- 3) Accept-invitation: a signed-in user with NO firm joins the firm that
--    invited their email. SECURITY DEFINER → can read invitations + write users.
create or replace function public.qaf_accept_invitation() returns uuid
language plpgsql security definer set search_path = public as $$
declare v_uid uuid := auth.uid(); v_email text; v_inv record;
begin
  if v_uid is null then return null; end if;
  if exists (select 1 from public.qaf_users where id = v_uid and tenant_id is not null) then
    return (select tenant_id from public.qaf_users where id = v_uid);
  end if;
  select email into v_email from auth.users where id = v_uid;
  select * into v_inv from public.qaf_invitations
    where lower(email) = lower(v_email) and status = 'invited'
    order by created_at desc limit 1;
  if v_inv is null then return null; end if;
  insert into public.qaf_users (id, tenant_id, role, status, full_name, email)
  values (v_uid, v_inv.tenant_id, v_inv.role, 'active', coalesce(v_inv.full_name, v_email), v_email)
  on conflict (id) do update set tenant_id = v_inv.tenant_id, role = v_inv.role, status = 'active';
  update public.qaf_invitations set status = 'accepted' where id = v_inv.id;
  return v_inv.tenant_id;
end $$;
grant execute on function public.qaf_accept_invitation() to authenticated;

-- =============================================================================
-- DONE. Documents upload + team invitations are live.
-- =============================================================================
