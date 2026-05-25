create table if not exists accounts (
  id uuid primary key,
  email text not null unique,
  display_name text not null default '',
  created_at timestamptz not null default now(),
  last_sign_in_at timestamptz
);

alter table restaurants add column if not exists owner_account_id uuid references accounts(id) on delete set null;
alter table restaurants add column if not exists public_contact_email text;
alter table locations add column if not exists public_ordering_enabled boolean not null default true;
alter table restaurant_tables add column if not exists qr_token text;
alter table table_sessions add column if not exists created_by uuid references staff_members(id) on delete set null;
alter table table_sessions add column if not exists access_token_hash text;
alter table table_sessions add column if not exists expires_at timestamptz;
alter table staff_members add column if not exists invitation_id uuid;
alter table staff_members add column if not exists accepted_at timestamptz;
alter table orders add column if not exists total integer not null default 0;
alter table orders add column if not exists currency text not null default 'EUR';
alter table menus add column if not exists updated_by uuid references staff_members(id) on delete set null;

update restaurant_tables set qr_token = session_code where qr_token is null;
alter table restaurant_tables alter column qr_token set not null;
create unique index if not exists restaurant_tables_qr_token_idx on restaurant_tables(qr_token);

create table if not exists staff_invitations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  email text not null,
  role text not null check (role in ('manager', 'staff')),
  status text not null default 'pending' check (status in ('pending', 'accepted', 'expired', 'revoked')),
  token_hash text not null unique,
  invited_by_account_id uuid not null,
  accepted_by_account_id uuid,
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

alter table staff_members
  drop constraint if exists staff_members_invitation_id_fkey;

alter table staff_members
  add constraint staff_members_invitation_id_fkey
  foreign key (invitation_id) references staff_invitations(id) on delete set null;

create table if not exists marketing_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  restaurant_name text not null default '',
  contact_name text not null default '',
  message text not null default '',
  source text not null default 'landing',
  created_at timestamptz not null default now()
);

create table if not exists ai_action_audits (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete set null,
  table_session_id uuid references table_sessions(id) on delete set null,
  restaurant_id uuid references restaurants(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  action_type text not null,
  proposed_payload jsonb not null default '{}'::jsonb,
  confirmation_state text not null default 'not_required',
  provider_status text not null default 'not_called',
  result text not null default '',
  escalation_reason text,
  submitted_order_id uuid references orders(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists deployment_smoke_tests (
  id uuid primary key default gen_random_uuid(),
  environment text not null,
  status text not null check (status in ('pass', 'fail')),
  checked_by uuid,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists accounts_email_idx on accounts(email);
create index if not exists staff_invitations_scope_idx on staff_invitations(restaurant_id, location_id, status, expires_at);
create index if not exists staff_invitations_email_idx on staff_invitations(lower(email), status);
create index if not exists table_sessions_access_token_hash_idx on table_sessions(access_token_hash);
create index if not exists marketing_leads_email_idx on marketing_leads(email);
create index if not exists ai_action_audits_scope_idx on ai_action_audits(restaurant_id, location_id, created_at desc);
create index if not exists deployment_smoke_tests_env_idx on deployment_smoke_tests(environment, created_at desc);
create index if not exists table_sessions_status_opened_idx on table_sessions(status, opened_at desc);
create index if not exists orders_location_created_idx on orders(location_id, created_at desc);

drop trigger if exists accounts_updated_at on accounts;

alter publication supabase_realtime add table orders;
