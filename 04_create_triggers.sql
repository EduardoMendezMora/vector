-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 04_create_triggers.sql
-- Descripción: Crear triggers para automatización
-- Fecha: $(date)
-- =====================================================

-- Trigger para actualizar updated_at automáticamente
CREATE TRIGGER update_vehiculos_updated_at 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comentario en el trigger
COMMENT ON TRIGGER update_vehiculos_updated_at ON vehiculos IS 'Trigger que actualiza automáticamente el campo updated_at cuando se modifica un registro';

-- Trigger para validar VIN (opcional - descomenta si quieres validación automática)
-- CREATE TRIGGER validate_vehiculos_vin
--     BEFORE INSERT OR UPDATE ON vehiculos
--     FOR EACH ROW
--     EXECUTE FUNCTION validate_vin(NEW.vin);

-- Comentario en el trigger de validación VIN
-- COMMENT ON TRIGGER validate_vehiculos_vin ON vehiculos IS 'Trigger que valida el formato del VIN antes de insertar o actualizar';

-- Trigger para logging de cambios (opcional - para auditoría)
CREATE OR REPLACE FUNCTION log_vehicle_changes()
RETURNS TRIGGER AS $$
BEGIN
    -- Crear tabla de auditoría si no existe
    CREATE TABLE IF NOT EXISTS vehiculos_audit (
        id SERIAL PRIMARY KEY,
        vehicle_id INTEGER,
        action VARCHAR(10),
        old_data JSONB,
        new_data JSONB,
        changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        changed_by TEXT DEFAULT current_user
    );
    
    -- Insertar registro de auditoría
    IF TG_OP = 'DELETE' THEN
        INSERT INTO vehiculos_audit (vehicle_id, action, old_data)
        VALUES (OLD.id, 'DELETE', to_jsonb(OLD));
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO vehiculos_audit (vehicle_id, action, old_data, new_data)
        VALUES (NEW.id, 'UPDATE', to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO vehiculos_audit (vehicle_id, action, new_data)
        VALUES (NEW.id, 'INSERT', to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Comentario en la función de logging
COMMENT ON FUNCTION log_vehicle_changes() IS 'Función para registrar cambios en la tabla de vehículos para auditoría';

-- Trigger para logging (opcional - descomenta si quieres auditoría completa)
-- CREATE TRIGGER log_vehiculos_changes
--     AFTER INSERT OR UPDATE OR DELETE ON vehiculos
--     FOR EACH ROW
--     EXECUTE FUNCTION log_vehicle_changes();

-- Comentario en el trigger de logging
-- COMMENT ON TRIGGER log_vehiculos_changes ON vehiculos IS 'Trigger que registra todos los cambios en la tabla de vehículos para auditoría';
