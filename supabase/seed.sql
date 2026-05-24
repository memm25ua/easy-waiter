insert into restaurants (id, name, slug, owner_user_id)
values ('10000000-0000-0000-0000-000000000001', 'Demo Bistro', 'demo-bistro', null)
on conflict (id) do nothing;

insert into locations (id, restaurant_id, name, timezone, currency)
values ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Demo Bistro Centro', 'Europe/Madrid', 'EUR')
on conflict (id) do nothing;

insert into restaurant_tables (id, location_id, label, session_code)
values
  ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'Table 1', 'DEMO-1'),
  ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'Table 2', 'DEMO-2'),
  ('30000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'Table 3', 'DEMO-3')
on conflict (id) do nothing;

insert into table_sessions (id, table_id, location_id, session_code, status)
values ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'DEMO-1', 'active')
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
