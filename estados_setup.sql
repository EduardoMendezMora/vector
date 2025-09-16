-- =====================================================
-- SCRIPT DE CONFIGURACIÓN: Tabla Estados de Vehículos
-- =====================================================
-- Este script crea la tabla estados y sus objetos relacionados

-- 1. Crear secuencia para estados
DROP SEQUENCE IF EXISTS estados_id_seq CASCADE;
CREATE SEQUENCE estados_id_seq START 1;

-- 2. Crear tabla estados
DROP TABLE IF EXISTS public.estados CASCADE;
CREATE TABLE public.estados (
    id INTEGER NOT NULL DEFAULT nextval('estados_id_seq'::regclass),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    color VARCHAR(20) DEFAULT 'primary',
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT estados_pkey PRIMARY KEY (id)
);

-- 3. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_estados_updated_at ON estados;
CREATE TRIGGER update_estados_updated_at
    BEFORE UPDATE ON estados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_estados_activo ON estados(activo);
CREATE INDEX IF NOT EXISTS idx_estados_nombre ON estados(nombre);

-- 5. Habilitar RLS
ALTER TABLE estados ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS
DROP POLICY IF EXISTS "Permitir todas las operaciones en estados" ON estados;
CREATE POLICY "Permitir todas las operaciones en estados" ON estados
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Insertar estados predefinidos
INSERT INTO estados (nombre, descripcion, color, activo) VALUES
('Activo', 'Vehículo en servicio activo', 'success', true),
('En Mantenimiento', 'Vehículo en proceso de mantenimiento', 'warning', true),
('Fuera de Servicio', 'Vehículo temporalmente fuera de servicio', 'danger', true),
('En Reparación', 'Vehículo en taller para reparaciones', 'info', true),
('Disponible', 'Vehículo disponible para asignación', 'primary', true),
('Reservado', 'Vehículo reservado para uso específico', 'secondary', true),
('Inactivo', 'Vehículo dado de baja', 'dark', true)
ON CONFLICT (nombre) DO NOTHING;

-- 8. Verificar inserción
SELECT 'Estados insertados:' as estado, COUNT(*) as total FROM estados;
SELECT id, nombre, descripcion, color, activo FROM estados ORDER BY id;
