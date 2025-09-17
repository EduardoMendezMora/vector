-- ==============================================
-- Propietarios: Políticas RLS para permitir acceso desde la app
-- Ejecutar en Supabase SQL Editor
-- Nota: Ajusta estas políticas más adelante si quieres restringir por usuario/rol
-- ==============================================

alter table if exists public.propietarios enable row level security;

-- Política permisiva para todas las operaciones
drop policy if exists "propietarios_allow_all" on public.propietarios;
create policy "propietarios_allow_all" on public.propietarios
  for all
  using (true)
  with check (true);


