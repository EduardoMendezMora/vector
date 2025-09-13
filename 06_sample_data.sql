-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 06_sample_data.sql
-- Descripción: Insertar datos de ejemplo para pruebas
-- Fecha: $(date)
-- =====================================================

-- Insertar vehículos de ejemplo para pruebas
INSERT INTO vehiculos (placa, marca, modelo, año, carroceria, cilindrada, cilindros, combustible, transmision, traccion, color, vin, estado) VALUES

-- Vehículos de pasajeros
('ABC-123', 'Toyota', 'Corolla', 2022, 'sedan', 1800, 4, 'gasolina', 'automatica', 'delantera', 'Blanco', '1HGBH41JXMN109186', 'activo'),
('XYZ-789', 'Honda', 'Civic', 2023, 'sedan', 1600, 4, 'gasolina', 'manual', 'delantera', 'Azul', '2HGFC2F59NH543210', 'activo'),
('DEF-456', 'Nissan', 'Sentra', 2021, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Negro', '1N4AL3AP8JC123456', 'activo'),

-- Vehículos comerciales
('GHI-789', 'Ford', 'F-150', 2021, 'pickup', 3500, 6, 'gasolina', 'automatica', '4x4', 'Negro', '1FTFW1ET5DFC12345', 'activo'),
('JKL-012', 'Chevrolet', 'Silverado', 2022, 'pickup', 5300, 8, 'gasolina', 'automatica', '4x4', 'Rojo', '1GCUYDED2NZ123456', 'activo'),
('MNO-345', 'Ram', '1500', 2023, 'pickup', 3600, 6, 'gasolina', 'automatica', '4x4', 'Blanco', '1C6RR7GT5MS123456', 'activo'),

-- Vehículos SUV
('PQR-678', 'Toyota', 'RAV4', 2022, 'suv', 2500, 4, 'gasolina', 'automatica', 'awd', 'Gris', '2T3BFREV5MW123456', 'activo'),
('STU-901', 'Honda', 'CR-V', 2023, 'suv', 1900, 4, 'gasolina', 'automatica', 'awd', 'Plata', '2HKRW2H58NH123456', 'activo'),
('VWX-234', 'Nissan', 'Rogue', 2021, 'suv', 2500, 4, 'gasolina', 'automatica', 'awd', 'Azul', '1N4BL3AP8MN123456', 'activo'),

-- Vehículos de carga
('YZA-567', 'Ford', 'Transit', 2022, 'van', 2000, 4, 'diesel', 'manual', 'trasera', 'Blanco', '1FTBR2CM5NKA12345', 'activo'),
('BCD-890', 'Mercedes', 'Sprinter', 2023, 'van', 2200, 4, 'diesel', 'automatica', 'trasera', 'Gris', 'WDB9066321LA12345', 'activo'),

-- Vehículos híbridos/eléctricos
('EFG-123', 'Toyota', 'Prius', 2022, 'sedan', 1800, 4, 'hibrido', 'cvt', 'delantera', 'Verde', 'JTDKARFP2N3123456', 'activo'),
('HIJ-456', 'Tesla', 'Model 3', 2023, 'sedan', 0, 0, 'electrico', 'automatica', 'trasera', 'Negro', '5YJ3E1EA4PF123456', 'activo'),

-- Vehículos en mantenimiento
('KLM-789', 'BMW', 'X5', 2021, 'suv', 3000, 6, 'gasolina', 'automatica', 'awd', 'Negro', '5UXCR6C05M9A12345', 'mantenimiento'),
('NOP-012', 'Audi', 'A4', 2022, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Blanco', 'WAUAF48H27K123456', 'mantenimiento'),

-- Vehículos inactivos
('QRS-345', 'Volkswagen', 'Jetta', 2020, 'sedan', 2000, 4, 'gasolina', 'manual', 'delantera', 'Rojo', '3VW2A7AJ5LM123456', 'inactivo'),
('TUV-678', 'Hyundai', 'Elantra', 2019, 'sedan', 2000, 4, 'gasolina', 'automatica', 'delantera', 'Plata', '5NPE34AF2KH123456', 'inactivo');

-- Verificar que los datos se insertaron correctamente
SELECT 
    COUNT(*) as total_vehiculos,
    COUNT(*) FILTER (WHERE estado = 'activo') as activos,
    COUNT(*) FILTER (WHERE estado = 'inactivo') as inactivos,
    COUNT(*) FILTER (WHERE estado = 'mantenimiento') as en_mantenimiento
FROM vehiculos;

-- Mostrar resumen por marca
SELECT 
    marca,
    COUNT(*) as cantidad,
    COUNT(*) FILTER (WHERE estado = 'activo') as activos
FROM vehiculos 
GROUP BY marca 
ORDER BY cantidad DESC;
