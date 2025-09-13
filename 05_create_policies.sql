-- =====================================================
-- VÉCTOR - Sistema de Administración de Flotilla
-- Archivo: 05_create_policies.sql
-- Descripción: Configurar políticas de seguridad (RLS)
-- Fecha: $(date)
-- =====================================================

-- Habilitar Row Level Security en la tabla vehiculos
ALTER TABLE vehiculos ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA DESARROLLO (MÁS PERMISIVAS)
-- =====================================================

-- Política para permitir todas las operaciones (solo para desarrollo)
CREATE POLICY "Permitir todas las operaciones en vehiculos - DESARROLLO" ON vehiculos
    FOR ALL USING (true) WITH CHECK (true);

-- Comentario en la política
COMMENT ON POLICY "Permitir todas las operaciones en vehiculos - DESARROLLO" ON vehiculos IS 'Política permisiva para desarrollo - permite todas las operaciones CRUD';

-- =====================================================
-- POLÍTICAS PARA PRODUCCIÓN (MÁS SEGURAS)
-- =====================================================

-- NOTA: Para producción, comenta las políticas de desarrollo arriba
-- y descomenta las políticas de producción abajo

/*
-- Eliminar política de desarrollo
DROP POLICY IF EXISTS "Permitir todas las operaciones en vehiculos - DESARROLLO" ON vehiculos;

-- Política para lectura (SELECT)
CREATE POLICY "Permitir lectura de vehiculos" ON vehiculos
    FOR SELECT USING (true);

-- Política para inserción (INSERT)
CREATE POLICY "Permitir inserción de vehiculos" ON vehiculos
    FOR INSERT WITH CHECK (true);

-- Política para actualización (UPDATE)
CREATE POLICY "Permitir actualización de vehiculos" ON vehiculos
    FOR UPDATE USING (true) WITH CHECK (true);

-- Política para eliminación (DELETE)
CREATE POLICY "Permitir eliminación de vehiculos" ON vehiculos
    FOR DELETE USING (true);

-- Comentarios en las políticas de producción
COMMENT ON POLICY "Permitir lectura de vehiculos" ON vehiculos IS 'Permite leer todos los vehículos';
COMMENT ON POLICY "Permitir inserción de vehiculos" ON vehiculos IS 'Permite insertar nuevos vehículos';
COMMENT ON POLICY "Permitir actualización de vehiculos" ON vehiculos IS 'Permite actualizar vehículos existentes';
COMMENT ON POLICY "Permitir eliminación de vehiculos" ON vehiculos IS 'Permite eliminar vehículos';
*/

-- =====================================================
-- POLÍTICAS AVANZADAS (OPCIONAL)
-- =====================================================

-- Ejemplo de políticas más específicas basadas en roles de usuario
-- (Descomenta y adapta según tus necesidades)

/*
-- Política para usuarios autenticados
CREATE POLICY "Solo usuarios autenticados pueden ver vehiculos" ON vehiculos
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para administradores
CREATE POLICY "Solo administradores pueden modificar vehiculos" ON vehiculos
    FOR ALL USING (
        auth.jwt() ->> 'role' = 'admin' OR 
        auth.jwt() ->> 'role' = 'super_admin'
    );

-- Política para usuarios específicos
CREATE POLICY "Usuarios pueden ver solo sus vehiculos asignados" ON vehiculos
    FOR SELECT USING (
        auth.uid()::text = ANY(
            SELECT unnest(string_to_array(assigned_users, ','))
            FROM vehiculos 
            WHERE id = vehiculos.id
        )
    );
*/
