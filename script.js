// Véctor - Sistema de Administración de Flotilla
// JavaScript principal para la funcionalidad de la aplicación

class VictorApp {
    constructor() {
        this.currentVehicle = null;
        this.vehicles = [];
        this.isEditing = false;
        this.searchTimeout = null;
        
        this.init();
    }
    
    // Inicialización de la aplicación
    init() {
        this.setupEventListeners();
        this.initializeSupabase();
        this.loadVehicles();
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Sidebar toggle
        document.getElementById('toggleBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('mobileToggle').addEventListener('click', () => this.toggleSidebar());
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Vehicle buttons
        document.getElementById('addVehicleBtn').addEventListener('click', () => this.showVehicleModal());
        document.getElementById('addFirstVehicleBtn').addEventListener('click', () => this.showVehicleModal());
        
        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.hideVehicleModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideVehicleModal());
        document.getElementById('vehicleForm').addEventListener('submit', (e) => this.handleVehicleSubmit(e));
        
        // Delete modal events
        document.getElementById('deleteModalClose').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('filterSelect').addEventListener('change', (e) => this.handleFilter(e));
        
        // Close modals on outside click
        document.getElementById('vehicleModal').addEventListener('click', (e) => {
            if (e.target.id === 'vehicleModal') this.hideVehicleModal();
        });
        
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') this.hideDeleteModal();
        });
    }
    
    // Inicializar Supabase
    async initializeSupabase() {
        try {
            const isInitialized = window.SupabaseConfig.initialize();
            if (isInitialized) {
                const isConnected = await window.SupabaseConfig.testConnection();
                if (isConnected) {
                    this.showToast('Conexión con Supabase establecida', 'success');
                } else {
                    this.showToast('Error de conexión con Supabase', 'error');
                }
            } else {
                this.showToast('Configuración de Supabase requerida', 'warning');
            }
        } catch (error) {
            console.error('Error al inicializar Supabase:', error);
            this.showToast('Error al inicializar la base de datos', 'error');
        }
    }
    
    // Toggle sidebar
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        sidebar.classList.toggle('collapsed');
        
        // En móviles, mostrar/ocultar sidebar
        if (window.innerWidth <= 768) {
            sidebar.classList.toggle('show');
        }
    }
    
    // Manejar navegación
    handleNavigation(e) {
        e.preventDefault();
        
        // Remover clase active de todos los elementos
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al elemento clickeado
        e.target.closest('.nav-item').classList.add('active');
        
        const module = e.target.closest('.nav-link').dataset.module;
        this.loadModule(module);
    }
    
    // Cargar módulo específico
    loadModule(module) {
        const pageTitle = document.querySelector('.page-title');
        
        switch (module) {
            case 'vehiculos':
                pageTitle.textContent = 'Vehículos';
                this.showVehiclesModule();
                break;
            case 'mantenimiento':
                pageTitle.textContent = 'Mantenimiento';
                this.showMaintenanceModule();
                break;
            case 'conductores':
                pageTitle.textContent = 'Conductores';
                this.showDriversModule();
                break;
            case 'reportes':
                pageTitle.textContent = 'Reportes';
                this.showReportsModule();
                break;
        }
    }
    
    // Mostrar módulo de vehículos
    showVehiclesModule() {
        // Por ahora solo cargamos vehículos
        this.loadVehicles();
    }
    
    // Mostrar otros módulos (placeholder)
    showMaintenanceModule() {
        this.showToast('Módulo de Mantenimiento - Próximamente', 'info');
    }
    
    showDriversModule() {
        this.showToast('Módulo de Conductores - Próximamente', 'info');
    }
    
    showReportsModule() {
        this.showToast('Módulo de Reportes - Próximamente', 'info');
    }
    
    // Cargar vehículos desde Supabase
    async loadVehicles() {
        try {
            this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            const { data, error } = await supabase
                .from('vehiculos')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) {
                throw error;
            }
            
            this.vehicles = data || [];
            this.renderVehicles();
            
        } catch (error) {
            console.error('Error al cargar vehículos:', error);
            this.showToast('Error al cargar vehículos: ' + error.message, 'error');
            this.vehicles = [];
            this.renderVehicles();
        } finally {
            this.showLoading(false);
        }
    }
    
    // Renderizar tabla de vehículos
    renderVehicles() {
        const tbody = document.getElementById('vehiclesTableBody');
        const emptyState = document.getElementById('emptyState');
        const vehiclesTable = document.getElementById('vehiclesTable');
        
        if (this.vehicles.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            vehiclesTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        vehiclesTable.style.display = 'block';
        
        tbody.innerHTML = this.vehicles.map(vehicle => `
            <tr>
                <td><strong>${vehicle.placa}</strong></td>
                <td>${vehicle.marca}</td>
                <td>${vehicle.modelo}</td>
                <td>${vehicle.año}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${vehicle.combustible || '-'}</td>
                <td>
                    <span class="vehicle-status status-${vehicle.estado}">
                        ${vehicle.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editVehicle(${vehicle.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteVehicle(${vehicle.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Mostrar modal de vehículo
    showVehicleModal(vehicle = null) {
        const modal = document.getElementById('vehicleModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('vehicleForm');
        
        this.currentVehicle = vehicle;
        this.isEditing = !!vehicle;
        
        if (this.isEditing) {
            modalTitle.textContent = 'Editar Vehículo';
            this.populateForm(vehicle);
        } else {
            modalTitle.textContent = 'Agregar Vehículo';
            form.reset();
        }
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('placa').focus();
        }, 100);
    }
    
    // Ocultar modal de vehículo
    hideVehicleModal() {
        const modal = document.getElementById('vehicleModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentVehicle = null;
        this.isEditing = false;
    }
    
    // Llenar formulario con datos del vehículo
    populateForm(vehicle) {
        const fields = [
            'placa', 'marca', 'modelo', 'año', 'carroceria', 
            'cilindrada', 'cilindros', 'combustible', 'transmision', 
            'traccion', 'color', 'vin'
        ];
        
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && vehicle[field]) {
                element.value = vehicle[field];
            }
        });
    }
    
    // Manejar envío del formulario
    async handleVehicleSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const vehicleData = Object.fromEntries(formData.entries());
        
        // Validar campos requeridos
        if (!vehicleData.placa || !vehicleData.marca || !vehicleData.modelo || !vehicleData.año) {
            this.showToast('Por favor, completa todos los campos requeridos', 'error');
            return;
        }
        
        // Validar año
        const año = parseInt(vehicleData.año);
        if (año < 1900 || año > 2030) {
            this.showToast('El año debe estar entre 1900 y 2030', 'error');
            return;
        }
        
        // Validar VIN si se proporciona
        if (vehicleData.vin && vehicleData.vin.length !== 17) {
            this.showToast('El VIN debe tener exactamente 17 caracteres', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            if (this.isEditing) {
                await this.updateVehicle(vehicleData);
            } else {
                await this.createVehicle(vehicleData);
            }
            
            this.hideVehicleModal();
            this.loadVehicles();
            
        } catch (error) {
            console.error('Error al guardar vehículo:', error);
            this.showToast('Error al guardar vehículo: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Crear nuevo vehículo
    async createVehicle(vehicleData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('vehiculos')
            .insert([{
                ...vehicleData,
                año: parseInt(vehicleData.año),
                cilindrada: vehicleData.cilindrada ? parseInt(vehicleData.cilindrada) : null,
                cilindros: vehicleData.cilindros ? parseInt(vehicleData.cilindros) : null,
                estado: 'activo'
            }])
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Vehículo creado exitosamente', 'success');
        return data[0];
    }
    
    // Actualizar vehículo existente
    async updateVehicle(vehicleData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('vehiculos')
            .update({
                ...vehicleData,
                año: parseInt(vehicleData.año),
                cilindrada: vehicleData.cilindrada ? parseInt(vehicleData.cilindrada) : null,
                cilindros: vehicleData.cilindros ? parseInt(vehicleData.cilindros) : null
            })
            .eq('id', this.currentVehicle.id)
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Vehículo actualizado exitosamente', 'success');
        return data[0];
    }
    
    // Editar vehículo
    editVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
            this.showVehicleModal(vehicle);
        }
    }
    
    // Eliminar vehículo
    deleteVehicle(id) {
        const vehicle = this.vehicles.find(v => v.id === id);
        if (vehicle) {
            this.currentVehicle = vehicle;
            this.showDeleteModal();
        }
    }
    
    // Mostrar modal de confirmación de eliminación
    showDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    // Ocultar modal de confirmación de eliminación
    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentVehicle = null;
    }
    
    // Confirmar eliminación
    async confirmDelete() {
        if (!this.currentVehicle) return;
        
        try {
            this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            const { error } = await supabase
                .from('vehiculos')
                .delete()
                .eq('id', this.currentVehicle.id);
            
            if (error) {
                throw error;
            }
            
            this.hideDeleteModal();
            this.loadVehicles();
            this.showToast('Vehículo eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('Error al eliminar vehículo:', error);
            this.showToast('Error al eliminar vehículo: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Manejar búsqueda
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.filterVehicles(query);
        }, 300);
    }
    
    // Manejar filtro por estado
    handleFilter(e) {
        const filter = e.target.value;
        this.filterVehicles('', filter);
    }
    
    // Filtrar vehículos
    filterVehicles(searchQuery = '', statusFilter = '') {
        let filteredVehicles = [...this.vehicles];
        
        // Aplicar filtro de búsqueda
        if (searchQuery) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.placa.toLowerCase().includes(searchQuery) ||
                vehicle.marca.toLowerCase().includes(searchQuery) ||
                vehicle.modelo.toLowerCase().includes(searchQuery) ||
                vehicle.color?.toLowerCase().includes(searchQuery) ||
                vehicle.vin?.toLowerCase().includes(searchQuery)
            );
        }
        
        // Aplicar filtro de estado
        if (statusFilter) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.estado === statusFilter
            );
        }
        
        // Renderizar vehículos filtrados
        this.renderFilteredVehicles(filteredVehicles);
    }
    
    // Renderizar vehículos filtrados
    renderFilteredVehicles(vehicles) {
        const tbody = document.getElementById('vehiclesTableBody');
        const emptyState = document.getElementById('emptyState');
        const vehiclesTable = document.getElementById('vehiclesTable');
        
        if (vehicles.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            vehiclesTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        vehiclesTable.style.display = 'block';
        
        tbody.innerHTML = vehicles.map(vehicle => `
            <tr>
                <td><strong>${vehicle.placa}</strong></td>
                <td>${vehicle.marca}</td>
                <td>${vehicle.modelo}</td>
                <td>${vehicle.año}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${vehicle.combustible || '-'}</td>
                <td>
                    <span class="vehicle-status status-${vehicle.estado}">
                        ${vehicle.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editVehicle(${vehicle.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteVehicle(${vehicle.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Mostrar/ocultar estado de carga
    showLoading(show) {
        const loadingState = document.getElementById('loadingState');
        const contentArea = document.querySelector('.content-area');
        
        if (show) {
            loadingState.style.display = 'block';
            contentArea.style.opacity = '0.5';
        } else {
            loadingState.style.display = 'none';
            contentArea.style.opacity = '1';
        }
    }
    
    // Mostrar notificación toast
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        
        toast.innerHTML = `
            <i class="toast-icon ${icons[type]}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        toastContainer.appendChild(toast);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new VictorApp();
});

// Manejar redimensionamiento de ventana
window.addEventListener('resize', function() {
    const sidebar = document.getElementById('sidebar');
    if (window.innerWidth > 768) {
        sidebar.classList.remove('show');
    }
});
