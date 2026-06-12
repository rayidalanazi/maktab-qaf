-- =============================================================================
-- قاف — SETUP V8: per-person single-use INVITE LINKS -----------------------------
-- The owner creates an invite (email/name/role) -> gets a unique shareable LINK.
-- The invitee opens it (logged out), sees "you're invited to <firm> as <role>",
-- creates an account, and joins as an employee. The link is single-use (consumed
-- on accept) and expires. Idempotent. On top of live SETUP_V4 (qaf_invitations).
-- =============================================================================

-- 1) token + expiry on invitations --------------------------------------------
alter table public.qaf_invitations add column if not exists token text;
alter table public.qaf_invitations add column if not exists expires_at timestamptz;

-- defaults for NEW invites: random 32-hex token + 30-day expiry
alter table public.qaf_invitations alter column token set default replace(gen_random_uuid()::text, '-', '');
alter table public.qaf_invitations alter column expires_at set default (now() + interval '30 days');

-- backfill any existing pending invites so their links work too
update public.qaf_invitations
  set token = coalesce(token, replace(gen_random_uuid()::text, '-', '')),
      expires_at = coalesce(expires_at, created_at + interval '30 days')
  where status = 'invited' and (token is null or expires_at is null);

create unique index if not exists uq_qaf_invitations_token
  on public.qaf_invitations (token) where token is not null;

-- 2) ANON lookup — the join page shows the invite BEFORE the user logs in -------
-- SECURITY DEFINER (bypasses RLS) but returns only firm name + role + email hint.
create or replace function public.qaf_invite_lookup(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_inv record; v_firm text;
begin
  if p_token is null or length(p_token) < 8 then return jsonb_build_object('ok', false, 'reason', 'invalid'); end if;
  select * into v_inv from public.qaf_invitations where token = p_token limit 1;
  if v_inv.id is null then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  if v_inv.status <> 'invited' then return jsonb_build_object('ok', false, 'reason', 'used'); end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired'); end if;
  select name into v_firm from public.qaf_tenants where id = v_inv.tenant_id;
  return jsonb_build_object('ok', true, 'firm', v_firm, 'role', v_inv.role,
                            'email', v_inv.email, 'full_name', v_inv.full_name);
end $fn$;
grant execute on function public.qaf_invite_lookup(text) to anon, authenticated;

-- 3) ACCEPT by token — the signed-in (just-registered) user joins, single-use ---
create or replace function public.qaf_accept_invite_token(p_token text)
returns jsonb language plpgsql security definer set search_path = public as $fn$
declare v_uid uuid := auth.uid(); v_email text; v_inv record;
begin
  if v_uid is null then return jsonb_build_object('ok', false, 'reason', 'not_authenticated'); end if;
  if exists (select 1 from public.qaf_users where id = v_uid and tenant_id is not null) then
    return jsonb_build_object('ok', false, 'reason', 'already_in_firm',
                              'tenant', (select tenant_id from public.qaf_users where id = v_uid));
  end if;
  select * into v_inv from public.qaf_invitations where token = p_token limit 1;
  if v_inv.id is null then return jsonb_build_object('ok', false, 'reason', 'not_found'); end if;
  if v_inv.status <> 'invited' then return jsonb_build_object('ok', false, 'reason', 'used'); end if;
  if v_inv.expires_at is not null and v_inv.expires_at < now() then
    return jsonb_build_object('ok', false, 'reason', 'expired'); end if;

  select email into v_email from auth.users where id = v_uid;
  insert into public.qaf_users (id, tenant_id, role, status, full_name, email)
  values (v_uid, v_inv.tenant_id, v_inv.role, 'active', coalesce(v_inv.full_name, v_email), v_email)
  on conflict (id) do update set tenant_id = v_inv.tenant_id, role = v_inv.role, status = 'active';
  update public.qaf_invitations set status = 'accepted' where id = v_inv.id;  -- single use
  return jsonb_build_object('ok', true, 'tenant', v_inv.tenant_id);
end $fn$;
grant execute on function public.qaf_accept_invite_token(text) to authenticated;

-- =============================================================================
-- DONE V8. inviteUser returns a token; link = /join?t=<token>. Owner shares it;
-- invitee signs up and qaf_accept_invite_token binds them to the firm (once).
-- =============================================================================
