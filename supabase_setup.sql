-- =====================================================
-- VÉCTOR - Configuración Completa de Supabase
-- Proyecto: kltdltqaxhbrxyqvcbxd
-- Fecha: $(date)
-- =====================================================

-- 1. CREAR TABLA PRINCIPAL
CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
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

-- 2. CREAR ÍNDICES
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca ON vehiculos(marca);
CREATE INDEX IF NOT EXISTS idx_vehiculos_modelo ON vehiculos(modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_año ON vehiculos(año);
CREATE INDEX IF NOT EXISTS idx_vehiculos_created_at ON vehiculos(created_at);
CREATE INDEX IF NOT EXISTS idx_vehiculos_updated_at ON vehiculos(updated_at);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca_modelo ON vehiculos(marca, modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado_created ON vehiculos(estado, created_at);

-- 3. CREAR FUNCIONES
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION validate_vin(vin_text TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    IF vin_text IS NULL OR vin_text = '' THEN
        RETURN TRUE;
    END IF;
    
    IF LENGTH(vin_text) != 17 THEN
        RETURN FALSE;
    END IF;
    
    IF vin_text ~ '^[A-HJ-NPR-Z0-9]{17}$' THEN
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ language 'plpgsql';

CREATE OR REPLACE FUNCTION get_vehicle_stats()
RETURNS TABLE (
    total_vehicles BIGINT,
    active_vehicles BIGINT,
    inactive_vehicles BIGINT,
    maintenance_vehicles BIGINT,
    brands_count BIGINT,
    models_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_vehicles,
        COUNT(*) FILTER (WHERE estado = 'activo') as active_vehicles,
        COUNT(*) FILTER (WHERE estado = 'inactivo') as inactive_vehicles,
        COUNT(*) FILTER (WHERE estado = 'mantenimiento') as maintenance_vehicles,
        COUNT(DISTINCT marca) as brands_count,
        COUNT(DISTINCT modelo) as models_count
    FROM vehiculos;
END;
$$ language 'plpgsql';

-- 4. CREAR TRIGGERS
CREATE TRIGGER update_vehiculos_updated_at 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 5. CONFIGURAR POLÍTICAS DE SEGURIDAD
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Permitir todas las operaciones en vehiculos" ON vehiculos
    FOR ALL USING (true) WITH CHECK (true);

-- 6. INSERTAR DATOS DE EJEMPLO
INSERT INTO vehiculos (placa, marca, modelo, año, carroceria, cilindrada, cilindros, combustible, transmision, traccion, color, vin, estado) VALUES
('ABC-123', 'Toyota', 'Corolla', 2022, 'sedan', 1800, 4, 'gasolina', 'automatica', 'delantera', 'Blanco', '1HGBH41JXMN109186', 'activo'),
('XYZ-789', 'Honda', 'Civic', 2023, 'sedan', 1600, 4, 'gasolina', 'manual', 'delantera', 'Azul', '2HGFC2F59NH543210', 'activo'),
('DEF-456', 'Nissan', 'Sentra', 2021, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Negro', '1N4AL3AP8JC123456', 'activo'),
('GHI-789', 'Ford', 'F-150', 2021, 'pickup', 3500, 6, 'gasolina', 'automatica', '4x4', 'Negro', '1FTFW1ET5DFC12345', 'activo'),
('JKL-012', 'Chevrolet', 'Silverado', 2022, 'pickup', 5300, 8, 'gasolina', 'automatica', '4x4', 'Rojo', '1GCUYDED2NZ123456', 'activo'),
('MNO-345', 'Ram', '1500', 2023, 'pickup', 3600, 6, 'gasolina', 'automatica', '4x4', 'Blanco', '1C6RR7GT5MS123456', 'activo'),
('PQR-678', 'Toyota', 'RAV4', 2022, 'suv', 2500, 4, 'gasolina', 'automatica', 'awd', 'Gris', '2T3BFREV5MW123456', 'activo'),
('STU-901', 'Honda', 'CR-V', 2023, 'suv', 1900, 4, 'gasolina', 'automatica', 'awd', 'Plata', '2HKRW2H58NH123456', 'activo'),
('VWX-234', 'Nissan', 'Rogue', 2021, 'suv', 2500, 4, 'gasolina', 'automatica', 'awd', 'Azul', '1N4BL3AP8MN123456', 'activo'),
('YZA-567', 'Ford', 'Transit', 2022, 'van', 2000, 4, 'diesel', 'manual', 'trasera', 'Blanco', '1FTBR2CM5NKA12345', 'activo'),
('BCD-890', 'Mercedes', 'Sprinter', 2023, 'van', 2200, 4, 'diesel', 'automatica', 'trasera', 'Gris', 'WDB9066321LA12345', 'activo'),
('EFG-123', 'Toyota', 'Prius', 2022, 'sedan', 1800, 4, 'hibrido', 'cvt', 'delantera', 'Verde', 'JTDKARFP2N3123456', 'activo'),
('HIJ-456', 'Tesla', 'Model 3', 2023, 'sedan', 0, 0, 'electrico', 'automatica', 'trasera', 'Negro', '5YJ3E1EA4PF123456', 'activo'),
('KLM-789', 'BMW', 'X5', 2021, 'suv', 3000, 6, 'gasolina', 'automatica', 'awd', 'Negro', '5UXCR6C05M9A12345', 'mantenimiento'),
('NOP-012', 'Audi', 'A4', 2022, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Blanco', 'WAUAF48H27K123456', 'mantenimiento'),
('QRS-345', 'Volkswagen', 'Jetta', 2020, 'sedan', 2000, 4, 'gasolina', 'manual', 'delantera', 'Rojo', '3VW2A7AJ5LM123456', 'inactivo'),
('TUV-678', 'Hyundai', 'Elantra', 2019, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Plata', '5NPE34AF2KH123456', 'inactivo');

-- 7. VERIFICACIÓN FINAL
SELECT 
    'Configuración completada' as status,
    COUNT(*) as total_vehiculos,
    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
    COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivos,
    COUNT(*) FILTER (WHERE estado = 'mantenimiento') as en_mantenimiento
FROM vehiculos;
