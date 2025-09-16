-- =====================================================
-- SCRIPT: Agregar relación FK estados a vehículos
-- =====================================================
-- Este script agrega la relación entre vehiculos y estados

-- 1. Verificar que la tabla estados existe
SELECT 'Verificando tabla estados...' as estado;
SELECT COUNT(*) as total_estados FROM estados;

-- 2. Agregar columna estado_id a vehiculos
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS estado_id INTEGER;

-- 3. Crear foreign key constraint
ALTER TABLE vehiculos DROP CONSTRAINT IF EXISTS fk_vehiculos_estado;
ALTER TABLE vehiculos ADD CONSTRAINT fk_vehiculos_estado 
    FOREIGN KEY (estado_id) REFERENCES estados(id) ON DELETE SET NULL;

-- 4. Crear índice para la FK
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado_id ON vehiculos(estado_id);

-- 5. Migrar datos existentes de estado (texto) a estado_id (FK)
-- Mapear los valores existentes a los nuevos IDs
UPDATE vehiculos SET estado_id = (
    CASE 
        WHEN LOWER(estado) = 'activo' THEN (SELECT id FROM estados WHERE nombre = 'Activo')
        WHEN LOWER(estado) = 'inactivo' THEN (SELECT id FROM estados WHERE nombre = 'Inactivo')
        WHEN LOWER(estado) = 'mantenimiento' THEN (SELECT id FROM estados WHERE nombre = 'En Mantenimiento')
        WHEN LOWER(estado) = 'reparacion' THEN (SELECT id FROM estados WHERE nombre = 'En Reparación')
        WHEN LOWER(estado) = 'disponible' THEN (SELECT id FROM estados WHERE nombre = 'Disponible')
        WHEN LOWER(estado) = 'reservado' THEN (SELECT id FROM estados WHERE nombre = 'Reservado')
        ELSE (SELECT id FROM estados WHERE nombre = 'Activo') -- Default
    END
) WHERE estado IS NOT NULL AND estado != '' AND estado_id IS NULL;

-- 6. Para vehículos sin estado, asignar "Activo" por defecto
UPDATE vehiculos 
SET estado_id = (SELECT id FROM estados WHERE nombre = 'Activo')
WHERE estado_id IS NULL;

-- 7. Verificar migración
SELECT 'Verificación de migración:' as estado;
SELECT 
    v.id,
    v.placa,
    v.estado as estado_legacy,
    v.estado_id,
    e.nombre as estado_nuevo,
    e.color
FROM vehiculos v
LEFT JOIN estados e ON v.estado_id = e.id
ORDER BY v.id;

-- 8. Verificar estructura final
SELECT 'Estructura final de vehiculos:' as estado;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
    AND table_schema = 'public'
    AND column_name IN ('estado', 'estado_id')
ORDER BY ordinal_position;

-- 9. Verificar constraints
SELECT 'Constraints de vehiculos:' as estado;
SELECT 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_name = 'vehiculos' 
    AND tc.table_schema = 'public'
    AND kcu.column_name = 'estado_id'
ORDER BY tc.constraint_type, tc.constraint_name;
