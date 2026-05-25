alter table accounts enable row level security;
alter table staff_invitations enable row level security;
alter table marketing_leads enable row level security;
alter table ai_action_audits enable row level security;
alter table deployment_smoke_tests enable row level security;

create policy "service role full access accounts" on accounts for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access staff invitations" on staff_invitations for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access marketing leads" on marketing_leads for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access ai audits" on ai_action_audits for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');
create policy "service role full access smoke tests" on deployment_smoke_tests for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

create policy "account reads itself" on accounts for select using (id = auth.uid());
create policy "public lead insert" on marketing_leads for insert with check (true);

create policy "staff read scoped invitations" on staff_invitations for select using (
  exists (
    select 1 from staff_members sm
    where sm.restaurant_id = staff_invitations.restaurant_id
      and sm.user_id = auth.uid()
      and sm.is_active
      and (
        sm.role = 'owner'
        or (
          sm.role = 'manager'
          and staff_invitations.role = 'staff'
          and sm.location_id = staff_invitations.location_id
        )
      )
  )
);

create policy "staff read ai audits" on ai_action_audits for select using (
  exists (
    select 1 from staff_members sm
    where sm.restaurant_id = ai_action_audits.restaurant_id
      and sm.user_id = auth.uid()
      and sm.is_active
  )
);

create policy "staff read smoke records" on deployment_smoke_tests for select using (
  exists (
    select 1 from staff_members sm
    where sm.user_id = auth.uid() and sm.is_active and sm.role = 'owner'
  )
);

drop policy if exists "public read item options" on menu_item_options;
drop policy if exists "public read option values" on menu_item_option_values;

create policy "public read published item options" on menu_item_options for select using (
  exists (
    select 1 from menu_items mi
    join menu_sections ms on ms.id = mi.section_id
    join menus m on m.id = ms.menu_id
    where mi.id = menu_item_options.menu_item_id and m.status = 'published'
  )
);

create policy "public read published option values" on menu_item_option_values for select using (
  exists (
    select 1 from menu_item_options mio
    join menu_items mi on mi.id = mio.menu_item_id
    join menu_sections ms on ms.id = mi.section_id
    join menus m on m.id = ms.menu_id
    where mio.id = menu_item_option_values.option_id and m.status = 'published'
  )
);
