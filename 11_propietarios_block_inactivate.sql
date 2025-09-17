-- ==============================================
-- Bloquear desactivar propietario con vehículos
-- Ejecutar en Supabase SQL Editor
-- ==============================================

create or replace function public.prevent_inactivating_owner_with_vehicles()
returns trigger as $$
declare
  v_count integer;
begin
  -- Solo aplicar cuando se intenta poner activo = false
  if new.activo = false and old.activo = true then
    select count(*) into v_count from public.vehiculos where propietario_id = old.id;
    if v_count > 0 then
      raise exception 'No se puede inactivar el propietario: tiene % vehículo(s) asociado(s).', v_count
        using errcode = 'P0001';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_prevent_inactivate_owner on public.propietarios;
create trigger trg_prevent_inactivate_owner
  before update on public.propietarios
  for each row
  execute function public.prevent_inactivating_owner_with_vehicles();


