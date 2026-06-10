-- =============================================================================
-- قاف — Enums for all status / type fields
-- Derived from supabase/_design.json (architecture workflow output).
-- =============================================================================

create type user_role as enum (
  'admin', 'general_manager', 'executive_director', 'partner',
  'manager', 'lawyer', 'consultant', 'marketer', 'auditor',
  'accountant', 'secretary', 'platform_admin'
);

create type user_status as enum ('active', 'invited', 'suspended', 'disabled');

create type tenant_status as enum (
  'trialing', 'active', 'past_due', 'suspended', 'cancelled'
);

create type subscription_tier as enum (
  'trial', 'tier_49', 'tier_199', 'tier_499', 'tier_1999'
);

create type subscription_status as enum (
  'trialing', 'active', 'past_due', 'cancelled', 'expired'
);

create type addon_status as enum ('active', 'cancelled', 'expired');

create type payment_status as enum (
  'initiated', 'pending', 'paid', 'failed', 'refunded'
);

create type case_status as enum (
  'draft', 'open', 'in_progress', 'hearing_scheduled',
  'awaiting_judgment', 'won', 'lost', 'settled', 'withdrawn', 'archived'
);

create type case_type as enum (
  'civil', 'criminal', 'commercial', 'labor', 'family',
  'administrative', 'real_estate', 'ip', 'tax', 'arbitration', 'consulting'
);

create type case_priority as enum ('low', 'normal', 'high', 'urgent');

create type memo_status as enum (
  'draft', 'review', 'approved', 'submitted', 'rejected'
);

create type memo_type as enum (
  'statement_of_claim', 'defense', 'rejoinder', 'appeal',
  'memo_general', 'expert_report'
);

create type document_category as enum (
  'case_document', 'contract', 'evidence', 'id_document',
  'license', 'memo_attachment', 'internal', 'other'
);

create type contract_status as enum (
  'draft', 'pending_signature', 'active', 'expired', 'terminated', 'renewed'
);

create type license_status as enum (
  'active', 'expiring_soon', 'expired', 'renewed'
);

create type lead_status as enum (
  'new', 'contacted', 'qualified', 'proposal_sent', 'negotiating', 'won', 'lost'
);

create type schedule_event_type as enum (
  'hearing', 'client_meeting', 'internal_meeting',
  'deadline', 'reminder', 'consultation'
);

create type attendance_status as enum (
  'present', 'absent', 'late', 'remote', 'leave', 'sick'
);

create type task_status as enum (
  'todo', 'in_progress', 'blocked', 'done', 'cancelled'
);

create type task_priority as enum ('low', 'normal', 'high', 'urgent');

create type invoice_status as enum (
  'draft', 'sent', 'partially_paid', 'paid', 'overdue', 'cancelled', 'refunded'
);

create type notification_type as enum (
  'task_assigned', 'case_update', 'hearing_reminder', 'document_shared',
  'request_status_change', 'payment_received', 'license_expiring',
  'system_alert', 'mention'
);
