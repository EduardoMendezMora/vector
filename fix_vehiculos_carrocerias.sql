-- =====================================================
-- SCRIPT DE MODIFICACIÓN: Agregar carroceria_id a vehiculos
-- =====================================================
-- Este script agrega la relación FK entre vehiculos y carrocerias

-- 1. Verificar que la tabla carrocerias existe
SELECT 'Verificando tabla carrocerias...' as estado;
SELECT COUNT(*) as total_carrocerias FROM carrocerias;

-- 2. Agregar columna carroceria_id a vehiculos
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS carroceria_id INTEGER;

-- 3. Crear foreign key constraint
ALTER TABLE vehiculos DROP CONSTRAINT IF EXISTS fk_vehiculos_carroceria;
ALTER TABLE vehiculos ADD CONSTRAINT fk_vehiculos_carroceria 
    FOREIGN KEY (carroceria_id) REFERENCES carrocerias(id) ON DELETE SET NULL;

-- 4. Crear índice para la FK
CREATE INDEX IF NOT EXISTS idx_vehiculos_carroceria_id ON vehiculos(carroceria_id);

-- 5. Migrar datos existentes de carroceria (texto) a carroceria_id (FK)
-- Mapear los valores existentes a los nuevos IDs
UPDATE vehiculos SET carroceria_id = (
    CASE 
        WHEN LOWER(carroceria) = 'suv' THEN (SELECT id FROM carrocerias WHERE nombre = 'Todo Terreno, 4 Puertas')
        WHEN LOWER(carroceria) = 'sedan' THEN (SELECT id FROM carrocerias WHERE nombre = 'Sedan, 4 Puertas')
        WHEN LOWER(carroceria) = 'hatchback' THEN (SELECT id FROM carrocerias WHERE nombre = 'Hatchback, 4 Puertas')
        WHEN LOWER(carroceria) = 'pickup' THEN (SELECT id FROM carrocerias WHERE nombre = 'Pick Up, Extra Cabina')
        WHEN LOWER(carroceria) = 'van' THEN (SELECT id FROM carrocerias WHERE nombre = 'Microbus')
        WHEN LOWER(carroceria) = 'coupe' THEN (SELECT id FROM carrocerias WHERE nombre = 'Sedan, 4 Puertas')
        WHEN LOWER(carroceria) = 'convertible' THEN (SELECT id FROM carrocerias WHERE nombre = 'Sedan, 4 Puertas')
        ELSE (SELECT id FROM carrocerias WHERE nombre = 'Sedan, 4 Puertas') -- Default
    END
) WHERE carroceria IS NOT NULL AND carroceria != '';

-- 6. Verificar migración
SELECT 'Verificación de migración:' as estado;
SELECT 
    v.id,
    v.placa,
    v.carroceria as carroceria_legacy,
    v.carroceria_id,
    c.nombre as carroceria_nueva
FROM vehiculos v
LEFT JOIN carrocerias c ON v.carroceria_id = c.id
ORDER BY v.id;

-- 7. Verificar estructura final
SELECT 'Estructura final de vehiculos:' as estado;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
    AND table_schema = 'public'
    AND column_name IN ('carroceria', 'carroceria_id')
ORDER BY ordinal_position;

-- 8. Verificar constraints
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
    AND kcu.column_name = 'carroceria_id'
ORDER BY tc.constraint_type, tc.constraint_name;
