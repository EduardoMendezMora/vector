-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 01_create_table.sql
-- Descripción: Crear tabla principal de vehículos
-- Fecha: $(date)
-- =====================================================

-- Crear tabla de vehículos
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

-- Comentarios en la tabla
COMMENT ON TABLE vehiculos IS 'Tabla principal para almacenar información de vehículos de la flotilla';
COMMENT ON COLUMN vehiculos.id IS 'Identificador único del vehículo';
COMMENT ON COLUMN vehiculos.placa IS 'Número de placa del vehículo (único)';
COMMENT ON COLUMN vehiculos.marca IS 'Marca del vehículo';
COMMENT ON COLUMN vehiculos.modelo IS 'Modelo del vehículo';
COMMENT ON COLUMN vehiculos.año IS 'Año de fabricación del vehículo';
COMMENT ON COLUMN vehiculos.carroceria IS 'Tipo de carrocería (sedan, suv, pickup, etc.)';
COMMENT ON COLUMN vehiculos.cilindrada IS 'Cilindrada en centímetros cúbicos';
COMMENT ON COLUMN vehiculos.cilindros IS 'Número de cilindros del motor';
COMMENT ON COLUMN vehiculos.combustible IS 'Tipo de combustible (gasolina, diesel, etc.)';
COMMENT ON COLUMN vehiculos.transmision IS 'Tipo de transmisión (manual, automática, cvt)';
COMMENT ON COLUMN vehiculos.traccion IS 'Tipo de tracción (delantera, trasera, 4x4, awd)';
COMMENT ON COLUMN vehiculos.color IS 'Color del vehículo';
COMMENT ON COLUMN vehiculos.vin IS 'Número de identificación del vehículo (17 caracteres)';
COMMENT ON COLUMN vehiculos.estado IS 'Estado del vehículo (activo, inactivo, mantenimiento)';
COMMENT ON COLUMN vehiculos.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN vehiculos.updated_at IS 'Fecha y hora de última actualización del registro';
