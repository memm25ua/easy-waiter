alter table import_warnings enable row level security;
alter table menu_draft_versions enable row level security;
alter table published_menu_snapshots enable row level security;
alter table order_status_events enable row level security;

create policy "service role full access import warnings" on import_warnings
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access menu draft versions" on menu_draft_versions
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access published menu snapshots" on published_menu_snapshots
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "service role full access order status events" on order_status_events
  for all using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "owner manager read import warnings" on import_warnings for select using (
  exists (
    select 1
    from menu_imports mi
    join staff_members sm on sm.restaurant_id = mi.restaurant_id
    where mi.id = import_warnings.menu_import_id
      and sm.user_id = auth.uid()
      and sm.is_active
      and sm.role in ('owner', 'manager')
      and (sm.role = 'owner' or sm.location_id = mi.location_id)
  )
);

create policy "owner manager read menu versions" on menu_draft_versions for select using (
  exists (
    select 1
    from menus m
    join staff_members sm on sm.restaurant_id = m.restaurant_id
    where m.id = menu_draft_versions.menu_id
      and sm.user_id = auth.uid()
      and sm.is_active
      and sm.role in ('owner', 'manager')
      and (sm.role = 'owner' or sm.location_id = m.location_id)
  )
);

create policy "staff read current published snapshots" on published_menu_snapshots for select using (
  exists (
    select 1
    from staff_members sm
    where sm.restaurant_id = published_menu_snapshots.restaurant_id
      and sm.user_id = auth.uid()
      and sm.is_active
      and (sm.role = 'owner' or sm.location_id = published_menu_snapshots.location_id)
  )
);

create policy "staff read scoped order status events" on order_status_events for select using (
  exists (
    select 1
    from orders o
    join staff_members sm on sm.location_id = o.location_id
    where o.id = order_status_events.order_id
      and sm.user_id = auth.uid()
      and sm.is_active
  )
);
