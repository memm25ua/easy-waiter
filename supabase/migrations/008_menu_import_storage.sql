insert into storage.buckets (id, name, public)
values ('menu-imports', 'menu-imports', false)
on conflict (id) do update set public = false;

create policy "service role full access menu import resources"
on storage.objects for all
using (bucket_id = 'menu-imports' and auth.role() = 'service_role')
with check (bucket_id = 'menu-imports' and auth.role() = 'service_role');

create policy "staff read scoped menu import resources"
on storage.objects for select
using (
  bucket_id = 'menu-imports'
  and exists (
    select 1
    from staff_members sm
    where sm.user_id = auth.uid()
      and sm.is_active
      and sm.role in ('owner', 'manager')
      and name like sm.restaurant_id::text || '/%'
  )
);
