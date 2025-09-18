-- =====================================================
-- VÉCTOR - Perfiles de Usuario y Autenticación
-- Archivo: 08_profiles_setup.sql
-- Descripción: Crea tabla profiles, funciones, triggers, RLS y promoción de admin
-- =====================================================

-- 1) Tabla profiles
create table if not exists public.profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    email text unique,
    display_name text,
    role text not null default 'user' check (role in ('user','admin','super_admin')),
    active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index if not exists idx_profiles_email on public.profiles (lower(email));

comment on table public.profiles is 'Perfiles de usuario vinculados a auth.users';
comment on column public.profiles.role is 'user|admin|super_admin';
comment on column public.profiles.active is 'Control de acceso a la app';

-- 2) Funciones
-- 2.1 Admin check
create or replace function public.is_current_user_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  return exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.active = true
      and p.role in ('admin','super_admin')
  );
end;
$$;

comment on function public.is_current_user_admin() is 'Retorna true si el usuario actual tiene rol admin/super_admin';

-- 2.2 Crear perfil al crear usuario en auth.users
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.create_profile_for_new_user() is 'Inserta un perfil base tras alta en auth.users';

-- 2.3 Proteger cambios de role/active para no-admin
create or replace function public.protect_profile_admin_fields()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if (new.role is distinct from old.role or new.active is distinct from old.active) then
    if not public.is_current_user_admin() then
      raise exception 'Solo un admin puede cambiar role/active';
    end if;
  end if;
  return new;
end;
$$;

comment on function public.protect_profile_admin_fields() is 'Evita cambios críticos por no-admin';

-- 3) Triggers
-- 3.1 Trigger en auth.users para crear profile
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

-- 3.2 Trigger para proteger campos admin
drop trigger if exists tr_profiles_protect_admin_fields on public.profiles;
create trigger tr_profiles_protect_admin_fields
before update on public.profiles
for each row execute function public.protect_profile_admin_fields();

-- 3.3 Trigger updated_at usando función existente update_updated_at_column()
drop trigger if exists tr_profiles_updated_at on public.profiles;
create trigger tr_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- 4) Row Level Security y Políticas
alter table public.profiles enable row level security;

-- Limpiar políticas previas si existen
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_admin_select_all" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_admin_update_all" on public.profiles;
drop policy if exists "profiles_admin_delete" on public.profiles;
drop policy if exists "profiles_admin_insert" on public.profiles;

-- SELECT: cada usuario ve su propio perfil
create policy "profiles_select_own"
on public.profiles for select
to authenticated
using (id = auth.uid());

-- SELECT: admin ve todos
create policy "profiles_admin_select_all"
on public.profiles for select
to authenticated
using (public.is_current_user_admin());

-- UPDATE: usuario puede actualizar su propio perfil
create policy "profiles_update_own"
on public.profiles for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- UPDATE: admin puede actualizar cualquiera
create policy "profiles_admin_update_all"
on public.profiles for update
to authenticated
using (public.is_current_user_admin())
with check (public.is_current_user_admin());

-- DELETE: solo admin
create policy "profiles_admin_delete"
on public.profiles for delete
to authenticated
using (public.is_current_user_admin());

-- INSERT: opcional (normalmente lo hace el trigger)
create policy "profiles_admin_insert"
on public.profiles for insert
to authenticated
with check (public.is_current_user_admin());

-- 5) Grants
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles to authenticated;

-- 6) Promover super admin (ejecutar después de crear el usuario en Auth)
-- Asegúrate de crear el usuario en Authentication > Users con email y contraseña.
update public.profiles
set role = 'super_admin', active = true
where email ilike 'autosubastascr@gmail.com';

-- 7) Verificación rápida
-- select * from public.profiles order by created_at desc;
-- select public.is_current_user_admin() as soy_admin;


