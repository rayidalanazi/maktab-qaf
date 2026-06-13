-- =============================================================================
-- قاف — SETUP V9: complete the support loop --------------------------------------
-- Any firm member (owner OR employee) files a ticket (already works via RLS:
-- qaf_support_tickets_all allows tenant members to insert/read their firm's rows,
-- and the platform operator to read ALL). This adds the OPERATOR REPLY back-channel:
-- a reply + status change that only a platform admin can write (via a definer RPC),
-- which the firm then sees on their ticket. Idempotent.
-- =============================================================================

alter table public.qaf_support_tickets add column if not exists reply text;
alter table public.qaf_support_tickets add column if not exists replied_at timestamptz;
alter table public.qaf_support_tickets add column if not exists replied_by text;

-- Operator-only reply/close. SECURITY DEFINER + explicit platform-admin check so a
-- firm member can never forge a "support reply" on their own ticket.
create or replace function public.qaf_reply_ticket(
  p_id uuid, p_reply text, p_status text default 'answered'
) returns boolean
language plpgsql security definer set search_path = public as $fn$
begin
  if not public.qaf_is_platform_admin() then return false; end if;
  if p_status not in ('open', 'answered', 'closed') then p_status := 'answered'; end if;
  update public.qaf_support_tickets
    set reply       = coalesce(nullif(btrim(p_reply), ''), reply),
        replied_at  = now(),
        replied_by  = 'فريق قاف',
        status      = p_status
    where id = p_id;
  return found;
end $fn$;
grant execute on function public.qaf_reply_ticket(uuid, text, text) to authenticated;

-- =============================================================================
-- DONE V9. Tenant: createTicket (insert) + sees reply/status. Operator: reads all
-- (RLS) + qaf_reply_ticket to answer/close. Status: open | answered | closed.
-- =============================================================================
