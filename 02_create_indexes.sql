-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 02_create_indexes.sql
-- Descripción: Crear índices para mejorar el rendimiento
-- Fecha: $(date)
-- =====================================================

-- Crear índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca ON vehiculos(marca);
CREATE INDEX IF NOT EXISTS idx_vehiculos_modelo ON vehiculos(modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_año ON vehiculos(año);
CREATE INDEX IF NOT EXISTS idx_vehiculos_created_at ON vehiculos(created_at);
CREATE INDEX IF NOT EXISTS idx_vehiculos_updated_at ON vehiculos(updated_at);

-- Índice compuesto para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca_modelo ON vehiculos(marca, modelo);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado_created ON vehiculos(estado, created_at);

-- Comentarios en los índices
COMMENT ON INDEX idx_vehiculos_placa IS 'Índice para búsquedas rápidas por placa';
COMMENT ON INDEX idx_vehiculos_estado IS 'Índice para filtrar por estado del vehículo';
COMMENT ON INDEX idx_vehiculos_marca IS 'Índice para búsquedas por marca';
COMMENT ON INDEX idx_vehiculos_modelo IS 'Índice para búsquedas por modelo';
COMMENT ON INDEX idx_vehiculos_año IS 'Índice para filtros por año';
COMMENT ON INDEX idx_vehiculos_created_at IS 'Índice para ordenar por fecha de creación';
COMMENT ON INDEX idx_vehiculos_updated_at IS 'Índice para ordenar por fecha de actualización';
COMMENT ON INDEX idx_vehiculos_marca_modelo IS 'Índice compuesto para búsquedas por marca y modelo';
COMMENT ON INDEX idx_vehiculos_estado_created IS 'Índice compuesto para filtrar por estado y fecha';
