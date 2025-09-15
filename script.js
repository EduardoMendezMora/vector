// Véctor - Sistema de Administración de Flotilla
// JavaScript principal para la funcionalidad de la aplicación
// Actualizado para Bootstrap 5.3

class VictorApp {
    constructor() {
        this.currentVehicle = null;
        this.currentBrand = null;
        this.currentModel = null;
        this.currentCarroceria = null;
        this.vehicles = [];
        this.brands = [];
        this.models = [];
        this.carrocerias = [];
        this.isEditing = false;
        this.isEditingBrand = false;
        this.isEditingModel = false;
        this.isEditingCarroceria = false;
        this.currentModule = 'vehiculos';
        this.currentSubModule = null;
        this.searchTimeout = null;
        
        this.init();
    }

    // Función para formatear valores de combustible
    formatCombustible(combustible) {
        if (!combustible) return '-';
        const formatMap = {
            'diesel': 'Diésel',
            'gasolina': 'Gasolina',
            'gas': 'Gas',
            'electrico': 'Eléctrico',
            'hibrido': 'Híbrido'
        };
        return formatMap[combustible.toLowerCase()] || combustible;
    }

    // Función para formatear valores de transmisión
    formatTransmision(transmision) {
        if (!transmision) return '-';
        const formatMap = {
            'manual': 'Manual',
            'automatica': 'Automática',
            'cvt': 'CVT'
        };
        return formatMap[transmision.toLowerCase()] || transmision;
    }

    // Función para formatear valores de tracción
    formatTraccion(traccion) {
        if (!traccion) return '-';
        const formatMap = {
            'delantera': 'Delantera',
            'trasera': 'Trasera',
            '4x4': '4X4',
            '4x2': '4X2',
            'awd': 'AWD'
        };
        return formatMap[traccion.toLowerCase()] || traccion;
    }

    // Función para formatear valores en colones costarricenses
    formatColones(valor) {
        if (!valor || valor === 0) return '-';
        
        // Convertir a número si es string
        const numero = typeof valor === 'string' ? parseFloat(valor) : valor;
        
        if (isNaN(numero)) return '-';
        
        // Formatear con separadores de miles y 2 decimales
        return '₡' + numero.toLocaleString('es-CR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }
    
    // Inicialización de la aplicación
    async init() {
        this.setupEventListeners();
        await this.initializeSupabase();
        // Solo cargar vehículos si Supabase se inicializó correctamente
        if (supabase) {
            this.loadVehicles();
        }
    }
    
    // Configurar event listeners
    setupEventListeners() {
        // Sidebar toggle (desktop)
        const toggleBtn = document.getElementById('toggleBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => this.toggleSidebar());
        }
        
        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => this.handleNavigation(e));
        });
        
        // Add buttons
        document.getElementById('addBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('addFirstBtn').addEventListener('click', () => this.showAddModal());
        document.getElementById('addFirstBrandBtn').addEventListener('click', () => this.showBrandModal());
        document.getElementById('addFirstModelBtn').addEventListener('click', () => this.showModelModal());
        document.getElementById('addFirstCarroceriaBtn').addEventListener('click', () => this.showCarroceriaModal());
        
        // Vehicle modal events
        this.setupModalEvents('vehicleModal', 'modalClose', 'cancelBtn', 'vehicleForm', 
                             () => this.hideVehicleModal(), (e) => this.handleVehicleSubmit(e));
        
        // Brand modal events
        this.setupModalEvents('brandModal', 'brandModalClose', 'cancelBrandBtn', 'brandForm',
                             () => this.hideBrandModal(), (e) => this.handleBrandSubmit(e));
        
        // Model modal events
        this.setupModalEvents('modelModal', 'modelModalClose', 'cancelModelBtn', 'modelForm',
                             () => this.hideModelModal(), (e) => this.handleModelSubmit(e));
        
        // Carrocería modal events
        this.setupModalEvents('carroceriaModal', 'carroceriaModalClose', 'cancelCarroceriaBtn', 'carroceriaForm',
                             () => this.hideCarroceriaModal(), (e) => this.handleCarroceriaSubmit(e));
        
        // Delete modal events
        this.setupModalEvents('deleteModal', 'deleteModalClose', 'cancelDeleteBtn', null,
                             () => this.hideDeleteModal(), null);
        document.getElementById('confirmDeleteBtn').addEventListener('click', () => this.confirmDelete());
        
        // Search and filter
        document.getElementById('searchInput').addEventListener('input', (e) => this.handleSearch(e));
        document.getElementById('filterSelect').addEventListener('change', (e) => this.handleFilter(e));
        document.getElementById('brandFilterSelect').addEventListener('change', (e) => this.handleBrandFilter(e));
        document.getElementById('modelBrandFilterSelect').addEventListener('change', (e) => this.handleModelBrandFilter(e));
        document.getElementById('modelFilterSelect').addEventListener('change', (e) => this.handleModelFilter(e));
        document.getElementById('carroceriaFilterSelect').addEventListener('change', (e) => this.handleCarroceriaFilter(e));
        
        // Vehicle form events
        document.getElementById('marca').addEventListener('change', (e) => this.handleMarcaChange(e));
    }
    
    // Configurar eventos de modal de forma genérica
    setupModalEvents(modalId, closeId, cancelId, formId, hideFunction, submitFunction) {
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeId);
        const cancelBtn = document.getElementById(cancelId);
        const form = formId ? document.getElementById(formId) : null;
        
