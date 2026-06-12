-- =============================================================================
-- قاف — SETUP V3: username/password operator + editable per-tier addons
-- =============================================================================
-- Run AFTER V1/V2 (+ create the operator auth user first via _create_operator).
-- Idempotent, only qaf_* objects (+ reads auth.users to enroll the operator).
-- =============================================================================

-- 1) Enroll the username/password operator (rayid-admin@qaf-operator.app) as a
--    platform admin so the /admin console treats it as the operator.
insert into public.qaf_platform_admins (user_id, role)
select id, 'owner' from auth.users where email = 'rayid-admin@qaf-operator.app'
on conflict (user_id) do nothing;

-- 2) Editable plan → addons (the admin customizes which features each tier gets).
create table if not exists public.qaf_bundles (
  bundle_key text primary key,   -- bundle_base | bundle_small | bundle_medium | bundle_enterprise
  name_ar    text not null,
  price_sar  int  not null default 0,
  addon_keys text[] not null default '{}',
  sort       int  not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.qaf_bundles enable row level security;
-- Everyone (even anon, for signup + marketplace display) may READ plan definitions.
drop policy if exists qaf_bundles_read on public.qaf_bundles;
create policy qaf_bundles_read on public.qaf_bundles for select to anon, authenticated using (true);
-- Only platform admins may CHANGE them.
drop policy if exists qaf_bundles_write on public.qaf_bundles;
create policy qaf_bundles_write on public.qaf_bundles for all to authenticated
  using (public.qaf_is_platform_admin()) with check (public.qaf_is_platform_admin());

-- Seed from the current pricing catalog (only if a row doesn't exist yet).
insert into public.qaf_bundles (bundle_key, name_ar, price_sar, addon_keys, sort) values
  ('bundle_base','محامي مستقل',49,
    array['core_cases','schedule_attendance','documents_vault'],1),
  ('bundle_small','مكتب صغير',199,
    array['core_cases','case_timeline_plus','memos_module','templates_library','documents_vault','schedule_attendance','expenses_loans','invoicing_pro'],2),
  ('bundle_medium','مكتب متوسط',499,
    array['core_cases','case_timeline_plus','memos_module','templates_library','precedents_engine','opponents_intel','regulations_hub','documents_vault','schedule_attendance','weekly_reports_capacity','requests_workflow','billable_hours','contracts_licenses','invoicing_pro','expenses_loans','wallet_commissions','reports_basic','kpi_dashboard','whatsapp_sms','priority_support'],3),
  ('bundle_enterprise','Enterprise — الشركات',1999,
    array['core_cases','case_timeline_plus','memos_module','templates_library','precedents_engine','opponents_intel','regulations_hub','schedule_attendance','weekly_reports_capacity','requests_workflow','contracts_licenses','billable_hours','leads_crm','invoicing_pro','expenses_loans','wallet_commissions','salaries_payroll','reports_basic','kpi_dashboard','executive_suite','regulatory_radar','risk_engine','ai_assistant','ai_document_review','whatsapp_sms','documents_vault','custom_domain','api_access','nafath_sso','trust_account','conflict_check','priority_support','dedicated_manager'],4)
on conflict (bundle_key) do nothing;

-- 3) Cleanup the automated test case left during verification.
delete from public.qaf_cases where case_number = 'TEST/0001';

-- =============================================================================
-- DONE. Operator can sign in at /admin with username "rayid-admin" + password.
-- =============================================================================
