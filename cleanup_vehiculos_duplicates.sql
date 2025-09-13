-- =====================================================
-- SCRIPT DE LIMPIEZA: Eliminar campos duplicados en vehiculos
-- =====================================================
-- Este script elimina los campos legacy 'marca' y 'modelo' (VARCHAR)
-- y mantiene solo los campos 'marca_id' y 'modelo_id' (INTEGER con FK)

-- 1. Verificar datos actuales antes de la limpieza
SELECT 'ANTES DE LIMPIEZA' as estado;
SELECT 
    id, 
    placa, 
    marca as marca_legacy, 
    marca_id, 
    modelo as modelo_legacy, 
    modelo_id,
    CASE 
        WHEN marca_id IS NOT NULL AND modelo_id IS NOT NULL THEN 'OK - Tiene FK'
        WHEN marca_id IS NULL OR modelo_id IS NULL THEN 'PROBLEMA - Falta FK'
        ELSE 'REVISAR'
    END as estado_fk
FROM vehiculos 
ORDER BY id;

-- 2. Verificar que todos los vehiculos tengan marca_id y modelo_id válidos
SELECT 'VERIFICACIÓN DE FK VÁLIDAS' as estado;
SELECT 
    COUNT(*) as total_vehiculos,
    COUNT(marca_id) as con_marca_id,
    COUNT(modelo_id) as con_modelo_id,
    COUNT(CASE WHEN marca_id IS NOT NULL AND modelo_id IS NOT NULL THEN 1 END) as con_ambos_fk
FROM vehiculos;

-- 3. Verificar que las FK apunten a registros existentes
SELECT 'VERIFICACIÓN DE FK EXISTENTES' as estado;
SELECT 
    'Marcas inexistentes' as tipo,
    COUNT(*) as cantidad
FROM vehiculos v 
LEFT JOIN marcas m ON v.marca_id = m.id 
WHERE v.marca_id IS NOT NULL AND m.id IS NULL

UNION ALL

SELECT 
    'Modelos inexistentes' as tipo,
    COUNT(*) as cantidad
FROM vehiculos v 
LEFT JOIN modelos mo ON v.modelo_id = mo.id 
WHERE v.modelo_id IS NOT NULL AND mo.id IS NULL;

-- 4. Si hay problemas, corregir datos antes de eliminar campos
-- (Solo ejecutar si hay registros con FK faltantes o inválidas)

-- 5. Eliminar campos legacy (marca y modelo VARCHAR)
-- ⚠️ ADVERTENCIA: Esto eliminará permanentemente los campos de texto
-- Asegúrate de que todos los vehiculos tengan marca_id y modelo_id válidos

-- Eliminar campos legacy duplicados
ALTER TABLE vehiculos DROP COLUMN IF EXISTS marca;
ALTER TABLE vehiculos DROP COLUMN IF EXISTS modelo;

-- 6. Verificar estructura final
SELECT 'ESTRUCTURA FINAL' as estado;
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
    AND table_schema = 'public'
ORDER BY ordinal_position;

-- 7. Verificar datos finales
SELECT 'DATOS FINALES' as estado;
SELECT 
    v.id, 
    v.placa, 
    v.marca_id, 
    v.modelo_id,
    m.nombre as marca_nombre,
    mo.nombre as modelo_nombre
FROM vehiculos v
LEFT JOIN marcas m ON v.marca_id = m.id
LEFT JOIN modelos mo ON v.modelo_id = mo.id
ORDER BY v.id;

-- 8. Verificar constraints y foreign keys
SELECT 'CONSTRAINTS Y FK' as estado;
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
ORDER BY tc.constraint_type, tc.constraint_name;
