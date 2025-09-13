-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 07_verification_queries.sql
-- Descripción: Consultas para verificar la instalación
-- Fecha: $(date)
-- =====================================================

-- =====================================================
-- VERIFICACIÓN DE LA ESTRUCTURA DE LA BASE DE DATOS
-- =====================================================

-- 1. Verificar que la tabla existe y tiene la estructura correcta
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
ORDER BY ordinal_position;

-- 2. Verificar que los índices se crearon correctamente
SELECT 
    indexname,
    tablename,
    indexdef
FROM pg_indexes 
WHERE tablename = 'vehiculos'
ORDER BY indexname;

-- 3. Verificar que las políticas RLS están activas
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'vehiculos';

-- 4. Verificar las políticas creadas
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'vehiculos';

-- 5. Verificar que las funciones se crearon correctamente
SELECT 
    routine_name,
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('update_updated_at_column', 'validate_vin', 'get_vehicle_stats')
ORDER BY routine_name;

-- 6. Verificar que los triggers están activos
SELECT 
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'vehiculos'
ORDER BY trigger_name;

-- =====================================================
-- VERIFICACIÓN DE DATOS
-- =====================================================

-- 7. Contar total de vehículos
SELECT COUNT(*) as total_vehiculos FROM vehiculos;

-- 8. Estadísticas por estado
SELECT 
    estado,
    COUNT(*) as cantidad,
    ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as porcentaje
FROM vehiculos 
GROUP BY estado 
ORDER BY cantidad DESC;

-- 9. Estadísticas por marca
SELECT 
    marca,
    COUNT(*) as cantidad,
    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
    COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivos,
    COUNT(*) FILTER (WHERE estado = 'mantenimiento') as en_mantenimiento
FROM vehiculos 
GROUP BY marca 
ORDER BY cantidad DESC;

-- 10. Estadísticas por año
SELECT 
    año,
    COUNT(*) as cantidad
FROM vehiculos 
GROUP BY año 
ORDER BY año DESC;

-- 11. Estadísticas por tipo de combustible
SELECT 
    combustible,
    COUNT(*) as cantidad
FROM vehiculos 
WHERE combustible IS NOT NULL
GROUP BY combustible 
ORDER BY cantidad DESC;

-- 12. Estadísticas por tipo de carrocería
SELECT 
    carroceria,
    COUNT(*) as cantidad
FROM vehiculos 
WHERE carroceria IS NOT NULL
GROUP BY carroceria 
ORDER BY cantidad DESC;

-- =====================================================
-- PRUEBAS DE FUNCIONALIDAD
-- =====================================================

-- 13. Probar la función de estadísticas
SELECT * FROM get_vehicle_stats();

-- 14. Probar búsqueda por placa
SELECT * FROM vehiculos WHERE placa ILIKE '%ABC%';

-- 15. Probar búsqueda por marca
SELECT * FROM vehiculos WHERE marca ILIKE '%Toyota%';

-- 16. Probar filtro por estado
SELECT * FROM vehiculos WHERE estado = 'activo' LIMIT 5;

-- 17. Probar ordenamiento por fecha de creación
SELECT placa, marca, modelo, created_at 
FROM vehiculos 
ORDER BY created_at DESC 
LIMIT 5;

-- 18. Verificar que el trigger de updated_at funciona
-- (Descomenta para probar)
/*
UPDATE vehiculos 
SET color = 'Nuevo Color' 
WHERE placa = 'ABC-123';

SELECT placa, color, updated_at 
FROM vehiculos 
WHERE placa = 'ABC-123';
*/

-- =====================================================
-- CONSULTAS DE MANTENIMIENTO
-- =====================================================

-- 19. Verificar tamaño de la tabla
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename = 'vehiculos';

-- 20. Verificar estadísticas de la tabla
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples
FROM pg_stat_user_tables 
WHERE relname = 'vehiculos';

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

-- 21. Resumen completo de la instalación
SELECT 
    'Tabla vehiculos' as componente,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vehiculos') 
         THEN '✅ Creada' 
         ELSE '❌ No encontrada' 
    END as estado
UNION ALL
SELECT 
    'Índices',
    CASE WHEN (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'vehiculos') > 0 
         THEN '✅ Creados (' || (SELECT COUNT(*) FROM pg_indexes WHERE tablename = 'vehiculos') || ' índices)' 
         ELSE '❌ No encontrados' 
    END
UNION ALL
SELECT 
    'Políticas RLS',
    CASE WHEN (SELECT rowsecurity FROM pg_tables WHERE tablename = 'vehiculos') 
         THEN '✅ Activadas' 
         ELSE '❌ No activadas' 
    END
UNION ALL
SELECT 
    'Funciones',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.routines WHERE routine_name IN ('update_updated_at_column', 'validate_vin', 'get_vehicle_stats')) > 0 
         THEN '✅ Creadas' 
         ELSE '❌ No encontradas' 
    END
UNION ALL
SELECT 
    'Triggers',
    CASE WHEN (SELECT COUNT(*) FROM information_schema.triggers WHERE event_object_table = 'vehiculos') > 0 
         THEN '✅ Activos' 
         ELSE '❌ No activos' 
    END
UNION ALL
SELECT 
    'Datos de ejemplo',
    CASE WHEN (SELECT COUNT(*) FROM vehiculos) > 0 
         THEN '✅ Insertados (' || (SELECT COUNT(*) FROM vehiculos) || ' vehículos)' 
         ELSE '❌ No insertados' 
    END;
