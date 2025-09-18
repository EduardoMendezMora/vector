-- =====================================================
-- Bitácora / Comentarios por vehículo
-- =====================================================

create table if not exists public.vehiculo_bitacora (
  id bigint generated always as identity primary key,
  vehiculo_id bigint not null references public.vehiculos(id) on delete cascade,
  tipo text not null check (tipo in ('general','mantenimiento','incidencia','ubicacion','cliente','reparacion')),
  comentario text not null,
  importante boolean not null default false,
  autor text,
  created_at timestamptz not null default now()
);

create index if not exists ix_bitacora_vehiculo on public.vehiculo_bitacora(vehiculo_id);
create index if not exists ix_bitacora_created on public.vehiculo_bitacora(created_at desc);

-- RLS (desarrollo permisivo)
alter table if exists public.vehiculo_bitacora enable row level security;
drop policy if exists bitacora_allow_all on public.vehiculo_bitacora;
create policy bitacora_allow_all on public.vehiculo_bitacora for all using (true) with check (true);

-- Verificación
select 'Estructura bitácora' as info, count(*) as total from public.vehiculo_bitacora;


