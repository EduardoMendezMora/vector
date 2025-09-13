-- =====================================================
-- VÉCTOR - SETUP COMPLETO DEL SISTEMA
-- Proyecto: kltdltqaxhbrxyqvcbxd
-- Fecha: $(date)
-- =====================================================

-- 1. CREAR TABLA DE MARCAS
CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) UNIQUE NOT NULL,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. CREAR TABLA DE MODELOS
CREATE TABLE IF NOT EXISTS modelos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    marca_id INTEGER NOT NULL REFERENCES marcas(id) ON DELETE CASCADE,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(nombre, marca_id)
);

-- 3. CREAR TABLA DE VEHÍCULOS (ACTUALIZADA)
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca_id INTEGER REFERENCES marcas(id) ON DELETE SET NULL,
    modelo_id INTEGER REFERENCES modelos(id) ON DELETE SET NULL,
    año INTEGER NOT NULL,
    carroceria VARCHAR(50),
    cilindrada INTEGER,
    cilindros INTEGER,
    combustible VARCHAR(20),
    transmision VARCHAR(20),
    traccion VARCHAR(20),
    color VARCHAR(30),
    vin VARCHAR(17),
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. CREAR ÍNDICES
-- Índices para marcas
CREATE INDEX IF NOT EXISTS idx_marcas_nombre ON marcas(nombre);
CREATE INDEX IF NOT EXISTS idx_marcas_estado ON marcas(estado);
CREATE INDEX IF NOT EXISTS idx_marcas_created_at ON marcas(created_at);

-- Índices para modelos
CREATE INDEX IF NOT EXISTS idx_modelos_nombre ON modelos(nombre);
CREATE INDEX IF NOT EXISTS idx_modelos_marca_id ON modelos(marca_id);
CREATE INDEX IF NOT EXISTS idx_modelos_estado ON modelos(estado);
CREATE INDEX IF NOT EXISTS idx_modelos_created_at ON modelos(created_at);

-- Índices para vehículos
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca_id ON vehiculos(marca_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_modelo_id ON vehiculos(modelo_id);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_año ON vehiculos(año);
CREATE INDEX IF NOT EXISTS idx_vehiculos_created_at ON vehiculos(created_at);

-- 5. CREAR FUNCIONES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. CREAR TRIGGERS
-- Triggers para marcas
DROP TRIGGER IF EXISTS update_marcas_updated_at ON marcas;
CREATE TRIGGER update_marcas_updated_at 
    BEFORE UPDATE ON marcas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para modelos
DROP TRIGGER IF EXISTS update_modelos_updated_at ON modelos;
CREATE TRIGGER update_modelos_updated_at 
    BEFORE UPDATE ON modelos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Triggers para vehículos
DROP TRIGGER IF EXISTS update_vehiculos_updated_at ON vehiculos;
CREATE TRIGGER update_vehiculos_updated_at 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 7. CONFIGURAR POLÍTICAS DE SEGURIDAD (RLS)
-- Políticas para marcas
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en marcas" ON marcas;
CREATE POLICY "Permitir todas las operaciones en marcas" ON marcas
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para modelos
ALTER TABLE modelos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en modelos" ON modelos;
CREATE POLICY "Permitir todas las operaciones en modelos" ON modelos
    FOR ALL USING (true) WITH CHECK (true);

-- Políticas para vehículos
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir todas las operaciones en vehiculos" ON vehiculos;
CREATE POLICY "Permitir todas las operaciones en vehiculos" ON vehiculos
    FOR ALL USING (true) WITH CHECK (true);

-- 8. INSERTAR MARCAS DE EJEMPLO
INSERT INTO marcas (nombre, estado) VALUES
('Toyota', 'activo'),
('Honda', 'activo'),
('Nissan', 'activo'),
('Ford', 'activo'),
('Chevrolet', 'activo'),
('BMW', 'activo'),
('Mercedes-Benz', 'activo'),
('Audi', 'activo'),
('Volkswagen', 'activo'),
('Hyundai', 'activo'),
('Kia', 'activo'),
('Tesla', 'activo'),
('Ram', 'activo'),
('Mazda', 'activo'),
('Subaru', 'activo'),
('Volvo', 'activo'),
('Jaguar', 'activo'),
('Land Rover', 'activo'),
('Porsche', 'activo'),
('Ferrari', 'activo')
ON CONFLICT (nombre) DO NOTHING;

-- 9. INSERTAR MODELOS DE EJEMPLO (Solo Hyundai)
INSERT INTO modelos (nombre, marca_id, estado) VALUES
('Santa Fe', (SELECT id FROM marcas WHERE nombre = 'Hyundai' LIMIT 1), 'activo'),
('Tucson', (SELECT id FROM marcas WHERE nombre = 'Hyundai' LIMIT 1), 'activo'),
('Avante', (SELECT id FROM marcas WHERE nombre = 'Hyundai' LIMIT 1), 'activo')
ON CONFLICT (nombre, marca_id) DO NOTHING;

-- 10. MIGRAR VEHÍCULOS EXISTENTES (si los hay)
-- Primero, agregar columnas si no existen
ALTER TABLE vehiculos 
ADD COLUMN IF NOT EXISTS marca_id INTEGER,
ADD COLUMN IF NOT EXISTS modelo_id INTEGER;

-- Asignar Hyundai por defecto a vehículos existentes
UPDATE vehiculos 
SET marca_id = (SELECT id FROM marcas WHERE nombre = 'Hyundai' LIMIT 1)
WHERE marca_id IS NULL;

UPDATE vehiculos 
SET modelo_id = (SELECT id FROM modelos WHERE nombre = 'Santa Fe' LIMIT 1)
WHERE modelo_id IS NULL;

-- 11. VERIFICACIÓN FINAL
SELECT 
    'Configuración completa del sistema' as status,
    (SELECT COUNT(*) FROM marcas) as total_marcas,
    (SELECT COUNT(*) FROM modelos) as total_modelos,
    (SELECT COUNT(*) FROM vehiculos) as total_vehiculos,
    (SELECT COUNT(*) FROM vehiculos WHERE marca_id IS NOT NULL) as vehiculos_con_marca,
    (SELECT COUNT(*) FROM vehiculos WHERE modelo_id IS NOT NULL) as vehiculos_con_modelo;

-- 12. VERIFICAR RELACIONES
SELECT 
    'Verificación de relaciones:' as info,
    v.placa,
    m.nombre as marca_nombre,
    mod.nombre as modelo_nombre
FROM vehiculos v
LEFT JOIN marcas m ON v.marca_id = m.id
LEFT JOIN modelos mod ON v.modelo_id = mod.id
LIMIT 5;
