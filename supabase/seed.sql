insert into restaurants (id, name, slug, owner_user_id)
values
  ('10000000-0000-0000-0000-000000000001', 'Demo Bistro', 'demo-bistro', null),
  ('10000000-0000-0000-0000-000000000002', 'Sample Cantina', 'sample-cantina', null)
on conflict (id) do nothing;

insert into locations (id, restaurant_id, name, timezone, currency)
values
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Demo Bistro Centro', 'Europe/Madrid', 'EUR'),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'Sample Cantina Norte', 'Europe/Madrid', 'EUR')
on conflict (id) do nothing;

insert into accounts (id, email, display_name)
values
  ('91000000-0000-0000-0000-000000000001', 'owner-a@example.com', 'Owner A'),
  ('91000000-0000-0000-0000-000000000002', 'staff-a@example.com', 'Staff A')
on conflict (id) do nothing;

update accounts set preferred_locale = 'en' where id = '91000000-0000-0000-0000-000000000001';
update accounts set preferred_locale = 'es' where id = '91000000-0000-0000-0000-000000000002';

insert into language_preferences (id, account_id, anonymous_session_id, locale, source)
values
  ('93000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', null, 'en', 'account'),
  ('93000000-0000-0000-0000-000000000002', '91000000-0000-0000-0000-000000000002', null, 'es', 'account'),
  ('93000000-0000-0000-0000-000000000003', null, 'es-demo-session', 'es', 'explicit')
on conflict (id) do nothing;

insert into staff_invitations (id, restaurant_id, location_id, email, role, status, token_hash, invited_by_account_id, accepted_by_account_id, expires_at, accepted_at)
values
  (
    '92000000-0000-0000-0000-000000000001',
    '10000000-0000-0000-0000-000000000001',
    '20000000-0000-0000-0000-000000000001',
    'staff-a@example.com',
    'staff',
    'accepted',
    encode(digest('DEMO-INVITE', 'sha256'), 'hex'),
    '91000000-0000-0000-0000-000000000001',
    '91000000-0000-0000-0000-000000000002',
    now() + interval '7 days',
    now()
  )
on conflict (id) do nothing;

insert into staff_members (id, restaurant_id, location_id, user_id, role, is_active, invitation_id, accepted_at)
values
  ('90000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000001', 'owner', true, null, now()),
  ('90000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', null, 'owner', true, null, now()),
  ('90000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '91000000-0000-0000-0000-000000000002', 'staff', true, '92000000-0000-0000-0000-000000000001', now())
on conflict (id) do nothing;

insert into restaurant_tables (id, location_id, label, session_code, qr_token)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Table 1', 'DEMO-1', 'DEMO-1'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Table 2', 'DEMO-2', 'DEMO-2'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Table 3', 'DEMO-3', 'DEMO-3')
on conflict (id) do nothing;

insert into table_sessions (id, table_id, location_id, session_code, access_token_hash, status, expires_at)
values
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'DEMO-1', encode(digest('DEMO-1', 'sha256'), 'hex'), 'active', now() + interval '12 hours'),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'EXPIRED-1', encode(digest('EXPIRED-1', 'sha256'), 'hex'), 'expired', now() - interval '1 hour')
on conflict (id) do nothing;

insert into menus (id, location_id, title, status, published_at)
values ('50000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Demo Bistro Menu', 'published', now())
on conflict (id) do nothing;

insert into menu_sections (id, menu_id, name, description, sort_order)
values
  ('60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Starters', 'Small plates for the table.', 1),
  ('60000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Mains', 'Fresh dishes from the kitchen.', 2)
on conflict (id) do nothing;

insert into menu_items (id, section_id, name, description, price, currency, dietary_tags, allergen_notes, sort_order)
values
  ('70000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'Tomato Toast', 'Grilled bread with tomato, olive oil, and sea salt.', 550, 'EUR', array['vegetarian'], 'Contains gluten', 1),
  ('70000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000002', 'Chicken Rice', 'Saffron rice with roasted chicken and seasonal vegetables.', 1450, 'EUR', array[]::text[], '', 1),
  ('70000000-0000-0000-0000-000000000003', '60000000-0000-0000-0000-000000000002', 'Grilled Sea Bass', 'Sea bass with lemon potatoes and green salad.', 1890, 'EUR', array['fish'], 'Contains fish', 2)
on conflict (id) do nothing;

insert into menu_item_options (id, menu_item_id, name, is_required, min_choices, max_choices, sort_order)
values ('80000000-0000-0000-0000-000000000001', '70000000-0000-0000-0000-000000000002', 'Side', true, 1, 1, 1)
on conflict (id) do nothing;

insert into menu_item_option_values (id, option_id, name, price_delta, is_available, sort_order)
values
  ('81000000-0000-0000-0000-000000000001', '80000000-0000-0000-0000-000000000001', 'Green salad', 0, true, 1),
  ('81000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'Lemon potatoes', 150, true, 2)
on conflict (id) do nothing;

insert into orders (id, location_id, table_session_id, source, status, items, total, currency, customer_notes)
values (
  '82000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  'manual',
  'new',
  '[{"menuItemId":"70000000-0000-0000-0000-000000000001","quantity":2,"selections":[]}]'::jsonb,
  1100,
  'EUR',
  'Olive oil on the side.'
)
on conflict (id) do nothing;

insert into marketing_leads (id, email, restaurant_name, contact_name, message, source, locale)
values (
  '94000000-0000-0000-0000-000000000001',
  'pilot@example.com',
  'Pilot Restaurant',
  'Pilot Owner',
  'Interested in a bilingual pilot.',
  'landing',
  'es'
)
on conflict (id) do nothing;

insert into ai_action_audits (id, table_session_id, restaurant_id, location_id, action_type, proposed_payload, confirmation_state, provider_status, result, locale)
values (
  '95000000-0000-0000-0000-000000000001',
  '40000000-0000-0000-0000-000000000001',
  '10000000-0000-0000-0000-000000000001',
  '20000000-0000-0000-0000-000000000001',
  'proposal',
  '{}'::jsonb,
  'not_required',
  'not_called',
  'seeded',
  'en'
)
on conflict (id) do nothing;

-- Seed auth users for local testing
-- Owner A
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '91000000-0000-0000-0000-000000000001',
  'authenticated',
  'authenticated',
  'owner-a@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '91000000-0000-0000-0000-000000000001',
  '91000000-0000-0000-0000-000000000001',
  jsonb_build_object('sub', '91000000-0000-0000-0000-000000000001', 'email', 'owner-a@example.com'),
  'email',
  '91000000-0000-0000-0000-000000000001',
  null,
  now(),
  now()
)
ON CONFLICT DO NOTHING;

-- Staff A
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  '91000000-0000-0000-0000-000000000002',
  'authenticated',
  'authenticated',
  'staff-a@example.com',
  crypt('password123', gen_salt('bf')),
  now(),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  '91000000-0000-0000-0000-000000000002',
  '91000000-0000-0000-0000-000000000002',
  jsonb_build_object('sub', '91000000-0000-0000-0000-000000000002', 'email', 'staff-a@example.com'),
  'email',
  '91000000-0000-0000-0000-000000000002',
  null,
  now(),
  now()
)
ON CONFLICT DO NOTHING;
