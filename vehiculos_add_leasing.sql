-- =====================================================
-- SCRIPT: Agregar campo Leasing Semanal a Vehículos
-- =====================================================
-- Este script agrega el campo leasing_semanal a la tabla vehiculos

-- 1. Agregar columna leasing_semanal
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS leasing_semanal FLOAT;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN vehiculos.leasing_semanal IS 'Valor semanal del leasing en colones costarricenses';

-- 3. Crear índice para consultas por leasing (opcional, para rendimiento)
CREATE INDEX IF NOT EXISTS idx_vehiculos_leasing_semanal ON vehiculos(leasing_semanal);

-- 4. Actualizar algunos registros existentes con valores de ejemplo (opcional)
UPDATE vehiculos 
SET leasing_semanal = CASE 
    WHEN marca_id = 10 AND modelo_id IN (1, 2, 3) THEN 
        CASE 
            WHEN modelo_id = 1 THEN 85000.00  -- Santa Fe
            WHEN modelo_id = 2 THEN 65000.00  -- Tucson  
            WHEN modelo_id = 3 THEN 45000.00  -- Avante
        END
    ELSE 75000.00 -- Valor por defecto para otros vehículos
END
WHERE leasing_semanal IS NULL;

-- 5. Verificar la actualización
SELECT 
    v.id,
    v.placa,
    m.nombre as marca,
    mo.nombre as modelo,
    v.leasing_semanal
FROM vehiculos v
LEFT JOIN marcas m ON v.marca_id = m.id
LEFT JOIN modelos mo ON v.modelo_id = mo.id
ORDER BY v.id;

-- 6. Verificar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
    AND table_schema = 'public'
    AND column_name = 'leasing_semanal';
