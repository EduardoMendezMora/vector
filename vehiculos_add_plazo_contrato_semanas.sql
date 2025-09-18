-- =====================================================
-- SCRIPT: Agregar plazo contractual (semanas) a vehículos
-- Descripción: Crea la columna float (double precision) para almacenar
--              el plazo contractual en semanas. Permite decimales.
-- Ejecución: Supabase SQL Editor (Proyecto de producción)
-- =====================================================

-- 1) Agregar columna si no existe
alter table if exists public.vehiculos
  add column if not exists plazo_contrato_semanas double precision;

-- 2) Regla simple de validación (no negativo)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'chk_vehiculos_plazo_contrato_nonneg'
  ) then
    alter table public.vehiculos
      add constraint chk_vehiculos_plazo_contrato_nonneg
      check (plazo_contrato_semanas is null or plazo_contrato_semanas >= 0);
  end if;
end $$;

-- 3) Comentario
comment on column public.vehiculos.plazo_contrato_semanas is 'Plazo contractual en semanas (float), admite decimales';

-- 4) Verificación rápida
select 'Estructura de plazo contractual' as info,
       column_name, data_type, is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name = 'vehiculos'
  and column_name = 'plazo_contrato_semanas';


