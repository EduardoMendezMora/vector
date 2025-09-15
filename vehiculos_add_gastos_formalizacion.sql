-- =====================================================
-- SCRIPT: Agregar campo Gastos de Formalización a Vehículos
-- =====================================================
-- Este script agrega el campo gastos_formalizacion a la tabla vehiculos

-- 1. Agregar columna gastos_formalizacion
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS gastos_formalizacion FLOAT;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN vehiculos.gastos_formalizacion IS 'Gastos de formalización del contrato de leasing en colones costarricenses';

-- 3. Crear índice para consultas por gastos de formalización (opcional, para rendimiento)
CREATE INDEX IF NOT EXISTS idx_vehiculos_gastos_formalizacion ON vehiculos(gastos_formalizacion);

-- 4. Actualizar algunos registros existentes con valores de ejemplo (opcional)
UPDATE vehiculos 
SET gastos_formalizacion = CASE 
    WHEN marca_id = 10 AND modelo_id IN (1, 2, 3) THEN 
        CASE 
            WHEN modelo_id = 1 THEN 45000.00  -- Santa Fe
            WHEN modelo_id = 2 THEN 35000.00  -- Tucson  
            WHEN modelo_id = 3 THEN 25000.00  -- Avante
        END
    ELSE 30000.00 -- Valor por defecto para otros vehículos
END
WHERE gastos_formalizacion IS NULL;

-- 5. Verificar la actualización
SELECT 
    v.id,
    v.placa,
    m.nombre as marca,
    mo.nombre as modelo,
    v.leasing_semanal,
    v.gastos_formalizacion
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
    AND column_name IN ('leasing_semanal', 'gastos_formalizacion')
ORDER BY ordinal_position;
