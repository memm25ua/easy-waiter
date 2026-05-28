alter table menu_imports add column if not exists restaurant_id uuid references restaurants(id) on delete cascade;
alter table menu_imports add column if not exists source_file_name text not null default '';
alter table menu_imports add column if not exists source_file_type text not null default 'pdf';
alter table menu_imports add column if not exists source_file_size integer not null default 0;
alter table menu_imports add column if not exists ocr_text text not null default '';
alter table menu_imports add column if not exists ocr_confidence_summary jsonb not null default '{}'::jsonb;
alter table menu_imports add column if not exists ai_prompt_version text not null default '';
alter table menu_imports add column if not exists ai_model text not null default '';
alter table menu_imports add column if not exists ai_resource_reference text not null default '';
alter table menu_imports add column if not exists ai_response_summary jsonb not null default '{}'::jsonb;
alter table menu_imports add column if not exists completed_at timestamptz;

update menu_imports mi
set restaurant_id = l.restaurant_id
from locations l
where mi.location_id = l.id and mi.restaurant_id is null;

alter table menu_imports
  drop constraint if exists menu_imports_status_check;

alter table menu_imports
  add constraint menu_imports_status_check
  check (status in ('uploaded', 'ocr_processing', 'ai_processing', 'review_ready', 'failed', 'cancelled', 'processing', 'needs_review', 'approved'));

alter table menus add column if not exists restaurant_id uuid references restaurants(id) on delete cascade;
alter table menus add column if not exists base_version integer not null default 0;
alter table menus add column if not exists current_version integer not null default 1;

update menus m
set restaurant_id = l.restaurant_id
from locations l
where m.location_id = l.id and m.restaurant_id is null;

create table if not exists import_warnings (
  id uuid primary key default gen_random_uuid(),
  menu_import_id uuid not null references menu_imports(id) on delete cascade,
  menu_id uuid references menus(id) on delete cascade,
  target_type text not null check (target_type in ('draft', 'category', 'item', 'option_group', 'option_value')),
  target_id uuid,
  severity text not null check (severity in ('critical', 'non_critical')),
  field_name text not null default '',
  message text not null,
  source_excerpt text not null default '',
  status text not null default 'open' check (status in ('open', 'resolved', 'accepted')),
  created_at timestamptz not null default now(),
  resolved_by uuid references staff_members(id) on delete set null,
  resolved_at timestamptz
);

create table if not exists menu_draft_versions (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  version_number integer not null,
  change_summary text not null default '',
  changed_by uuid references staff_members(id) on delete set null,
  created_at timestamptz not null default now(),
  unique (menu_id, version_number)
);

create table if not exists published_menu_snapshots (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  menu_id uuid not null references menus(id) on delete cascade,
  menu_version integer not null,
  published_by uuid references staff_members(id) on delete set null,
  published_at timestamptz not null default now(),
  is_current boolean not null default true,
  snapshot_payload jsonb not null default '{}'::jsonb
);

create unique index if not exists one_current_published_snapshot_per_location
  on published_menu_snapshots(location_id)
  where is_current;

alter table restaurant_tables add column if not exists stable_entry_token_hash text;
alter table restaurant_tables add column if not exists stable_entry_token_hint text;

update restaurant_tables
set stable_entry_token_hash = qr_token
where stable_entry_token_hash is null and qr_token is not null;

create unique index if not exists restaurant_tables_stable_entry_token_hash_idx
  on restaurant_tables(stable_entry_token_hash)
  where stable_entry_token_hash is not null;

alter table table_sessions add column if not exists opened_by uuid references staff_members(id) on delete set null;
alter table table_sessions add column if not exists closed_by uuid references staff_members(id) on delete set null;
alter table table_sessions add column if not exists current_published_menu_id uuid references published_menu_snapshots(id) on delete set null;

create unique index if not exists one_active_session_per_table
  on table_sessions(table_id)
  where status = 'active';

alter table orders add column if not exists restaurant_id uuid references restaurants(id) on delete cascade;
alter table orders add column if not exists published_menu_snapshot_id uuid references published_menu_snapshots(id) on delete set null;

update orders o
set restaurant_id = l.restaurant_id
from locations l
where o.location_id = l.id and o.restaurant_id is null;

create table if not exists order_status_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by uuid references staff_members(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists menu_imports_scope_status_idx on menu_imports(restaurant_id, location_id, status, created_at desc);
create index if not exists import_warnings_menu_status_idx on import_warnings(menu_id, status, severity);
create index if not exists menu_draft_versions_menu_idx on menu_draft_versions(menu_id, version_number desc);
create index if not exists published_menu_snapshots_scope_idx on published_menu_snapshots(restaurant_id, location_id, published_at desc);
create index if not exists order_status_events_order_idx on order_status_events(order_id, created_at);
