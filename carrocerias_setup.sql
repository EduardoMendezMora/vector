-- =====================================================
-- SCRIPT DE CONFIGURACIÓN: Tabla Carrocerías
-- =====================================================
-- Este script crea la tabla carrocerias y sus objetos relacionados

-- 1. Crear secuencia para carrocerias
DROP SEQUENCE IF EXISTS carrocerias_id_seq CASCADE;
CREATE SEQUENCE carrocerias_id_seq START 1;

-- 2. Crear tabla carrocerias
DROP TABLE IF EXISTS public.carrocerias CASCADE;
CREATE TABLE public.carrocerias (
    id INTEGER NOT NULL DEFAULT nextval('carrocerias_id_seq'::regclass),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    estado VARCHAR(20) DEFAULT 'activo',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT carrocerias_pkey PRIMARY KEY (id)
);

-- 3. Crear trigger para updated_at
DROP TRIGGER IF EXISTS update_carrocerias_updated_at ON carrocerias;
CREATE TRIGGER update_carrocerias_updated_at
    BEFORE UPDATE ON carrocerias
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 4. Crear índices
CREATE INDEX IF NOT EXISTS idx_carrocerias_estado ON carrocerias(estado);
CREATE INDEX IF NOT EXISTS idx_carrocerias_nombre ON carrocerias(nombre);

-- 5. Habilitar RLS
ALTER TABLE carrocerias ENABLE ROW LEVEL SECURITY;

-- 6. Crear políticas RLS
DROP POLICY IF EXISTS "Permitir todas las operaciones en carrocerias" ON carrocerias;
CREATE POLICY "Permitir todas las operaciones en carrocerias" ON carrocerias
    FOR ALL USING (true) WITH CHECK (true);

-- 7. Insertar carrocerías específicas del usuario
INSERT INTO carrocerias (nombre, descripcion, estado) VALUES
('Todo Terreno, 4 Puertas', 'Vehículo todo terreno con 4 puertas', 'activo'),
('Sedan, 4 Puertas', 'Automóvil sedán con 4 puertas', 'activo'),
('Sedan, 4 Puertas Hatchback', 'Automóvil sedán con 4 puertas y portón trasero', 'activo'),
('Hatchback, 4 Puertas', 'Automóvil hatchback con 4 puertas', 'activo'),
('Station Wagon o Familiar', 'Vehículo familiar tipo station wagon', 'activo'),
('Microbus', 'Vehículo tipo microbús para pasajeros', 'activo'),
('Pick Up, Extra Cabina', 'Vehículo pickup con cabina extendida', 'activo')
ON CONFLICT (nombre) DO NOTHING;

-- 8. Verificar inserción
SELECT 'Carrocerías insertadas:' as estado, COUNT(*) as total FROM carrocerias;
SELECT id, nombre, estado FROM carrocerias ORDER BY id;