        if (closeBtn) closeBtn.addEventListener('click', hideFunction);
        if (cancelBtn) cancelBtn.addEventListener('click', hideFunction);
        if (form && submitFunction) form.addEventListener('submit', submitFunction);
        
        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) hideFunction();
            });
        }
    }
    
    // Inicializar Supabase
    async initializeSupabase() {
        try {
            // Esperar a que el DOM esté completamente cargado
            if (document.readyState === 'loading') {
                await new Promise(resolve => {
                    document.addEventListener('DOMContentLoaded', resolve);
                });
            }
            
            // Esperar un poco más para asegurar que los scripts se carguen
            await new Promise(resolve => setTimeout(resolve, 500));
            
            const isInitialized = window.SupabaseConfig.initialize();
            if (isInitialized) {
                const isConnected = await window.SupabaseConfig.testConnection();
                if (isConnected) {
                    this.showToast('Conexión con Supabase establecida', 'success');
                    return true;
                } else {
                    this.showToast('Error de conexión con Supabase', 'error');
                    return false;
                }
            } else {
                this.showToast('Configuración de Supabase requerida', 'warning');
                return false;
            }
        } catch (error) {
            console.error('Error al inicializar Supabase:', error);
            this.showToast('Error al inicializar la base de datos', 'error');
            return false;
        }
    }
    
    // Toggle sidebar (solo para desktop)
    toggleSidebar() {
        const sidebar = document.getElementById('sidebar');
        const mainContent = document.querySelector('.main-content');
        
        sidebar.classList.toggle('collapsed');
    }
    
    // Manejar navegación
    handleNavigation(e) {
        e.preventDefault();
        
        const link = e.target.closest('.nav-link');
        const module = link.dataset.module;
        const submodule = link.dataset.submodule;
        
        // Remover clase active de todos los elementos
        document.querySelectorAll('.nav-link').forEach(navLink => {
            navLink.classList.remove('active');
        });
        
        // Agregar clase active al elemento clickeado
        link.classList.add('active');
        
        if (submodule) {
            this.currentSubModule = submodule;
            this.loadSubModule(submodule);
        } else if (module) {
            this.currentModule = module;
            this.currentSubModule = null;
            this.loadModule(module);
        }
    }
    
    // Cargar módulo específico
    loadModule(module) {
        const pageTitle = document.querySelector('.page-title');
        
        switch (module) {
            case 'vehiculos':
                pageTitle.textContent = 'Vehículos';
                this.showVehiclesModule();
                break;
        }
    }
    
    // Cargar submódulo específico
    loadSubModule(submodule) {
        const pageTitle = document.querySelector('.page-title');
        
        switch (submodule) {
            case 'marcas':
                pageTitle.textContent = 'Marcas de Vehículos';
                this.showBrandsModule();
                break;
            case 'modelos':
                pageTitle.textContent = 'Modelos de Vehículos';
                this.showModelsModule();
                break;
            case 'carrocerias':
                pageTitle.textContent = 'Carrocerías de Vehículos';
                this.showCarroceriasModule();
                break;
        }
    }
    
    // Mostrar módulo de vehículos
    async showVehiclesModule() {
        // Ocultar otras tablas y mostrar tabla de vehículos
        this.hideAllTables();
        document.getElementById('vehiclesTable').style.display = 'block';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Vehículo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Vehículo';
        
        // Cargar datos en orden correcto
        await this.loadInitialData();
    }
    
    // Mostrar módulo de marcas
    showBrandsModule() {
        this.hideAllTables();
        document.getElementById('brandsTable').style.display = 'block';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Marca';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primera Marca';
        
        // Cargar marcas
        this.loadBrands(true);
    }
    
    // Mostrar módulo de modelos
    showModelsModule() {
        this.hideAllTables();
        document.getElementById('modelsTable').style.display = 'block';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Modelo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Modelo';
        
        // Cargar modelos
        this.loadModels(true);
    }
    
    // Mostrar módulo de carrocerías
    showCarroceriasModule() {
        this.hideAllTables();
        document.getElementById('carroceriasTable').style.display = 'block';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Carrocería';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primera Carrocería';
        
        // Cargar carrocerías
        this.loadCarrocerias(true);
    }
    
    // Ocultar todas las tablas y estados vacíos
    hideAllTables() {
        const tables = ['vehiclesTable', 'brandsTable', 'modelsTable', 'carroceriasTable'];
        const emptyStates = ['emptyState', 'emptyBrandsState', 'emptyModelsState', 'emptyCarroceriasState'];
        
        tables.forEach(tableId => {
            document.getElementById(tableId).style.display = 'none';
        });
        
        emptyStates.forEach(stateId => {
            document.getElementById(stateId).style.display = 'none';
        });
    }
    
    // Cargar datos iniciales en orden correcto
    async loadInitialData() {
        try {
            console.log('Iniciando carga de datos...');
            console.log('Supabase disponible:', !!supabase);
            
            // Verificar conexión con una consulta simple
            const { data: testData, error: testError } = await supabase
                .from('marcas')
                .select('count')
                .limit(1);
            
            console.log('Test de conexión a marcas:', { testData, testError });
            
            // Primero cargar marcas
            await this.loadBrands();
            console.log('Marcas cargadas:', this.brands.length);
            
            // Luego cargar modelos
            await this.loadModels();
            console.log('Modelos cargados:', this.models.length);
            
            // Cargar carrocerías
            await this.loadCarrocerias();
            console.log('Carrocerías cargadas:', this.carrocerias.length);
            
            // Finalmente cargar vehículos
            await this.loadVehicles();
            console.log('Vehículos cargados:', this.vehicles.length);
            
            console.log('Carga de datos completada');
            
        } catch (error) {
            console.error('Error al cargar datos iniciales:', error);
            this.showToast('Error al cargar datos: ' + error.message, 'error');
        }
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
                .select(`
                    *,
                    marcas (
                        id,
                        nombre
                    ),
                    modelos (
                        id,
                        nombre
                    ),
                    carrocerias (
                        id,
                        nombre
                    )
                `)
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
    
    // Cargar marcas desde Supabase
    async loadBrands(showLoading = false) {
        try {
            if (showLoading) this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            const { data, error } = await supabase
                .from('marcas')
                .select('*')
                .order('nombre', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            this.brands = data || [];
            console.log('Marcas cargadas desde Supabase:', this.brands.length);
            
            if (this.currentSubModule === 'marcas') {
                this.renderBrands();
            }
            
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            this.showToast('Error al cargar marcas: ' + error.message, 'error');
            this.brands = [];
            if (this.currentSubModule === 'marcas') {
                this.renderBrands();
            }
        } finally {
            if (showLoading) this.showLoading(false);
        }
    }
    
    // Cargar modelos desde Supabase
    async loadModels(showLoading = false) {
        try {
            if (showLoading) this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            const { data, error } = await supabase
                .from('modelos')
                .select(`
                    *,
                    marcas (
                        id,
                        nombre
                    )
                `)
                .order('nombre', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            this.models = data || [];
            console.log('Modelos cargados desde Supabase:', this.models.length);
            
            if (this.currentSubModule === 'modelos') {
                this.renderModels();
                this.populateModelBrandFilter();
            }
            
        } catch (error) {
            console.error('Error al cargar modelos:', error);
            this.showToast('Error al cargar modelos: ' + error.message, 'error');
            this.models = [];
            if (this.currentSubModule === 'modelos') {
                this.renderModels();
            }
        } finally {
            if (showLoading) this.showLoading(false);
        }
    }
    
    // Cargar carrocerías desde Supabase
    async loadCarrocerias(showLoading = false) {
        try {
            if (showLoading) this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            const { data, error } = await supabase
                .from('carrocerias')
                .select('*')
                .order('nombre', { ascending: true });
            
            if (error) {
                throw error;
            }
            
            this.carrocerias = data || [];
            console.log('Carrocerías cargadas desde Supabase:', this.carrocerias.length);
            
            if (this.currentSubModule === 'carrocerias') {
                this.renderCarrocerias();
            }
            
        } catch (error) {
            console.error('Error al cargar carrocerías:', error);
            this.showToast('Error al cargar carrocerías: ' + error.message, 'error');
            this.carrocerias = [];
            if (this.currentSubModule === 'carrocerias') {
                this.renderCarrocerias();
            }
        } finally {
            if (showLoading) this.showLoading(false);
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
                <td><strong class="text-navy">${vehicle.placa}</strong></td>
                <td>${vehicle.marcas?.nombre || '-'}</td>
                <td>${vehicle.modelos?.nombre || '-'}</td>
                <td>${vehicle.año}</td>
                <td>${vehicle.carrocerias?.nombre || '-'}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${this.formatCombustible(vehicle.combustible)}</td>
                <td class="text-end fw-semibold text-success">${this.formatColones(vehicle.leasing_semanal)}</td>
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
    
    // Renderizar tabla de marcas
    renderBrands() {
        const tbody = document.getElementById('brandsTableBody');
        const emptyState = document.getElementById('emptyBrandsState');
        const brandsTable = document.getElementById('brandsTable');
        
        if (this.brands.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            brandsTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        brandsTable.style.display = 'block';
        
        tbody.innerHTML = this.brands.map(brand => `
            <tr>
                <td><span class="badge bg-secondary">${brand.id}</span></td>
                <td><strong class="text-navy">${brand.nombre}</strong></td>
                <td>
                    <span class="vehicle-status status-${brand.estado}">
                        ${brand.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editBrand(${brand.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteBrand(${brand.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Renderizar tabla de modelos
    renderModels() {
        const tbody = document.getElementById('modelsTableBody');
        const emptyState = document.getElementById('emptyModelsState');
        const modelsTable = document.getElementById('modelsTable');
        
        if (this.models.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            modelsTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        modelsTable.style.display = 'block';
        
        tbody.innerHTML = this.models.map(model => `
            <tr>
                <td><span class="badge bg-secondary">${model.id}</span></td>
                <td><strong class="text-navy">${model.nombre}</strong></td>
                <td>${model.marcas?.nombre || '-'}</td>
                <td>
                    <span class="vehicle-status status-${model.estado}">
                        ${model.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editModel(${model.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteModel(${model.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Renderizar tabla de carrocerías
    renderCarrocerias() {
        const tbody = document.getElementById('carroceriasTableBody');
        const emptyState = document.getElementById('emptyCarroceriasState');
        const carroceriasTable = document.getElementById('carroceriasTable');
        
        if (this.carrocerias.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            carroceriasTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        carroceriasTable.style.display = 'block';
        
        tbody.innerHTML = this.carrocerias.map(carroceria => `
            <tr>
                <td><span class="badge bg-secondary">${carroceria.id}</span></td>
                <td><strong class="text-navy">${carroceria.nombre}</strong></td>
                <td>${carroceria.descripcion || '-'}</td>
                <td>
                    <span class="vehicle-status status-${carroceria.estado}">
                        ${carroceria.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editCarroceria(${carroceria.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteCarroceria(${carroceria.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Mostrar modal de agregar (vehículo, marca, modelo o carrocería)
    showAddModal() {
        if (this.currentSubModule === 'marcas') {
            this.showBrandModal();
        } else if (this.currentSubModule === 'modelos') {
            this.showModelModal();
        } else if (this.currentSubModule === 'carrocerias') {
            this.showCarroceriaModal();
        } else {
            this.showVehicleModal();
        }
    }
    
    // Mostrar modal de vehículo usando Bootstrap Modal
    async showVehicleModal(vehicle = null) {
        const modalElement = document.getElementById('vehicleModal');
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('vehicleForm');
        
        this.currentVehicle = vehicle;
        this.isEditing = !!vehicle;
        
        if (this.isEditing) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Vehículo';
        } else {
            modalTitle.innerHTML = '<i class="fas fa-car me-2"></i>Agregar Vehículo';
            form.reset();
        }
        
        // Asegurar que los datos estén cargados antes de abrir el modal
        if (this.brands.length === 0 || this.models.length === 0) {
            console.log('Datos no cargados, cargando...');
            await this.loadInitialData();
        }
        
        // Llenar selectores
        this.populateBrandsDropdown();
        this.populateCarroceriasDropdown();
        
        modal.show();
        
        // Si está editando, llenar el formulario y cargar modelos DESPUÉS de mostrar el modal
        if (this.isEditing) {
            setTimeout(() => {
                this.populateFormFields(vehicle);
                
                if (vehicle.marca_id || vehicle.marca) {
                    const marcaId = vehicle.marca_id || vehicle.marca;
                    console.log('Estableciendo marca con ID:', marcaId);
                    const marcaSelect = document.getElementById('marca');
                    if (marcaSelect) {
                        marcaSelect.value = marcaId;
                        this.populateModelsDropdown(marcaId);
                        
                        setTimeout(() => {
                            if (vehicle.modelo_id || vehicle.modelo) {
                                const modeloId = vehicle.modelo_id || vehicle.modelo;
                                console.log('Estableciendo modelo con ID:', modeloId);
                                const modeloSelect = document.getElementById('modelo');
                                if (modeloSelect) {
                                    modeloSelect.value = modeloId;
                                }
                            }
                        }, 50);
                    }
                }
            }, 100);
        }
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('placa').focus();
        }, 100);
    }
    
    // Ocultar modal de vehículo
    hideVehicleModal() {
        const modalElement = document.getElementById('vehicleModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        this.currentVehicle = null;
        this.isEditing = false;
    }
    
    // Mostrar modal de marca usando Bootstrap Modal
    showBrandModal(brand = null) {
        const modalElement = document.getElementById('brandModal');
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('brandModalTitle');
        const form = document.getElementById('brandForm');
        
        this.currentBrand = brand;
        this.isEditingBrand = !!brand;
        
        if (this.isEditingBrand) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Marca';
            this.populateBrandForm(brand);
        } else {
            modalTitle.innerHTML = '<i class="fas fa-tags me-2"></i>Agregar Marca';
            form.reset();
        }
        
        modal.show();
        
        setTimeout(() => {
            document.getElementById('brandName').focus();
        }, 100);
    }
    
    // Ocultar modal de marca
    hideBrandModal() {
        const modalElement = document.getElementById('brandModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        this.currentBrand = null;
        this.isEditingBrand = false;
    }
    
    // Mostrar modal de modelo usando Bootstrap Modal
    showModelModal(model = null) {
        const modalElement = document.getElementById('modelModal');
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('modelModalTitle');
        const form = document.getElementById('modelForm');
        
        this.currentModel = model;
        this.isEditingModel = !!model;
        
        if (this.isEditingModel) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Modelo';
            this.populateModelForm(model);
        } else {
            modalTitle.innerHTML = '<i class="fas fa-car-side me-2"></i>Agregar Modelo';
            form.reset();
        }
        
        // Llenar selector de marcas
        this.populateModelBrandSelector();
        
        modal.show();
        
        setTimeout(() => {
            document.getElementById('modelBrand').focus();
        }, 100);
    }
    
    // Ocultar modal de modelo
    hideModelModal() {
        const modalElement = document.getElementById('modelModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        this.currentModel = null;
        this.isEditingModel = false;
    }
    
    // Mostrar modal de carrocería usando Bootstrap Modal
    showCarroceriaModal(carroceria = null) {
        const modalElement = document.getElementById('carroceriaModal');
        const modal = new bootstrap.Modal(modalElement);
        const modalTitle = document.getElementById('carroceriaModalTitle');
        const form = document.getElementById('carroceriaForm');
        
        this.currentCarroceria = carroceria;
        this.isEditingCarroceria = !!carroceria;
        
        if (this.isEditingCarroceria) {
            modalTitle.innerHTML = '<i class="fas fa-edit me-2"></i>Editar Carrocería';
            this.populateCarroceriaForm(carroceria);
        } else {
            modalTitle.innerHTML = '<i class="fas fa-shapes me-2"></i>Agregar Carrocería';
            form.reset();
        }
        
        modal.show();
        
        setTimeout(() => {
            document.getElementById('carroceriaName').focus();
        }, 100);
    }
    
    // Ocultar modal de carrocería
    hideCarroceriaModal() {
        const modalElement = document.getElementById('carroceriaModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        this.currentCarroceria = null;
        this.isEditingCarroceria = false;
    }
    
    // Mostrar modal de confirmación de eliminación
    showDeleteModal() {
        const modalElement = document.getElementById('deleteModal');
        const modal = new bootstrap.Modal(modalElement);
        const title = document.getElementById('deleteModalTitle');
        const message = document.getElementById('deleteModalMessage');
        
        if (this.currentVehicle) {
            title.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación de Vehículo';
            message.textContent = `¿Estás seguro de que deseas eliminar el vehículo ${this.currentVehicle.placa}?`;
        } else if (this.currentBrand) {
            title.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación de Marca';
            message.textContent = `¿Estás seguro de que deseas eliminar la marca ${this.currentBrand.nombre}?`;
        } else if (this.currentModel) {
            title.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación de Modelo';
            message.textContent = `¿Estás seguro de que deseas eliminar el modelo ${this.currentModel.nombre}?`;
        } else if (this.currentCarroceria) {
            title.innerHTML = '<i class="fas fa-exclamation-triangle me-2"></i>Confirmar Eliminación de Carrocería';
            message.textContent = `¿Estás seguro de que deseas eliminar la carrocería ${this.currentCarroceria.nombre}?`;
        }
        
        modal.show();
    }
    
    // Ocultar modal de confirmación de eliminación
    hideDeleteModal() {
        const modalElement = document.getElementById('deleteModal');
        const modal = bootstrap.Modal.getInstance(modalElement);
        if (modal) {
            modal.hide();
        }
        
        this.currentVehicle = null;
        this.currentBrand = null;
        this.currentModel = null;
        this.currentCarroceria = null;
    }
    
    // [Las demás funciones permanecen iguales, solo cambio el sistema de toasts]
    
    // Mostrar notificación toast usando Bootstrap Toast
    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer');
        
        const toastId = 'toast-' + Date.now();
        const iconMap = {
            success: 'fas fa-check-circle text-success',
            error: 'fas fa-exclamation-circle text-danger',
            warning: 'fas fa-exclamation-triangle text-warning',
            info: 'fas fa-info-circle text-primary'
        };
        
        const borderClass = type === 'success' ? 'border-success' : 
                           type === 'error' ? 'border-danger' :
                           type === 'warning' ? 'border-warning' : 'border-primary';
        
        const toastHTML = `
            <div class="toast ${borderClass}" id="${toastId}" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
                <div class="toast-body d-flex align-items-center">
                    <i class="${iconMap[type]} me-2"></i>
                    <span class="flex-grow-1">${message}</span>
                    <button type="button" class="btn-close ms-2" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
            </div>
        `;
        
        toastContainer.insertAdjacentHTML('beforeend', toastHTML);
        
        const toastElement = document.getElementById(toastId);
        const toast = new bootstrap.Toast(toastElement);
        toast.show();
        
        // Remover el elemento después de que se oculte
        toastElement.addEventListener('hidden.bs.toast', () => {
            toastElement.remove();
        });
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
    
    // [Todas las demás funciones del archivo original permanecen iguales - CRUD, filtros, búsqueda, etc.]
    
    // Llenar campos normales del formulario (sin selectores)
    populateFormFields(vehicle) {
        console.log('Llenando campos del formulario con vehículo:', vehicle);
        
        const fields = [
            'placa', 'año', 
            'cilindrada', 'cilindros', 'combustible', 'transmision', 
            'traccion', 'color', 'vin', 'leasing_semanal'
        ];
        
        // Llenar campos normales
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && vehicle[field]) {
                element.value = vehicle[field];
            }
        });
        
        // Llenar carrocería con ID
        if (vehicle.carroceria_id) {
            console.log('Estableciendo carrocería_id:', vehicle.carroceria_id);
            const carroceriaSelect = document.getElementById('carroceria');
            if (carroceriaSelect) {
                carroceriaSelect.value = vehicle.carroceria_id;
                console.log('Carrocería establecida:', carroceriaSelect.value);
            }
        }
    }
    
    // Llenar formulario de marca con datos
    populateBrandForm(brand) {
        document.getElementById('brandName').value = brand.nombre || '';
    }
    
    // Llenar formulario de modelo con datos
    populateModelForm(model) {
        document.getElementById('modelBrand').value = model.marca_id || '';
        document.getElementById('modelName').value = model.nombre || '';
    }
    
    // Llenar formulario de carrocería con datos
    populateCarroceriaForm(carroceria) {
        document.getElementById('carroceriaName').value = carroceria.nombre || '';
        document.getElementById('carroceriaDescripcion').value = carroceria.descripcion || '';
    }
    
    // Llenar selector de marcas en el modal de modelo
    populateModelBrandSelector() {
        const selector = document.getElementById('modelBrand');
        const currentValue = selector.value;
        
        selector.innerHTML = '<option value="">Seleccionar marca...</option>';
        
        this.brands.forEach(brand => {
            if (brand.estado === 'activo') {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.nombre;
                selector.appendChild(option);
            }
        });
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // Llenar filtro de marcas en la tabla de modelos
    populateModelBrandFilter() {
        const selector = document.getElementById('modelBrandFilterSelect');
        const currentValue = selector.value;
        
        selector.innerHTML = '<option value="">Todas las marcas</option>';
        
        this.brands.forEach(brand => {
            if (brand.estado === 'activo') {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.nombre;
                selector.appendChild(option);
            }
        });
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // Manejar cambio de marca en vehículo
    handleMarcaChange(e) {
        const marcaId = e.target.value;
        this.populateModelsDropdown(marcaId);
    }
    
    // Llenar selector de modelos según la marca seleccionada
    populateModelsDropdown(marcaId) {
        const selector = document.getElementById('modelo');
        const currentValue = selector.value;
        
        console.log('Llenando selector de modelos para marca ID:', marcaId);
        console.log('Total modelos disponibles:', this.models.length);
        console.log('Modelos disponibles:', this.models);
        
        selector.innerHTML = '<option value="">Seleccionar modelo...</option>';
        
        if (marcaId) {
            const modelsForBrand = this.models.filter(model => 
                model.marca_id == marcaId && model.estado === 'activo'
            );
            
            console.log('Modelos para marca', marcaId, ':', modelsForBrand);
            
            modelsForBrand.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.nombre;
                selector.appendChild(option);
                console.log('Agregado modelo:', model.nombre, 'ID:', model.id);
            });
        }
        
        console.log('Opciones en selector de modelo:', selector.options.length);
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // Llenar selector de marcas en el modal de vehículo
    populateBrandsDropdown() {
        const selector = document.getElementById('marca');
        const currentValue = selector.value;
        
        console.log('Llenando selector de marcas. Total marcas:', this.brands.length);
        console.log('Marcas disponibles:', this.brands);
        
        selector.innerHTML = '<option value="">Seleccionar marca...</option>';
        
        this.brands.forEach(brand => {
            if (brand.estado === 'activo') {
                const option = document.createElement('option');
                option.value = brand.id;
                option.textContent = brand.nombre;
                selector.appendChild(option);
                console.log('Agregada marca:', brand.nombre, 'ID:', brand.id);
            }
        });
        
        console.log('Opciones en selector de marca:', selector.options.length);
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // Llenar selector de carrocerías en el modal de vehículo
    populateCarroceriasDropdown() {
        const selector = document.getElementById('carroceria');
        const currentValue = selector.value;
        
        console.log('Llenando selector de carrocerías. Total carrocerías:', this.carrocerias.length);
        console.log('Carrocerías disponibles:', this.carrocerias);
        
        selector.innerHTML = '<option value="">Seleccionar carrocería...</option>';
        
        this.carrocerias.forEach(carroceria => {
            if (carroceria.estado === 'activo') {
                const option = document.createElement('option');
                option.value = carroceria.id;
                option.textContent = carroceria.nombre;
                selector.appendChild(option);
                console.log('Agregada carrocería:', carroceria.nombre, 'ID:', carroceria.id);
            }
        });
        
        console.log('Opciones en selector de carrocería:', selector.options.length);
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // ===== CRUD OPERATIONS - [El resto de las funciones permanecen igual] =====
    
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
        
        // Validar leasing semanal si se proporciona
        if (vehicleData.leasing_semanal) {
            const leasing = parseFloat(vehicleData.leasing_semanal);
            if (isNaN(leasing) || leasing < 0) {
                this.showToast('El valor del leasing debe ser un número positivo', 'error');
                return;
            }
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
    
    // Manejar envío del formulario de marca
    async handleBrandSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const brandData = Object.fromEntries(formData.entries());
        
        // Validar campos requeridos
        if (!brandData.brandName) {
            this.showToast('Por favor, ingresa el nombre de la marca', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            if (this.isEditingBrand) {
                await this.updateBrand(brandData);
            } else {
                await this.createBrand(brandData);
            }
            
            this.hideBrandModal();
            this.loadBrands(true);
            
        } catch (error) {
            console.error('Error al guardar marca:', error);
            this.showToast('Error al guardar marca: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Manejar envío del formulario de modelo
    async handleModelSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const modelData = Object.fromEntries(formData.entries());
        
        // Validar campos requeridos
        if (!modelData.modelBrand) {
            this.showToast('Por favor, selecciona una marca', 'error');
            return;
        }
        
        if (!modelData.modelName) {
            this.showToast('Por favor, ingresa el nombre del modelo', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            if (this.isEditingModel) {
                await this.updateModel(modelData);
            } else {
                await this.createModel(modelData);
            }
            
            this.hideModelModal();
            this.loadModels(true);
            
        } catch (error) {
            console.error('Error al guardar modelo:', error);
            this.showToast('Error al guardar modelo: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // Manejar envío del formulario de carrocería
    async handleCarroceriaSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const carroceriaData = Object.fromEntries(formData.entries());
        
        // Validar campos requeridos
        if (!carroceriaData.carroceriaName) {
            this.showToast('Por favor, ingresa el nombre de la carrocería', 'error');
            return;
        }
        
        try {
            this.showLoading(true);
            
            if (this.isEditingCarroceria) {
                await this.updateCarroceria(carroceriaData);
            } else {
                await this.createCarroceria(carroceriaData);
            }
            
            this.hideCarroceriaModal();
            this.loadCarrocerias(true);
            
        } catch (error) {
            console.error('Error al guardar carrocería:', error);
            this.showToast('Error al guardar carrocería: ' + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // [Todas las demás funciones CRUD permanecen exactamente iguales]
    // Crear nuevo vehículo
    async createVehicle(vehicleData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('vehiculos')
            .insert([{
                placa: vehicleData.placa,
                marca_id: parseInt(vehicleData.marca),
                modelo_id: parseInt(vehicleData.modelo),
                año: parseInt(vehicleData.año),
                carroceria_id: vehicleData.carroceria ? parseInt(vehicleData.carroceria) : null,
                cilindrada: vehicleData.cilindrada ? parseInt(vehicleData.cilindrada) : null,
                cilindros: vehicleData.cilindros ? parseInt(vehicleData.cilindros) : null,
                combustible: vehicleData.combustible,
                transmision: vehicleData.transmision,
                traccion: vehicleData.traccion,
                color: vehicleData.color,
                vin: vehicleData.vin,
                leasing_semanal: vehicleData.leasing_semanal ? parseFloat(vehicleData.leasing_semanal) : null,
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
                placa: vehicleData.placa,
                marca_id: parseInt(vehicleData.marca),
                modelo_id: parseInt(vehicleData.modelo),
                año: parseInt(vehicleData.año),
                carroceria_id: vehicleData.carroceria ? parseInt(vehicleData.carroceria) : null,
                cilindrada: vehicleData.cilindrada ? parseInt(vehicleData.cilindrada) : null,
                cilindros: vehicleData.cilindros ? parseInt(vehicleData.cilindros) : null,
                combustible: vehicleData.combustible,
                transmision: vehicleData.transmision,
                traccion: vehicleData.traccion,
                color: vehicleData.color,
                vin: vehicleData.vin,
                leasing_semanal: vehicleData.leasing_semanal ? parseFloat(vehicleData.leasing_semanal) : null,
                updated_at: new Date().toISOString()
            })
            .eq('id', this.currentVehicle.id)
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Vehículo actualizado exitosamente', 'success');
        return data[0];
    }
    
    // Crear nueva marca
    async createBrand(brandData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('marcas')
            .insert([{
                nombre: brandData.brandName,
                estado: 'activo'
            }])
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Marca creada exitosamente', 'success');
        return data[0];
    }
    
    // Actualizar marca existente
    async updateBrand(brandData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('marcas')
            .update({
                nombre: brandData.brandName
            })
            .eq('id', this.currentBrand.id)
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Marca actualizada exitosamente', 'success');
        return data[0];
    }
    
    // Crear nuevo modelo
    async createModel(modelData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('modelos')
            .insert([{
                nombre: modelData.modelName,
                marca_id: parseInt(modelData.modelBrand),
                estado: 'activo'
            }])
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Modelo creado exitosamente', 'success');
        return data[0];
    }
    
    // Actualizar modelo existente
    async updateModel(modelData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('modelos')
            .update({
                nombre: modelData.modelName,
                marca_id: parseInt(modelData.modelBrand),
                updated_at: new Date().toISOString()
            })
            .eq('id', this.currentModel.id)
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Modelo actualizado exitosamente', 'success');
        return data[0];
    }
    
    // Crear nueva carrocería
    async createCarroceria(carroceriaData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('carrocerias')
            .insert([{
                nombre: carroceriaData.carroceriaName,
                descripcion: carroceriaData.carroceriaDescripcion || null,
                estado: 'activo'
            }])
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Carrocería creada exitosamente', 'success');
        return data[0];
    }
    
    // Actualizar carrocería existente
    async updateCarroceria(carroceriaData) {
        if (!supabase) {
            throw new Error('Supabase no está inicializado');
        }
        
        const { data, error } = await supabase
            .from('carrocerias')
            .update({
                nombre: carroceriaData.carroceriaName,
                descripcion: carroceriaData.carroceriaDescripcion || null,
                updated_at: new Date().toISOString()
            })
            .eq('id', this.currentCarroceria.id)
            .select();
        
        if (error) {
            throw error;
        }
        
        this.showToast('Carrocería actualizada exitosamente', 'success');
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
    
    // Editar marca
    editBrand(id) {
        const brand = this.brands.find(b => b.id === id);
        if (brand) {
            this.showBrandModal(brand);
        }
    }
    
    // Eliminar marca
    deleteBrand(id) {
        const brand = this.brands.find(b => b.id === id);
        if (brand) {
            this.currentBrand = brand;
            this.showDeleteModal();
        }
    }
    
    // Editar modelo
    editModel(id) {
        const model = this.models.find(m => m.id === id);
        if (model) {
            this.showModelModal(model);
        }
    }
    
    // Eliminar modelo
    deleteModel(id) {
        const model = this.models.find(m => m.id === id);
        if (model) {
            this.currentModel = model;
            this.showDeleteModal();
        }
    }
    
    // Editar carrocería
    editCarroceria(id) {
        const carroceria = this.carrocerias.find(c => c.id === id);
        if (carroceria) {
            this.showCarroceriaModal(carroceria);
        }
    }
    
    // Eliminar carrocería
    deleteCarroceria(id) {
        const carroceria = this.carrocerias.find(c => c.id === id);
        if (carroceria) {
            this.currentCarroceria = carroceria;
            this.showDeleteModal();
        }
    }
    
    // Confirmar eliminación
    async confirmDelete() {
        if (!this.currentVehicle && !this.currentBrand && !this.currentModel && !this.currentCarroceria) return;
        
        try {
            this.showLoading(true);
            
            if (!supabase) {
                throw new Error('Supabase no está inicializado');
            }
            
            if (this.currentVehicle) {
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
                
            } else if (this.currentBrand) {
                const { error } = await supabase
                    .from('marcas')
                    .delete()
                    .eq('id', this.currentBrand.id);
                
                if (error) {
                    throw error;
                }
                
                this.hideDeleteModal();
                this.loadBrands(true);
                this.showToast('Marca eliminada exitosamente', 'success');
                
            } else if (this.currentModel) {
                const { error } = await supabase
                    .from('modelos')
                    .delete()
                    .eq('id', this.currentModel.id);
                
                if (error) {
                    throw error;
                }
                
                this.hideDeleteModal();
                this.loadModels(true);
                this.showToast('Modelo eliminado exitosamente', 'success');
                
            } else if (this.currentCarroceria) {
                const { error } = await supabase
                    .from('carrocerias')
                    .delete()
                    .eq('id', this.currentCarroceria.id);
                
                if (error) {
                    throw error;
                }
                
                this.hideDeleteModal();
                this.loadCarrocerias(true);
                this.showToast('Carrocería eliminada exitosamente', 'success');
            }
            
        } catch (error) {
            console.error('Error al eliminar:', error);
            const itemType = this.currentVehicle ? 'vehículo' : (this.currentBrand ? 'marca' : (this.currentModel ? 'modelo' : 'carrocería'));
            this.showToast(`Error al eliminar ${itemType}: ` + error.message, 'error');
        } finally {
            this.showLoading(false);
        }
    }
    
    // [Todas las funciones de filtros y búsqueda permanecen iguales]
    
    // Manejar búsqueda
    handleSearch(e) {
        const query = e.target.value.toLowerCase();
        
        // Debounce search
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            if (this.currentSubModule === 'marcas') {
                this.filterBrands(query);
            } else if (this.currentSubModule === 'modelos') {
                this.filterModels('', '');
            } else if (this.currentSubModule === 'carrocerias') {
                this.filterCarrocerias(query, '');
            } else {
                this.filterVehicles(query);
            }
        }, 300);
    }
    
    // Manejar filtro por estado
    handleFilter(e) {
        const filter = e.target.value;
        this.filterVehicles('', filter);
    }
    
    // Manejar filtro de marcas por estado
    handleBrandFilter(e) {
        const filter = e.target.value;
        this.filterBrands('', filter);
    }
    
    // Manejar filtro de marca en modelos
    handleModelBrandFilter(e) {
        const filter = e.target.value;
        this.filterModels(filter, document.getElementById('modelFilterSelect').value);
    }
    
    // Manejar filtro de estado en modelos
    handleModelFilter(e) {
        const filter = e.target.value;
        this.filterModels(document.getElementById('modelBrandFilterSelect').value, filter);
    }
    
    // Manejar filtro de estado en carrocerías
    handleCarroceriaFilter(e) {
        const filter = e.target.value;
        this.filterCarrocerias('', filter);
    }
    
    // Filtrar vehículos
    filterVehicles(searchQuery = '', statusFilter = '') {
        let filteredVehicles = [...this.vehicles];
        
        // Aplicar filtro de búsqueda
        if (searchQuery) {
            filteredVehicles = filteredVehicles.filter(vehicle => 
                vehicle.placa.toLowerCase().includes(searchQuery) ||
                vehicle.marcas?.nombre?.toLowerCase().includes(searchQuery) ||
                vehicle.modelos?.nombre?.toLowerCase().includes(searchQuery) ||
                vehicle.carrocerias?.nombre?.toLowerCase().includes(searchQuery) ||
                vehicle.color?.toLowerCase().includes(searchQuery) ||
                vehicle.vin?.toLowerCase().includes(searchQuery) ||
                this.formatCombustible(vehicle.combustible).toLowerCase().includes(searchQuery) ||
                this.formatColones(vehicle.leasing_semanal).toLowerCase().includes(searchQuery)
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
                <td><strong class="text-navy">${vehicle.placa}</strong></td>
                <td>${vehicle.marcas?.nombre || '-'}</td>
                <td>${vehicle.modelos?.nombre || '-'}</td>
                <td>${vehicle.año}</td>
                <td>${vehicle.carrocerias?.nombre || '-'}</td>
                <td>${vehicle.color || '-'}</td>
                <td>${this.formatCombustible(vehicle.combustible)}</td>
                <td class="text-end fw-semibold text-success">${this.formatColones(vehicle.leasing_semanal)}</td>
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
    
    // Filtrar marcas
    filterBrands(searchQuery = '', statusFilter = '') {
        let filteredBrands = [...this.brands];
        
        // Aplicar filtro de búsqueda
        if (searchQuery) {
            filteredBrands = filteredBrands.filter(brand => 
                brand.nombre.toLowerCase().includes(searchQuery)
            );
        }
        
        // Aplicar filtro de estado
        if (statusFilter) {
            filteredBrands = filteredBrands.filter(brand => 
                brand.estado === statusFilter
            );
        }
        
        // Renderizar marcas filtradas
        this.renderFilteredBrands(filteredBrands);
    }
    
    // Filtrar modelos
    filterModels(brandFilter = '', statusFilter = '') {
        let filteredModels = [...this.models];
        
        // Aplicar filtro de marca
        if (brandFilter) {
            filteredModels = filteredModels.filter(model => 
                model.marca_id == brandFilter
            );
        }
        
        // Aplicar filtro de estado
        if (statusFilter) {
            filteredModels = filteredModels.filter(model => model.estado === statusFilter);
        }
        
        this.renderFilteredModels(filteredModels);
    }
    
    // Filtrar carrocerías
    filterCarrocerias(searchQuery = '', statusFilter = '') {
        let filteredCarrocerias = [...this.carrocerias];
        
        // Aplicar filtro de búsqueda
        if (searchQuery) {
            filteredCarrocerias = filteredCarrocerias.filter(carroceria => 
                carroceria.nombre.toLowerCase().includes(searchQuery) ||
                (carroceria.descripcion && carroceria.descripcion.toLowerCase().includes(searchQuery))
            );
        }
        
        // Aplicar filtro de estado
        if (statusFilter) {
            filteredCarrocerias = filteredCarrocerias.filter(carroceria => 
                carroceria.estado === statusFilter
            );
        }
        
        this.renderFilteredCarrocerias(filteredCarrocerias);
    }
    
    // Renderizar marcas filtradas
    renderFilteredBrands(brands) {
        const tbody = document.getElementById('brandsTableBody');
        const emptyState = document.getElementById('emptyBrandsState');
        const brandsTable = document.getElementById('brandsTable');
        
        if (brands.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            brandsTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        brandsTable.style.display = 'block';
        
        tbody.innerHTML = brands.map(brand => `
            <tr>
                <td><span class="badge bg-secondary">${brand.id}</span></td>
                <td><strong class="text-navy">${brand.nombre}</strong></td>
                <td>
                    <span class="vehicle-status status-${brand.estado}">
                        ${brand.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editBrand(${brand.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteBrand(${brand.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Renderizar modelos filtrados
    renderFilteredModels(models) {
        const tbody = document.getElementById('modelsTableBody');
        const emptyState = document.getElementById('emptyModelsState');
        const modelsTable = document.getElementById('modelsTable');
        
        if (models.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            modelsTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        modelsTable.style.display = 'block';
        
        tbody.innerHTML = models.map(model => `
            <tr>
                <td><span class="badge bg-secondary">${model.id}</span></td>
                <td><strong class="text-navy">${model.nombre}</strong></td>
                <td>${model.marcas?.nombre || '-'}</td>
                <td>
                    <span class="vehicle-status status-${model.estado}">
                        ${model.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editModel(${model.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteModel(${model.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    // Renderizar carrocerías filtradas
    renderFilteredCarrocerias(carrocerias) {
        const tbody = document.getElementById('carroceriasTableBody');
        const emptyState = document.getElementById('emptyCarroceriasState');
        const carroceriasTable = document.getElementById('carroceriasTable');
        
        if (carrocerias.length === 0) {
            tbody.innerHTML = '';
            emptyState.style.display = 'block';
            carroceriasTable.style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        carroceriasTable.style.display = 'block';
        
        tbody.innerHTML = carrocerias.map(carroceria => `
            <tr>
                <td><span class="badge bg-secondary">${carroceria.id}</span></td>
                <td><strong class="text-navy">${carroceria.nombre}</strong></td>
                <td>${carroceria.descripcion || '-'}</td>
                <td>
                    <span class="vehicle-status status-${carroceria.estado}">
                        ${carroceria.estado}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="app.editCarroceria(${carroceria.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="app.deleteCarroceria(${carroceria.id})" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
}

// Inicializar aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.app = new VictorApp();
});

// Manejar redimensionamiento de ventana para sidebar responsivo
window.addEventListener('resize', function() {
    // Bootstrap maneja la responsividad automáticamente
    // No necesitamos código adicional para esto
});