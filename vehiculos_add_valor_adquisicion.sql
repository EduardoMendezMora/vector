-- =====================================================
-- SCRIPT: Agregar campo Valor de Adquisición/Mercado a Vehículos
-- =====================================================
-- Este script agrega el campo valor_adquisicion a la tabla vehiculos

-- 1. Agregar columna valor_adquisicion
ALTER TABLE vehiculos ADD COLUMN IF NOT EXISTS valor_adquisicion FLOAT;

-- 2. Agregar comentario a la columna
COMMENT ON COLUMN vehiculos.valor_adquisicion IS 'Valor de adquisición o mercado del vehículo en colones costarricenses';

-- 3. Crear índice para consultas por valor de adquisición (opcional, para rendimiento)
CREATE INDEX IF NOT EXISTS idx_vehiculos_valor_adquisicion ON vehiculos(valor_adquisicion);

-- 4. Actualizar algunos registros existentes con valores de ejemplo (opcional)
UPDATE vehiculos 
SET valor_adquisicion = CASE 
    WHEN marca_id = 10 AND modelo_id IN (1, 2, 3) THEN 
        CASE 
            WHEN modelo_id = 1 THEN 18500000.00  -- Santa Fe
            WHEN modelo_id = 2 THEN 14500000.00  -- Tucson  
            WHEN modelo_id = 3 THEN 9500000.00   -- Avante
        END
    ELSE 12000000.00 -- Valor por defecto para otros vehículos
END
WHERE valor_adquisicion IS NULL;

-- 5. Verificar la actualización
SELECT 
    v.id,
    v.placa,
    m.nombre as marca,
    mo.nombre as modelo,
    v.leasing_semanal,
    v.gastos_formalizacion,
    v.valor_adquisicion
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
    AND column_name IN ('leasing_semanal', 'gastos_formalizacion', 'valor_adquisicion')
ORDER BY ordinal_position;
