-- =====================================================
-- VÉCTOR - Configuración de Tabla de Modelos
-- Proyecto: kltdltqaxhbrxyqvcbxd
-- Fecha: $(date)
-- =====================================================

-- 1. CREAR TABLA DE MODELOS
CREATE TABLE IF NOT EXISTS modelos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nombre, marca_id)
);

-- 2. CREAR ÍNDICES PARA MODELOS
CREATE INDEX IF NOT EXISTS idx_modelos_nombre ON modelos(nombre);
CREATE INDEX IF NOT EXISTS idx_modelos_marca_id ON modelos(marca_id);
CREATE INDEX IF NOT EXISTS idx_modelos_estado ON modelos(estado);
CREATE INDEX IF NOT EXISTS idx_modelos_created_at ON modelos(created_at);

-- 3. CREAR TRIGGER PARA ACTUALIZAR updated_at EN MODELOS
DROP TRIGGER IF EXISTS update_modelos_updated_at ON modelos;
CREATE TRIGGER update_modelos_updated_at 
    BEFORE UPDATE ON modelos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. CONFIGURAR POLÍTICAS DE SEGURIDAD PARA MODELOS
ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir todas las operaciones en modelos" ON modelos;
CREATE POLICY "Permitir todas las operaciones en modelos" ON modelos
    FOR ALL USING (true) WITH CHECK (true);

-- 5. INSERTAR MODELOS DE EJEMPLO (Solo Hyundai)
INSERT INTO modelos (nombre, marca_id, estado) VALUES
-- Hyundai (ID 10 según marcas_setup.sql)
('Santa Fe', 10, 'activo'),
('Tucson', 10, 'activo'),
('Avante', 10, 'activo')
ON CONFLICT (nombre, marca_id) DO NOTHING;

-- 6. VERIFICACIÓN FINAL
SELECT 
    'Configuración de modelos completada' as status,
    COUNT(*) as total_modelos,
    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
    COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivos,
    COUNT(DISTINCT marca_id) as marcas_con_modelos
FROM modelos;

-- Verificar modelos de Hyundai
SELECT 
    m.nombre as modelo,
    ma.nombre as marca,
    m.estado
FROM modelos m
JOIN marcas ma ON m.marca_id = ma.id
WHERE ma.nombre = 'Hyundai'
ORDER BY m.nombre;
