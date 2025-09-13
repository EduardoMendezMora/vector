-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 03_create_functions.sql
-- Descripción: Crear funciones y triggers para automatización
-- Fecha: $(date)
-- =====================================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Comentario en la función
COMMENT ON FUNCTION update_updated_at_column() IS 'Función que actualiza automáticamente el campo updated_at cuando se modifica un registro';

-- Función para validar VIN (opcional - validación básica)
CREATE OR REPLACE FUNCTION validate_vin(vin_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- VIN debe tener exactamente 17 caracteres alfanuméricos
    IF vin_text IS NULL OR vin_text = '' THEN
        RETURN TRUE; -- VIN es opcional
    END IF;
    
    IF LENGTH(vin_text) != 17 THEN
        RETURN FALSE;
    END IF;
    
    -- Verificar que solo contenga caracteres alfanuméricos (excepto I, O, Q)
    IF vin_text ~ '^[A-HJ-NPR-Z0-9]{17}$' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ language 'plpgsql';

-- Comentario en la función de validación VIN
COMMENT ON FUNCTION validate_vin(TEXT) IS 'Función para validar formato de VIN (17 caracteres alfanuméricos, sin I, O, Q)';

-- Función para obtener estadísticas de vehículos
CREATE OR REPLACE FUNCTION get_vehicle_stats()
RETURNS TABLE (
    total_vehicles BIGINT,
    active_vehicles BIGINT,
    inactive_vehicles BIGINT,
    maintenance_vehicles BIGINT,
    brands_count BIGINT,
    models_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_vehicles,
        COUNT(*) FILTER (WHERE estado = 'activo') as active_vehicles,
        COUNT(*) FILTER (WHERE estado = 'inactivo') as inactive_vehicles,
        COUNT(*) FILTER (WHERE estado = 'mantenimiento') as maintenance_vehicles,
        COUNT(DISTINCT marca) as brands_count,
        COUNT(DISTINCT modelo) as models_count
    FROM vehiculos;
END;
$$ language 'plpgsql';

-- Comentario en la función de estadísticas
COMMENT ON FUNCTION get_vehicle_stats() IS 'Función que retorna estadísticas generales de la flotilla de vehículos';
