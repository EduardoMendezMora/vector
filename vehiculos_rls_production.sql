-- RLS de producción para tabla vehiculos

alter table public.vehiculos enable row level security;

-- Quitar política permisiva de desarrollo si existe
drop policy if exists "Permitir todas las operaciones en vehiculos - DESARROLLO" on public.vehiculos;

-- SELECT: autenticado con perfil activo
drop policy if exists vehiculos_select_authenticated on public.vehiculos;
create policy vehiculos_select_authenticated
on public.vehiculos for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active = true
  )
);

-- INSERT: autenticado con perfil activo
drop policy if exists vehiculos_insert_authenticated on public.vehiculos;
create policy vehiculos_insert_authenticated
on public.vehiculos for insert to authenticated
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active = true
  )
);

-- UPDATE: autenticado con perfil activo
drop policy if exists vehiculos_update_authenticated on public.vehiculos;
create policy vehiculos_update_authenticated
on public.vehiculos for update to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active = true
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active = true
  )
);

-- DELETE: solo admin/super_admin
drop policy if exists vehiculos_delete_admin on public.vehiculos;
create policy vehiculos_delete_admin
on public.vehiculos for delete to authenticated
using (public.is_current_user_admin());


