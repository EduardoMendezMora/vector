# Véctor - Sistema de Administración de Flotilla

Véctor es un sistema web moderno para la administración de flotillas vehiculares, desarrollado con HTML, CSS, JavaScript y Supabase como base de datos.

## 🚀 Características

- **Interfaz Moderna**: Diseño responsivo con menú lateral colapsable
- **Gestión de Vehículos**: CRUD completo para administrar vehículos
- **Base de Datos en la Nube**: Utiliza Supabase para almacenamiento seguro
- **Búsqueda y Filtros**: Funcionalidades avanzadas de búsqueda
- **Notificaciones**: Sistema de notificaciones toast para feedback del usuario
- **Responsive**: Compatible con dispositivos móviles y desktop

## 📋 Campos del Vehículo

El sistema maneja los siguientes campos para cada vehículo:

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| Placa | Texto | ✅ | Número de placa del vehículo (máx. 10 caracteres) |
| Marca | Texto | ✅ | Marca del vehículo |
| Modelo | Texto | ✅ | Modelo del vehículo |
| Año | Número | ✅ | Año de fabricación (1900-2030) |
| Carrocería | Select | ❌ | Tipo de carrocería (Sedán, SUV, Pickup, etc.) |
| Cilindrada | Número | ❌ | Cilindrada en centímetros cúbicos |
| Cilindros | Select | ❌ | Número de cilindros (3, 4, 6, 8, 12) |
| Combustible | Select | ❌ | Tipo de combustible |
| Transmisión | Select | ❌ | Tipo de transmisión |
| Tracción | Select | ❌ | Tipo de tracción |
| Color | Texto | ❌ | Color del vehículo |
| VIN | Texto | ❌ | Número de identificación del vehículo (17 caracteres) |

## 🛠️ Instalación y Configuración

### Prerrequisitos

- Navegador web moderno
- Cuenta en [Supabase](https://supabase.com)

### 1. Configurar Supabase

1. **Crear Proyecto**:
   - Ve a [supabase.com](https://supabase.com)
   - Crea una cuenta o inicia sesión
   - Crea un nuevo proyecto
   - Espera a que se complete la configuración

2. **Obtener Credenciales**:
   - En tu proyecto de Supabase, ve a `Settings > API`
   - Copia la "Project URL" y la "anon public" key

3. **Configurar la Aplicación**:
   - Abre el archivo `config.js`
   - Reemplaza las credenciales de ejemplo con las tuyas:
   ```javascript
   const SUPABASE_CONFIG = {
       url: 'https://tu-proyecto.supabase.co',
       anonKey: 'tu-clave-publica-aqui'
   };
   ```

### 2. Crear la Base de Datos

1. **Ejecutar SQL**:
   - Ve a `SQL Editor` en tu proyecto de Supabase
   - Ejecuta el siguiente SQL para crear la tabla:

```sql
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

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_vehiculos_placa ON vehiculos(placa);
CREATE INDEX IF NOT EXISTS idx_vehiculos_estado ON vehiculos(estado);
CREATE INDEX IF NOT EXISTS idx_vehiculos_marca ON vehiculos(marca);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_vehiculos_updated_at 
    BEFORE UPDATE ON vehiculos 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
```

2. **Configurar Políticas de Seguridad (RLS)**:
   - Ve a `Authentication > Policies`
   - Crea políticas para permitir operaciones CRUD en la tabla `vehiculos`

### 3. Incluir Script de Supabase

Agrega este script antes de `config.js` en tu archivo `index.html`:

```html
<script src="https://unpkg.com/@supabase/supabase-js@2"></script>
```

### 4. Ejecutar la Aplicación

1. Abre el archivo `index.html` en tu navegador
2. La aplicación se conectará automáticamente a Supabase
3. ¡Comienza a agregar vehículos a tu flotilla!

## 📱 Uso de la Aplicación

### Navegación

- **Menú Lateral**: Contiene los módulos principales (Vehículos, Mantenimiento, Conductores, Reportes)
- **Botón de Colapso**: Permite ocultar/mostrar el menú lateral
- **Responsive**: En dispositivos móviles, el menú se convierte en un drawer

### Gestión de Vehículos

1. **Agregar Vehículo**:
   - Haz clic en "Agregar Vehículo"
   - Completa el formulario (campos marcados con * son obligatorios)
   - Haz clic en "Guardar Vehículo"

2. **Editar Vehículo**:
   - Haz clic en el ícono de editar (lápiz) en la tabla
   - Modifica los campos necesarios
   - Guarda los cambios

3. **Eliminar Vehículo**:
   - Haz clic en el ícono de eliminar (basura) en la tabla
   - Confirma la eliminación en el modal

4. **Buscar Vehículos**:
   - Usa el campo de búsqueda en la parte superior
   - Busca por placa, marca, modelo, color o VIN

5. **Filtrar por Estado**:
   - Usa el selector de filtros para mostrar solo vehículos activos o inactivos

## 🎨 Personalización

### Colores y Estilos

Los estilos están definidos en `styles.css`. Puedes personalizar:

- Colores del tema en las variables CSS
- Tamaños de fuente y espaciado
- Animaciones y transiciones
- Diseño responsive

### Funcionalidades Adicionales

Para agregar nuevos módulos:

1. Agrega el enlace en el menú lateral (`index.html`)
2. Implementa la funcionalidad en `script.js`
3. Agrega estilos específicos en `styles.css`

## 🔧 Estructura del Proyecto

```
véctor/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── config.js           # Configuración de Supabase
└── README.md           # Documentación
```

## 🐛 Solución de Problemas

### Error de Conexión con Supabase

1. Verifica que las credenciales en `config.js` sean correctas
2. Asegúrate de que el script de Supabase esté incluido
3. Revisa la consola del navegador para errores específicos

### Error al Crear/Eliminar Vehículos

1. Verifica que la tabla `vehiculos` exista en Supabase
2. Revisa las políticas de seguridad (RLS)
3. Asegúrate de que los campos requeridos estén completos

### Problemas de Responsive

1. Verifica que el viewport esté configurado correctamente
2. Revisa los media queries en `styles.css`
3. Prueba en diferentes dispositivos

## 📞 Soporte

Si encuentras algún problema o tienes sugerencias:

1. Revisa la consola del navegador para errores
2. Verifica la configuración de Supabase
3. Consulta la documentación de [Supabase](https://supabase.com/docs)

## 🚀 Próximas Características

- Módulo de Mantenimiento
- Módulo de Conductores
- Módulo de Reportes
- Exportación de datos
- Importación masiva de vehículos
- Dashboard con estadísticas
- Notificaciones por email
- API REST para integraciones

## 📄 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

---

**Véctor** - Administra tu flotilla de manera eficiente y moderna. 🚗✨
