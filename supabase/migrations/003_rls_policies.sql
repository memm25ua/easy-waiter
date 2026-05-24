alter table restaurants enable row level security;
alter table locations enable row level security;
alter table staff_members enable row level security;
alter table restaurant_tables enable row level security;
alter table menu_imports enable row level security;
alter table menus enable row level security;
alter table menu_sections enable row level security;
alter table menu_items enable row level security;
alter table menu_item_options enable row level security;
alter table menu_item_option_values enable row level security;
alter table table_sessions enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table cart_proposals enable row level security;
alter table orders enable row level security;

create policy "service role full access restaurants" on restaurants for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access locations" on locations for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access staff" on staff_members for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access tables" on restaurant_tables for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access imports" on menu_imports for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access menus" on menus for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access sections" on menu_sections for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access items" on menu_items for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access options" on menu_item_options for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access values" on menu_item_option_values for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access sessions" on table_sessions for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access conversations" on ai_conversations for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access messages" on ai_messages for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access proposals" on cart_proposals for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access orders" on orders for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "staff read own assignment" on staff_members for select using (user_id = auth.uid() and is_active);
create policy "staff read assigned restaurants" on restaurants for select using (
  exists (select 1 from staff_members sm where sm.restaurant_id = restaurants.id and sm.user_id = auth.uid() and sm.is_active)
);
create policy "staff read assigned locations" on locations for select using (
  exists (select 1 from staff_members sm where sm.restaurant_id = locations.restaurant_id and sm.user_id = auth.uid() and sm.is_active)
);
create policy "staff manage assigned menus" on menus for all using (
  exists (select 1 from staff_members sm where sm.location_id = menus.location_id and sm.user_id = auth.uid() and sm.is_active and sm.role in ('owner', 'manager', 'staff'))
) with check (
  exists (select 1 from staff_members sm where sm.location_id = menus.location_id and sm.user_id = auth.uid() and sm.is_active and sm.role in ('owner', 'manager'))
);
create policy "table sessions read own active session" on table_sessions for select using (status = 'active');
create policy "public read published menus" on menus for select using (status = 'published');
create policy "public read published sections" on menu_sections for select using (
  exists (select 1 from menus m where m.id = menu_sections.menu_id and m.status = 'published')
);
create policy "public read published items" on menu_items for select using (
  exists (
    select 1 from menu_sections ms
    join menus m on m.id = ms.menu_id
    where ms.id = menu_items.section_id and m.status = 'published'
  )
);
create policy "public read item options" on menu_item_options for select using (true);
create policy "public read option values" on menu_item_option_values for select using (true);
create policy "table session create orders" on orders for insert with check (
  exists (select 1 from table_sessions ts where ts.id = orders.table_session_id and ts.status = 'active')
);
create policy "table session read own orders" on orders for select using (
  exists (select 1 from table_sessions ts where ts.id = orders.table_session_id and ts.status = 'active')
);
create policy "staff read update orders" on orders for all using (
  exists (select 1 from staff_members sm where sm.location_id = orders.location_id and sm.user_id = auth.uid() and sm.is_active)
) with check (
  exists (select 1 from staff_members sm where sm.location_id = orders.location_id and sm.user_id = auth.uid() and sm.is_active)
);
