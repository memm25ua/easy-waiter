create extension if not exists pgcrypto;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  owner_user_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table locations (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  name text not null,
  timezone text not null,
  currency text not null default 'EUR',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table staff_members (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references restaurants(id) on delete cascade,
  location_id uuid references locations(id) on delete cascade,
  user_id uuid,
  role text not null check (role in ('owner', 'manager', 'staff')),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  label text not null,
  session_code text not null unique,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (location_id, label)
);

create table menu_imports (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  uploaded_by uuid references staff_members(id) on delete set null,
  source_file_path text not null,
  status text not null default 'uploaded' check (status in ('uploaded', 'processing', 'needs_review', 'approved', 'failed')),
  confidence_summary jsonb not null default '[]'::jsonb,
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table menus (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'published', 'archived')),
  source_import_id uuid references menu_imports(id) on delete set null,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index one_published_menu_per_location on menus(location_id) where status = 'published';

create table menu_sections (
  id uuid primary key default gen_random_uuid(),
  menu_id uuid not null references menus(id) on delete cascade,
  name text not null,
  description text not null default '',
  sort_order integer not null default 0
);

create table menu_items (
  id uuid primary key default gen_random_uuid(),
  section_id uuid not null references menu_sections(id) on delete cascade,
  name text not null,
  description text not null default '',
  price integer not null check (price >= 0),
  currency text not null default 'EUR',
  dietary_tags text[] not null default '{}',
  allergen_notes text not null default '',
  is_available boolean not null default true,
  sort_order integer not null default 0,
  confidence_flags text[] not null default '{}',
  suggestions text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table menu_item_options (
  id uuid primary key default gen_random_uuid(),
  menu_item_id uuid not null references menu_items(id) on delete cascade,
  name text not null,
  is_required boolean not null default false,
  min_choices integer not null default 0 check (min_choices >= 0),
  max_choices integer not null default 1 check (max_choices >= min_choices),
  sort_order integer not null default 0
);

create table menu_item_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references menu_item_options(id) on delete cascade,
  name text not null,
  price_delta integer not null default 0,
  is_available boolean not null default true,
  sort_order integer not null default 0
);

create table table_sessions (
  id uuid primary key default gen_random_uuid(),
  table_id uuid not null references restaurant_tables(id) on delete cascade,
  location_id uuid not null references locations(id) on delete cascade,
  session_code text not null unique,
  status text not null default 'active' check (status in ('active', 'closed', 'expired')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz
);

create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  table_session_id uuid not null references table_sessions(id) on delete cascade,
  status text not null default 'open' check (status in ('open', 'escalated', 'closed')),
  last_message_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references ai_conversations(id) on delete cascade,
  sender text not null check (sender in ('customer', 'assistant', 'system')),
  content text not null,
  action_type text,
  action_payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table cart_proposals (
  id uuid primary key default gen_random_uuid(),
  table_session_id uuid not null references table_sessions(id) on delete cascade,
  conversation_id uuid references ai_conversations(id) on delete set null,
  status text not null default 'draft' check (status in ('draft', 'requires_confirmation', 'confirmed', 'submitted', 'rejected')),
  items jsonb not null default '[]'::jsonb,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references locations(id) on delete cascade,
  table_session_id uuid not null references table_sessions(id) on delete cascade,
  source text not null check (source in ('manual', 'ai')),
  status text not null default 'new' check (status in ('new', 'accepted', 'preparing', 'ready', 'served', 'cancelled', 'needs_attention')),
  items jsonb not null,
  customer_notes text not null default '',
  staff_notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index staff_members_user_idx on staff_members(user_id);
create index staff_members_location_idx on staff_members(location_id);
create index menus_location_status_idx on menus(location_id, status);
create index table_sessions_code_idx on table_sessions(session_code);
create index orders_location_status_idx on orders(location_id, status, created_at desc);
create index orders_table_session_idx on orders(table_session_id);
create index ai_messages_conversation_idx on ai_messages(conversation_id, created_at);

create trigger restaurants_updated_at before update on restaurants for each row execute function set_updated_at();
create trigger locations_updated_at before update on locations for each row execute function set_updated_at();
create trigger restaurant_tables_updated_at before update on restaurant_tables for each row execute function set_updated_at();
create trigger menu_imports_updated_at before update on menu_imports for each row execute function set_updated_at();
create trigger menus_updated_at before update on menus for each row execute function set_updated_at();
create trigger menu_items_updated_at before update on menu_items for each row execute function set_updated_at();
create trigger cart_proposals_updated_at before update on cart_proposals for each row execute function set_updated_at();
create trigger orders_updated_at before update on orders for each row execute function set_updated_at();
