# 🚀 Guía de Despliegue - Véctor

## ✅ **Configuración Completada**

Tu aplicación Véctor está lista para desplegar. Aquí tienes todo lo que necesitas:

### **🔑 Credenciales Configuradas**
- **URL del Proyecto**: `https://kltdltqaxhbrxyqvcbxd.supabase.co`
- **Anon Key**: Configurada en `config.js`
- **Service Role Key**: Disponible para uso avanzado

### **📁 Archivos Listos**
- ✅ `index.html` - Aplicación principal
- ✅ `styles.css` - Estilos modernos
- ✅ `script.js` - Lógica de la aplicación
- ✅ `config.js` - Credenciales de Supabase configuradas
- ✅ `supabase_setup.sql` - SQL completo para configurar la base de datos

## 🗄️ **Configurar Base de Datos**

### **Paso 1: Ejecutar SQL en Supabase**
1. Ve a tu proyecto: https://kltdltqaxhbrxyqvcbxd.supabase.co
2. Haz clic en **SQL Editor** en el panel izquierdo
3. Haz clic en **New query**
4. Copia y pega todo el contenido de `supabase_setup.sql`
5. Haz clic en **Run** (o presiona Ctrl+Enter)

### **Paso 2: Verificar Instalación**
Después de ejecutar el SQL, deberías ver:
- ✅ Tabla `vehiculos` creada
- ✅ 17 vehículos de ejemplo insertados
- ✅ Índices y funciones creadas
- ✅ Políticas de seguridad configuradas

## 🌐 **Opciones de Despliegue**

### **Opción 1: Despliegue Local (Recomendado para pruebas)**
1. **Abrir la aplicación**:
   - Abre `index.html` en tu navegador
   - Deberías ver la aplicación funcionando

2. **Verificar conexión**:
   - Abre la consola del navegador (F12)
   - Deberías ver: "✅ Conexión con Supabase establecida"

### **Opción 2: Despliegue en GitHub Pages (Gratis)**
1. **Crear repositorio en GitHub**:
   - Ve a [github.com](https://github.com)
   - Crea un nuevo repositorio llamado `vector-flotilla`

2. **Subir archivos**:
   - Sube todos los archivos del proyecto
   - NO incluyas `supabase_setup.sql` (es solo para configuración)

3. **Activar GitHub Pages**:
   - Ve a Settings > Pages
   - Selecciona "Deploy from a branch"
   - Elige "main" branch
   - Tu app estará disponible en: `https://tu-usuario.github.io/vector-flotilla`

### **Opción 3: Despliegue en Netlify (Gratis)**
1. **Crear cuenta en Netlify**:
   - Ve a [netlify.com](https://netlify.com)
   - Regístrate con GitHub

2. **Desplegar**:
   - Arrastra la carpeta del proyecto a Netlify
   - O conecta tu repositorio de GitHub
   - Tu app estará disponible en una URL personalizada

### **Opción 4: Despliegue en Vercel (Gratis)**
1. **Crear cuenta en Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Regístrate con GitHub

2. **Desplegar**:
   - Conecta tu repositorio
   - Vercel detectará automáticamente que es un sitio estático
   - Tu app estará disponible en una URL personalizada

## 🧪 **Pruebas de Funcionalidad**

### **Probar CRUD de Vehículos**
1. ✅ **Agregar vehículo**:
   - Haz clic en "Agregar Vehículo"
   - Completa el formulario
   - Verifica que se guarde correctamente

2. ✅ **Editar vehículo**:
   - Haz clic en el ícono de editar (lápiz)
   - Modifica algún campo
   - Guarda los cambios

3. ✅ **Buscar vehículos**:
   - Usa el campo de búsqueda
   - Busca por placa, marca, modelo, etc.

4. ✅ **Filtrar por estado**:
   - Usa el selector de filtros
   - Verifica que filtre correctamente

5. ✅ **Eliminar vehículo**:
   - Haz clic en el ícono de eliminar (basura)
   - Confirma la eliminación

### **Probar Responsive Design**
1. ✅ **Desktop**: Verifica que se vea bien en pantallas grandes
2. ✅ **Tablet**: Prueba en tamaño tablet
3. ✅ **Móvil**: Verifica que el menú lateral funcione en móvil

## 🔧 **Configuración Avanzada**

### **Variables de Entorno (Opcional)**
Si quieres usar variables de entorno para mayor seguridad:

```javascript
// En config.js
const SUPABASE_CONFIG = {
    url: process.env.VITE_SUPABASE_URL || 'https://kltdltqaxhbrxyqvcbxd.supabase.co',
    anonKey: process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
};
```

### **Dominio Personalizado**
1. **Comprar dominio** en cualquier proveedor
2. **Configurar DNS** para apuntar a tu servicio de hosting
3. **Configurar SSL** (automático en la mayoría de servicios)

## 📊 **Monitoreo y Mantenimiento**

### **Verificar Estado de Supabase**
- Ve a tu dashboard de Supabase
- Monitorea el uso de la base de datos
- Revisa los logs de errores

### **Backup de Datos**
- Supabase hace backups automáticos
- Puedes exportar datos manualmente desde el dashboard

### **Actualizaciones**
- Mantén actualizado el script de Supabase
- Revisa las actualizaciones de la librería

## 🚨 **Solución de Problemas**

### **Error de Conexión**
- ✅ Verifica que las credenciales estén correctas
- ✅ Verifica que el script de Supabase esté incluido
- ✅ Revisa la consola del navegador

### **Error de Permisos**
- ✅ Verifica que ejecutaste el SQL de configuración
- ✅ Revisa las políticas RLS en Supabase

### **Error de CORS**
- ✅ Verifica que tu dominio esté en la lista de dominios permitidos en Supabase

## 🎯 **Próximos Pasos**

1. ✅ **Configurar base de datos** (ejecutar SQL)
2. ✅ **Probar localmente** (abrir index.html)
3. ✅ **Desplegar** (elegir opción de hosting)
4. ✅ **Configurar dominio** (opcional)
5. ✅ **Monitorear** (revisar logs y métricas)

## 📞 **Soporte**

- **Documentación de Supabase**: [supabase.com/docs](https://supabase.com/docs)
- **GitHub Issues**: Para reportar bugs
- **Consola del navegador**: Para errores específicos

---

**¡Tu aplicación Véctor está lista para desplegar! 🚗✨**

**URL de tu proyecto Supabase**: https://kltdltqaxhbrxyqvcbxd.supabase.co
