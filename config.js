// Supabase Configuration
// IMPORTANTE: Reemplaza estas variables con tus propias credenciales de Supabase

const SUPABASE_CONFIG = {
    // URL de tu proyecto Supabase
    url: 'https://kltdltqaxhbrxyqvcbxd.supabase.co',
    
    // Clave pública (anon key) de tu proyecto Supabase
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtsdGRsdHFheGhicnh5cXZjYnhkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3MjE3ODUsImV4cCI6MjA3MzI5Nzc4NX0.CwiAYs1ndwm1D0KkDNGKxUj24_rQ59iMjuWv20jE3Hw'
};

// Configuración de la aplicación
const APP_CONFIG = {
    name: 'Véctor',
    version: '1.0.0',
    description: 'Sistema de Administración de Flotilla',
    
    // Configuración de la base de datos
    database: {
        tables: {
            vehicles: 'vehiculos'
        }
    },
    
    // Configuración de la interfaz
    ui: {
        itemsPerPage: 10,
        searchDebounceTime: 300,
        toastDuration: 5000
    }
};

// Inicialización de Supabase
let supabase = null;

// Función para inicializar Supabase
function initializeSupabase() {
    try {
        // Verificar que las credenciales estén configuradas
        if (SUPABASE_CONFIG.url === 'https://tu-proyecto.supabase.co' || 
            SUPABASE_CONFIG.anonKey === 'tu-clave-publica-aqui') {
            console.warn('⚠️  Configuración de Supabase no encontrada. Por favor, actualiza config.js con tus credenciales.');
            return false;
        }
        
        // Verificar que el script de Supabase se cargó
        if (typeof window.supabase === 'undefined') {
            console.error('❌ Supabase no está disponible. Asegúrate de incluir el script de Supabase en tu HTML.');
            return false;
        }
        
        // Inicializar Supabase
        supabase = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
        console.log('✅ Supabase inicializado correctamente');
        return true;
        
    } catch (error) {
        console.error('❌ Error al inicializar Supabase:', error);
        return false;
    }
}

// Función para verificar la conexión con Supabase
async function testSupabaseConnection() {
    try {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        // Intentar hacer una consulta simple para verificar la conexión
        const { data, error } = await supabase
            .from(APP_CONFIG.database.tables.vehicles)
            .select('count')
            .limit(1);
            
        if (error) {
            throw error;
        }
        
        console.log('✅ Conexión con Supabase verificada');
        return true;
    } catch (error) {
        console.error('❌ Error de conexión con Supabase:', error);
        return false;
    }
}

// Función para crear la tabla de vehículos si no existe
async function createVehiclesTable() {
    try {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        // Esta función debería ejecutarse desde el SQL Editor de Supabase
        // Aquí solo mostramos el SQL que necesitas ejecutar
        const createTableSQL = `
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
        `;
        
        console.log('📋 SQL para crear la tabla de vehículos:');
        console.log(createTableSQL);
        
        return createTableSQL;
    } catch (error) {
        console.error('❌ Error al crear la tabla de vehículos:', error);
        return null;
    }
}

// Función para obtener la configuración
function getConfig() {
    return {
        supabase: SUPABASE_CONFIG,
        app: APP_CONFIG
    };
}

// Función para mostrar instrucciones de configuración
function showConfigurationInstructions() {
    const instructions = `
    🚀 INSTRUCCIONES DE CONFIGURACIÓN PARA VÉCTOR
    
    1. CREAR PROYECTO EN SUPABASE:
       - Ve a https://supabase.com
       - Crea una cuenta o inicia sesión
       - Crea un nuevo proyecto
       - Espera a que se complete la configuración
    
    2. OBTENER CREDENCIALES:
       - En tu proyecto de Supabase, ve a Settings > API
       - Copia la "Project URL" y la "anon public" key
       - Actualiza config.js con estos valores
    
    3. CREAR LA TABLA DE VEHÍCULOS:
       - Ve a SQL Editor en tu proyecto de Supabase
       - Ejecuta el SQL que se muestra en la consola
       - O usa la función createVehiclesTable() para obtener el SQL
    
    4. CONFIGURAR POLÍTICAS DE SEGURIDAD (RLS):
       - Ve a Authentication > Policies
       - Crea políticas para permitir operaciones CRUD en la tabla vehiculos
    
    5. INCLUIR SCRIPT DE SUPABASE:
       - Agrega este script antes de config.js en tu HTML:
       <script src="https://unpkg.com/@supabase/supabase-js@2"></script>
    
    ✅ Una vez completados estos pasos, tu aplicación estará lista para usar.
    `;
    
    console.log(instructions);
    return instructions;
}

// Exportar funciones para uso global
window.SupabaseConfig = {
    initialize: initializeSupabase,
    testConnection: testSupabaseConnection,
    createTable: createVehiclesTable,
    getConfig: getConfig,
    showInstructions: showConfigurationInstructions
};

// Mostrar instrucciones al cargar
document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 Configuración de Véctor cargada');
    showConfigurationInstructions();
});
