-- Asignación de vehículos a usuarios (perfiles)

-- Tabla de asignaciones
create table if not exists public.vehiculo_usuarios (
  id bigserial primary key,
  vehiculo_id integer not null references public.vehiculos(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  assigned_by uuid references public.profiles(id),
  assigned_at timestamptz not null default now(),
  active boolean not null default true
);

-- Único por vehículo/usuario
create unique index if not exists ux_vehiculo_usuario on public.vehiculo_usuarios(vehiculo_id, user_id);

-- Índices de consulta
create index if not exists ix_vu_user on public.vehiculo_usuarios(user_id);
create index if not exists ix_vu_vehicle on public.vehiculo_usuarios(vehiculo_id);

comment on table public.vehiculo_usuarios is 'Relación de asignación entre vehiculos y perfiles de usuario';

-- RLS
alter table public.vehiculo_usuarios enable row level security;

-- Limpiar políticas previas
drop policy if exists vu_select on public.vehiculo_usuarios;
drop policy if exists vu_insert_admin on public.vehiculo_usuarios;
drop policy if exists vu_update_admin on public.vehiculo_usuarios;
drop policy if exists vu_delete_admin on public.vehiculo_usuarios;

-- SELECT: usuarios autenticados activos pueden ver asignaciones
create policy vu_select
on public.vehiculo_usuarios for select to authenticated
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.active = true
  )
);

-- INSERT/UPDATE/DELETE: solo admin/super_admin
create policy vu_insert_admin
on public.vehiculo_usuarios for insert to authenticated
with check (public.is_current_user_admin());

create policy vu_update_admin
on public.vehiculo_usuarios for update to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

create policy vu_delete_admin
on public.vehiculo_usuarios for delete to authenticated
using (public.is_current_user_admin());


