-- ==============================================
-- Propietarios: tabla y restricciones
-- Ejecutar en Supabase SQL Editor
-- ==============================================

-- 1) Tabla propietarios
create table if not exists public.propietarios (
  id bigint generated always as identity primary key,
  tipo text not null check (tipo in ('individual','juridico')),

  -- Individual
  nombre text,
  identificacion text,

  -- Jurídico
  razon_social text,
  identificacion_juridica text,
  apoderado_nombre text,
  apoderado_identificacion text,

  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- Reglas de completitud por tipo
  constraint chk_individual_campos check (
    (tipo <> 'individual') or (
      nombre is not null and nombre <> '' and
      identificacion is not null and identificacion <> ''
    )
  ),
  constraint chk_juridico_campos check (
    (tipo <> 'juridico') or (
      razon_social is not null and razon_social <> '' and
      identificacion_juridica is not null and identificacion_juridica <> '' and
      apoderado_nombre is not null and apoderado_nombre <> '' and
      apoderado_identificacion is not null and apoderado_identificacion <> ''
    )
  )
);

-- 2) Restricciones de unicidad según tipo
create unique index if not exists ux_prop_individual_ident on public.propietarios(identificacion)
  where tipo = 'individual' and identificacion is not null;

create unique index if not exists ux_prop_juridico_ident on public.propietarios(identificacion_juridica)
  where tipo = 'juridico' and identificacion_juridica is not null;

-- 3) Índices útiles
create index if not exists ix_propietarios_tipo on public.propietarios(tipo);
create index if not exists ix_propietarios_activo on public.propietarios(activo);
create index if not exists ix_propietarios_created on public.propietarios(created_at);

-- 4) Trigger updated_at
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_propietarios_updated_at on public.propietarios;
create trigger set_propietarios_updated_at
  before update on public.propietarios
  for each row
  execute function public.set_updated_at();


