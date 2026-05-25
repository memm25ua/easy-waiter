alter table accounts add column if not exists preferred_locale text check (preferred_locale in ('en', 'es'));
alter table marketing_leads add column if not exists locale text check (locale in ('en', 'es'));
alter table ai_action_audits add column if not exists locale text check (locale in ('en', 'es'));

create table if not exists language_preferences (
  id uuid primary key default gen_random_uuid(),
  account_id uuid references accounts(id) on delete cascade,
  anonymous_session_id text,
  locale text not null check (locale in ('en', 'es')),
  source text not null default 'explicit' check (source in ('explicit', 'account', 'session', 'browser', 'default')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint language_preferences_owner_check check (account_id is not null or anonymous_session_id is not null)
);

create unique index if not exists language_preferences_account_idx
  on language_preferences(account_id)
  where account_id is not null;

create unique index if not exists language_preferences_anonymous_idx
  on language_preferences(anonymous_session_id)
  where anonymous_session_id is not null;

create index if not exists marketing_leads_locale_idx on marketing_leads(locale);
create index if not exists ai_action_audits_locale_idx on ai_action_audits(locale);

alter table language_preferences enable row level security;

create policy "service role full access language preferences" on language_preferences
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "account reads own language preference" on language_preferences
  for select using (account_id = auth.uid());

create policy "account updates own language preference" on language_preferences
  for update using (account_id = auth.uid())
  with check (account_id = auth.uid());
