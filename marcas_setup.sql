-- =====================================================
-- VÉCTOR - Configuración de Tabla de Marcas
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

-- 2. CREAR ÍNDICES PARA MARCAS
CREATE INDEX IF NOT EXISTS idx_marcas_nombre ON marcas(nombre);
CREATE INDEX IF NOT EXISTS idx_marcas_estado ON marcas(estado);
CREATE INDEX IF NOT EXISTS idx_marcas_created_at ON marcas(created_at);

-- 3. CREAR TRIGGER PARA ACTUALIZAR updated_at EN MARCAS
CREATE TRIGGER update_marcas_updated_at 
    BEFORE UPDATE ON marcas 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. CONFIGURAR POLÍTICAS DE SEGURIDAD PARA MARCAS
ALTER TABLE marcas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las operaciones en marcas" ON marcas
    FOR ALL USING (true) WITH CHECK (true);

-- 5. INSERTAR MARCAS DE EJEMPLO
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
('Ferrari', 'activo');

-- 6. VERIFICACIÓN FINAL
SELECT 
    'Configuración de marcas completada' as status,
    COUNT(*) as total_marcas,
    COUNT(*) FILTER (WHERE estado = 'activo') as activas,
    COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivas
FROM marcas;
