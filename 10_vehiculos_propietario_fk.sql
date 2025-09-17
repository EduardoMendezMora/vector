-- ==============================================
-- Vehículos: columna propietario_id + FK RESTRICT
-- Ejecutar en Supabase SQL Editor
-- ==============================================

-- 1) Agregar columna (nullable por ahora)
alter table if exists public.vehiculos
  add column if not exists propietario_id bigint;

-- 2) Crear FK con RESTRICT (bloquea borrado si está referenciado)
--    Hacer idempotente: eliminar si ya existía
alter table if exists public.vehiculos
  drop constraint if exists fk_vehiculos_propietario;

alter table if exists public.vehiculos
  add constraint fk_vehiculos_propietario
  foreign key (propietario_id)
  references public.propietarios(id)
  on delete restrict
  on update cascade;

-- 3) Índice para joins y filtros
create index if not exists ix_vehiculos_propietario on public.vehiculos(propietario_id);


