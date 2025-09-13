-- =====================================================
-- VÉCTOR - Corregir Relaciones en Tabla Vehículos
-- Proyecto: kltdltqaxhbrxyqvcbxd
-- Fecha: $(date)
-- =====================================================

-- 1. AGREGAR COLUMNAS DE RELACIÓN A LA TABLA VEHÍCULOS
ALTER TABLE vehiculos 
ADD COLUMN IF NOT EXISTS marca_id INTEGER,
ADD COLUMN IF NOT EXISTS modelo_id INTEGER;

-- 2. CREAR FOREIGN KEYS
-- Eliminar constraints existentes si existen
ALTER TABLE vehiculos DROP CONSTRAINT IF EXISTS fk_vehiculos_marca;
ALTER TABLE vehiculos DROP CONSTRAINT IF EXISTS fk_vehiculos_modelo;

-- Crear nuevas foreign keys
ALTER TABLE vehiculos 
ADD CONSTRAINT fk_vehiculos_marca 
    FOREIGN KEY (marca_id) REFERENCES marcas(id) ON DELETE SET NULL;

ALTER TABLE vehiculos 
ADD CONSTRAINT fk_vehiculos_modelo 
    FOREIGN KEY (modelo_id) REFERENCES modelos(id) ON DELETE SET NULL;

-- 3. CREAR ÍNDICES PARA LAS NUEVAS COLUMNAS
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca_id ON vehiculos(marca_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_modelo_id ON vehiculos(modelo_id);

-- 4. MIGRAR DATOS EXISTENTES
-- Primero, vamos a ver qué datos tenemos
SELECT 'Datos actuales en vehiculos:' as info;
SELECT placa, marca, modelo FROM vehiculos LIMIT 5;

-- Migrar marcas existentes (si hay datos en la columna 'marca')
UPDATE vehiculos 
SET marca_id = (
    SELECT id FROM marcas 
    WHERE LOWER(nombre) = LOWER(vehiculos.marca)
)
WHERE marca IS NOT NULL 
  AND marca_id IS NULL 
  AND EXISTS (SELECT 1 FROM marcas WHERE LOWER(nombre) = LOWER(vehiculos.marca));

-- Migrar modelos existentes (si hay datos en la columna 'modelo')
UPDATE vehiculos 
SET modelo_id = (
    SELECT id FROM modelos 
    WHERE LOWER(nombre) = LOWER(vehiculos.modelo)
)
WHERE modelo IS NOT NULL 
  AND modelo_id IS NULL 
  AND EXISTS (SELECT 1 FROM modelos WHERE LOWER(nombre) = LOWER(vehiculos.modelo));

-- Si no hay coincidencias, asignar Hyundai por defecto a los vehículos existentes
UPDATE vehiculos 
SET marca_id = (SELECT id FROM marcas WHERE nombre = 'Hyundai' LIMIT 1)
WHERE marca_id IS NULL;

UPDATE vehiculos 
SET modelo_id = (SELECT id FROM modelos WHERE nombre = 'Santa Fe' LIMIT 1)
WHERE modelo_id IS NULL;

-- 5. VERIFICACIÓN
SELECT 
    'Relaciones de vehículos configuradas' as status,
    COUNT(*) as total_vehiculos,
    COUNT(marca_id) as vehiculos_con_marca,
    COUNT(modelo_id) as vehiculos_con_modelo
FROM vehiculos;

-- 6. MOSTRAR ESTRUCTURA DE LA TABLA
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'vehiculos' 
ORDER BY ordinal_position;

-- 7. VERIFICAR QUE LAS RELACIONES FUNCIONAN
SELECT 
    'Verificación de relaciones:' as info,
    v.placa,
    m.nombre as marca_nombre,
    mod.nombre as modelo_nombre
FROM vehiculos v
LEFT JOIN marcas m ON v.marca_id = m.id
LEFT JOIN modelos mod ON v.modelo_id = mod.id
LIMIT 5;
