# 📋 Guía de Instalación - Véctor

Esta guía te ayudará a configurar la base de datos de Supabase para el sistema Véctor paso a paso.

## 🗂️ Archivos SQL Incluidos

| Archivo | Descripción | Orden de Ejecución |
|---------|-------------|-------------------|
| `01_create_table.sql` | Crear tabla principal de vehículos | 1️⃣ |
| `02_create_indexes.sql` | Crear índices para mejorar rendimiento | 2️⃣ |
| `03_create_functions.sql` | Crear funciones auxiliares | 3️⃣ |
| `04_create_triggers.sql` | Crear triggers de automatización | 4️⃣ |
| `05_create_policies.sql` | Configurar políticas de seguridad (RLS) | 5️⃣ |
| `06_sample_data.sql` | Insertar datos de ejemplo (opcional) | 6️⃣ |
| `07_verification_queries.sql` | Consultas para verificar instalación | 7️⃣ |

## 🚀 Pasos de Instalación

### Paso 1: Acceder a Supabase
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto o crea uno nuevo

### Paso 2: Abrir SQL Editor
1. En el panel izquierdo, haz clic en **"SQL Editor"**
2. Haz clic en **"New query"**

### Paso 3: Ejecutar Archivos SQL (en orden)

#### 1️⃣ Crear Tabla Principal
```sql
-- Copia y pega el contenido de: 01_create_table.sql
```
- ✅ Crea la tabla `vehiculos` con todos los campos necesarios
- ✅ Incluye comentarios descriptivos

#### 2️⃣ Crear Índices
```sql
-- Copia y pega el contenido de: 02_create_indexes.sql
```
- ✅ Mejora el rendimiento de las consultas
- ✅ Crea índices para búsquedas frecuentes

#### 3️⃣ Crear Funciones
```sql
-- Copia y pega el contenido de: 03_create_functions.sql
```
- ✅ Función para actualizar timestamps automáticamente
- ✅ Función para validar VIN
- ✅ Función para obtener estadísticas

#### 4️⃣ Crear Triggers
```sql
-- Copia y pega el contenido de: 04_create_triggers.sql
```
- ✅ Trigger para actualizar `updated_at` automáticamente
- ✅ Trigger opcional para logging de cambios

#### 5️⃣ Configurar Políticas de Seguridad
```sql
-- Copia y pega el contenido de: 05_create_policies.sql
```
- ✅ Habilita Row Level Security (RLS)
- ✅ Configura políticas permisivas para desarrollo

#### 6️⃣ Insertar Datos de Ejemplo (Opcional)
```sql
-- Copia y pega el contenido de: 06_sample_data.sql
```
- ✅ Inserta 16 vehículos de ejemplo
- ✅ Incluye diferentes marcas, modelos y estados

#### 7️⃣ Verificar Instalación
```sql
-- Copia y pega el contenido de: 07_verification_queries.sql
```
- ✅ Verifica que todo se creó correctamente
- ✅ Muestra estadísticas de la instalación

## ✅ Verificación de la Instalación

Después de ejecutar todos los archivos, deberías ver:

### En la Tabla de Vehículos:
- ✅ Tabla `vehiculos` creada con 15 columnas
- ✅ 16 vehículos de ejemplo (si ejecutaste el archivo 06)
- ✅ Índices creados para mejorar rendimiento

### En las Políticas:
- ✅ Row Level Security habilitado
- ✅ Políticas permisivas para desarrollo

### En las Funciones:
- ✅ `update_updated_at_column()` - Para timestamps automáticos
- ✅ `validate_vin()` - Para validar VIN
- ✅ `get_vehicle_stats()` - Para estadísticas

### En los Triggers:
- ✅ `update_vehiculos_updated_at` - Actualiza timestamps

## 🔧 Configuración de la Aplicación

### 1. Obtener Credenciales de Supabase
1. Ve a **Settings > API** en tu proyecto
2. Copia la **Project URL**
3. Copia la **anon public** key

### 2. Actualizar config.js
```javascript
const SUPABASE_CONFIG = {
    url: 'https://tu-proyecto.supabase.co', // ← Tu Project URL aquí
    anonKey: 'tu-clave-publica-aqui'        // ← Tu anon key aquí
};
```

### 3. Incluir Script de Supabase en HTML
Agrega esta línea antes de `config.js` en tu `index.html`:
```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
```

## 🧪 Pruebas

### Probar la Conexión
1. Abre `index.html` en tu navegador
2. Abre la consola del navegador (F12)
3. Deberías ver: "✅ Conexión con Supabase establecida"

### Probar Funcionalidades
1. ✅ Agregar un nuevo vehículo
2. ✅ Editar un vehículo existente
3. ✅ Buscar vehículos
4. ✅ Filtrar por estado
5. ✅ Eliminar un vehículo

## 🚨 Solución de Problemas

### Error: "Supabase no está inicializado"
- ✅ Verifica que incluiste el script de Supabase
- ✅ Verifica que actualizaste las credenciales en `config.js`

### Error: "Table 'vehiculos' doesn't exist"
- ✅ Ejecuta el archivo `01_create_table.sql`
- ✅ Verifica que no hay errores en la consola de Supabase

### Error: "Permission denied"
- ✅ Ejecuta el archivo `05_create_policies.sql`
- ✅ Verifica que RLS está configurado correctamente

### No se ven los datos
- ✅ Ejecuta el archivo `06_sample_data.sql`
- ✅ Verifica que la tabla tiene datos con `SELECT * FROM vehiculos;`

## 📊 Consultas Útiles

### Ver todos los vehículos:
```sql
SELECT * FROM vehiculos ORDER BY created_at DESC;
```

### Contar vehículos por estado:
```sql
SELECT estado, COUNT(*) FROM vehiculos GROUP BY estado;
```

### Ver estadísticas:
```sql
SELECT * FROM get_vehicle_stats();
```

### Buscar por placa:
```sql
SELECT * FROM vehiculos WHERE placa ILIKE '%ABC%';
```

## 🎯 Próximos Pasos

1. ✅ Configurar Supabase
2. ✅ Ejecutar archivos SQL
3. ✅ Actualizar credenciales
4. ✅ Probar la aplicación
5. 🚀 ¡Comenzar a usar Véctor!

---

**¿Necesitas ayuda?** Revisa la consola del navegador para errores específicos o consulta la documentación de [Supabase](https://supabase.com/docs).
