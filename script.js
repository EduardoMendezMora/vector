// Véctor - Sistema de Administración de Flotilla
// JavaScript principal para la funcionalidad de la aplicación

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
        // Sidebar toggle
        document.getElementById('toggleBtn').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('mobileToggle').addEventListener('click', () => this.toggleSidebar());
        
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
        
        // Modal events
        document.getElementById('modalClose').addEventListener('click', () => this.hideVehicleModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.hideVehicleModal());
        document.getElementById('vehicleForm').addEventListener('submit', (e) => this.handleVehicleSubmit(e));
        
        // Brand modal events
        document.getElementById('brandModalClose').addEventListener('click', () => this.hideBrandModal());
        document.getElementById('cancelBrandBtn').addEventListener('click', () => this.hideBrandModal());
        document.getElementById('brandForm').addEventListener('submit', (e) => this.handleBrandSubmit(e));
        
        // Model modal events
        document.getElementById('modelModalClose').addEventListener('click', () => this.hideModelModal());
        document.getElementById('cancelModelBtn').addEventListener('click', () => this.hideModelModal());
        document.getElementById('modelForm').addEventListener('submit', (e) => this.handleModelSubmit(e));
        
        // Carrocería modal events
        document.getElementById('carroceriaModalClose').addEventListener('click', () => this.hideCarroceriaModal());
        document.getElementById('cancelCarroceriaBtn').addEventListener('click', () => this.hideCarroceriaModal());
        document.getElementById('carroceriaForm').addEventListener('submit', (e) => this.handleCarroceriaSubmit(e));
        
        // Delete modal events
        document.getElementById('deleteModalClose').addEventListener('click', () => this.hideDeleteModal());
        document.getElementById('cancelDeleteBtn').addEventListener('click', () => this.hideDeleteModal());
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
        
        // Close modals on outside click
        document.getElementById('vehicleModal').addEventListener('click', (e) => {
            if (e.target.id === 'vehicleModal') this.hideVehicleModal();
        });
        
        document.getElementById('brandModal').addEventListener('click', (e) => {
            if (e.target.id === 'brandModal') this.hideBrandModal();
        });
        
        document.getElementById('modelModal').addEventListener('click', (e) => {
            if (e.target.id === 'modelModal') this.hideModelModal();
        });
        
        document.getElementById('carroceriaModal').addEventListener('click', (e) => {
            if (e.target.id === 'carroceriaModal') this.hideCarroceriaModal();
        });
        
        document.getElementById('deleteModal').addEventListener('click', (e) => {
            if (e.target.id === 'deleteModal') this.hideDeleteModal();
        });
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
        
        const link = e.target.closest('.nav-link');
        const module = link.dataset.module;
        const submodule = link.dataset.submodule;
        
        // Remover clase active de todos los elementos
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Agregar clase active al elemento clickeado
        e.target.closest('.nav-item').classList.add('active');
        
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
        document.getElementById('brandsTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'none';
        document.getElementById('carroceriasTable').style.display = 'none';
        document.getElementById('vehiclesTable').style.display = 'block';
        document.getElementById('emptyBrandsState').style.display = 'none';
        document.getElementById('emptyModelsState').style.display = 'none';
        document.getElementById('emptyCarroceriasState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Vehículo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Vehículo';
        
        // Cargar datos en orden correcto
        await this.loadInitialData();
    }
    
    // Mostrar módulo de marcas
    showBrandsModule() {
        // Ocultar otras tablas y mostrar tabla de marcas
        document.getElementById('vehiclesTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'none';
        document.getElementById('carroceriasTable').style.display = 'none';
        document.getElementById('brandsTable').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('emptyModelsState').style.display = 'none';
        document.getElementById('emptyCarroceriasState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Marca';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primera Marca';
        
        // Cargar marcas
        this.loadBrands(true);
    }
    
    // Mostrar módulo de modelos
    showModelsModule() {
        // Ocultar otras tablas y mostrar tabla de modelos
        document.getElementById('vehiclesTable').style.display = 'none';
        document.getElementById('brandsTable').style.display = 'none';
        document.getElementById('carroceriasTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('emptyBrandsState').style.display = 'none';
        document.getElementById('emptyCarroceriasState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Modelo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Modelo';
        
        // Cargar modelos
        this.loadModels(true);
    }
    
    // Mostrar módulo de carrocerías
    showCarroceriasModule() {
        // Ocultar otras tablas y mostrar tabla de carrocerías
        document.getElementById('vehiclesTable').style.display = 'none';
        document.getElementById('brandsTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'none';
        document.getElementById('carroceriasTable').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('emptyBrandsState').style.display = 'none';
        document.getElementById('emptyModelsState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Carrocería';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primera Carrocería';
        
        // Cargar carrocerías
        this.loadCarrocerias(true);
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
    
    // Renderizar tarjetas de vehículos
    renderVehicles() {
        const vehiclesGrid = document.getElementById('vehiclesGrid');
        const emptyState = document.getElementById('emptyState');
        const vehiclesTable = document.getElementById('vehiclesTable');
        
        if (this.vehicles.length === 0) {
            vehiclesGrid.innerHTML = '';
            emptyState.style.display = 'block';
            vehiclesTable.querySelector('.vehicles-container').style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        vehiclesTable.querySelector('.vehicles-container').style.display = 'block';
        
        vehiclesGrid.innerHTML = this.vehicles.map(vehicle => `
            <div class="col-lg-4 col-md-6 col-sm-12">
                <div class="vehicle-card">
                    <div class="vehicle-card-header">
                        <div class="vehicle-plate">${vehicle.placa}</div>
                        <div class="vehicle-brand-model">
                            ${vehicle.marcas?.nombre || 'Sin marca'} ${vehicle.modelos?.nombre || 'Sin modelo'}
                        </div>
                        <div class="vehicle-year">${vehicle.año}</div>
                    </div>
                    <div class="vehicle-card-body">
                        <div class="vehicle-specs">
                            <div class="spec-item">
                                <i class="fas fa-car-side"></i>
                                <span class="spec-value">${vehicle.carrocerias?.nombre || 'Sin carrocería'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-gas-pump"></i>
                                <span class="spec-value">${vehicle.combustible || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-cogs"></i>
                                <span class="spec-value">${vehicle.transmision || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-road"></i>
                                <span class="spec-value">${vehicle.traccion || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-palette"></i>
                                <span class="spec-value">${vehicle.color || 'Sin color'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <span class="spec-value">${vehicle.cilindrada || 0} cc</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="vehicle-status status-${vehicle.estado}">
                                ${vehicle.estado}
                            </span>
                        </div>
                        
                        <div class="vehicle-actions">
                            <button class="btn-action btn-edit" onclick="app.editVehicle(${vehicle.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                                Editar
                            </button>
                            <button class="btn-action btn-delete" onclick="app.deleteVehicle(${vehicle.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // También actualizar el tbody oculto para compatibilidad
        const tbody = document.getElementById('vehiclesTableBody');
        if (tbody) {
            tbody.innerHTML = this.vehicles.map(vehicle => `
                <tr style="display: none;">
                    <td>${vehicle.placa}</td>
                    <td>${vehicle.marcas?.nombre || '-'}</td>
                    <td>${vehicle.modelos?.nombre || '-'}</td>
                    <td>${vehicle.año}</td>
                    <td>${vehicle.carrocerias?.nombre || '-'}</td>
                    <td>${vehicle.color || '-'}</td>
                    <td>${vehicle.combustible || '-'}</td>
                    <td>${vehicle.estado}</td>
                </tr>
            `).join('');
        }
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
                <td>${brand.id}</td>
                <td><strong>${brand.nombre}</strong></td>
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
                <td>${model.id}</td>
                <td><strong>${model.nombre}</strong></td>
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
                <td>${carroceria.id}</td>
                <td><strong>${carroceria.nombre}</strong></td>
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
    
    // Mostrar modal de vehículo
    async showVehicleModal(vehicle = null) {
        const modal = document.getElementById('vehicleModal');
        const modalTitle = document.getElementById('modalTitle');
        const form = document.getElementById('vehicleForm');
        
        this.currentVehicle = vehicle;
        this.isEditing = !!vehicle;
        
        if (this.isEditing) {
            modalTitle.textContent = 'Editar Vehículo';
        } else {
            modalTitle.textContent = 'Agregar Vehículo';
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
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Si está editando, llenar el formulario y cargar modelos DESPUÉS de mostrar el modal
        if (this.isEditing) {
            // Usar setTimeout para asegurar que los selectores estén listos
            setTimeout(() => {
                // Primero llenar los campos normales
                this.populateFormFields(vehicle);
                
                // Luego establecer la marca
                if (vehicle.marca_id || vehicle.marca) {
                    const marcaId = vehicle.marca_id || vehicle.marca;
                    console.log('Estableciendo marca con ID:', marcaId);
                    const marcaSelect = document.getElementById('marca');
                    if (marcaSelect) {
                        marcaSelect.value = marcaId;
                        console.log('Marca establecida:', marcaSelect.value);
                        
                        // Cargar modelos de esta marca
                        this.populateModelsDropdown(marcaId);
                        
                        // Establecer el modelo después de cargar las opciones
                        setTimeout(() => {
                            if (vehicle.modelo_id || vehicle.modelo) {
                                const modeloId = vehicle.modelo_id || vehicle.modelo;
                                console.log('Estableciendo modelo con ID:', modeloId);
                                const modeloSelect = document.getElementById('modelo');
                                if (modeloSelect) {
                                    modeloSelect.value = modeloId;
                                    console.log('Modelo establecido:', modeloSelect.value);
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
        const modal = document.getElementById('vehicleModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentVehicle = null;
        this.isEditing = false;
    }
    
    // Mostrar modal de marca
    showBrandModal(brand = null) {
        const modal = document.getElementById('brandModal');
        const modalTitle = document.getElementById('brandModalTitle');
        const form = document.getElementById('brandForm');
        
        this.currentBrand = brand;
        this.isEditingBrand = !!brand;
        
        if (this.isEditingBrand) {
            modalTitle.textContent = 'Editar Marca';
            this.populateBrandForm(brand);
        } else {
            modalTitle.textContent = 'Agregar Marca';
            form.reset();
        }
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('brandName').focus();
        }, 100);
    }
    
    // Ocultar modal de marca
    hideBrandModal() {
        const modal = document.getElementById('brandModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentBrand = null;
        this.isEditingBrand = false;
    }
    
    // Llenar formulario de marca con datos
    populateBrandForm(brand) {
        document.getElementById('brandName').value = brand.nombre || '';
    }
    
    // Mostrar modal de modelo
    showModelModal(model = null) {
        const modal = document.getElementById('modelModal');
        const modalTitle = document.getElementById('modelModalTitle');
        const form = document.getElementById('modelForm');
        
        this.currentModel = model;
        this.isEditingModel = !!model;
        
        if (this.isEditingModel) {
            modalTitle.textContent = 'Editar Modelo';
            this.populateModelForm(model);
        } else {
            modalTitle.textContent = 'Agregar Modelo';
            form.reset();
        }
        
        // Llenar selector de marcas
        this.populateModelBrandSelector();
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('modelBrand').focus();
        }, 100);
    }
    
    // Ocultar modal de modelo
    hideModelModal() {
        const modal = document.getElementById('modelModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentModel = null;
        this.isEditingModel = false;
    }
    
    // Mostrar modal de carrocería
    showCarroceriaModal(carroceria = null) {
        const modal = document.getElementById('carroceriaModal');
        const modalTitle = document.getElementById('carroceriaModalTitle');
        const form = document.getElementById('carroceriaForm');
        
        this.currentCarroceria = carroceria;
        this.isEditingCarroceria = !!carroceria;
        
        if (this.isEditingCarroceria) {
            modalTitle.textContent = 'Editar Carrocería';
            this.populateCarroceriaForm(carroceria);
        } else {
            modalTitle.textContent = 'Agregar Carrocería';
            form.reset();
        }
        
        modal.classList.add('show');
        modal.style.display = 'flex';
        
        // Focus en el primer campo
        setTimeout(() => {
            document.getElementById('carroceriaName').focus();
        }, 100);
    }
    
    // Ocultar modal de carrocería
    hideCarroceriaModal() {
        const modal = document.getElementById('carroceriaModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentCarroceria = null;
        this.isEditingCarroceria = false;
    }
    
    // Llenar formulario de carrocería con datos
    populateCarroceriaForm(carroceria) {
        document.getElementById('carroceriaName').value = carroceria.nombre || '';
        document.getElementById('carroceriaDescripcion').value = carroceria.descripcion || '';
    }
    
    // Llenar formulario de modelo con datos
    populateModelForm(model) {
        document.getElementById('modelBrand').value = model.marca_id || '';
        document.getElementById('modelName').value = model.nombre || '';
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
    
    // Llenar campos normales del formulario (sin selectores)
    populateFormFields(vehicle) {
        console.log('Llenando campos del formulario con vehículo:', vehicle);
        
        const fields = [
            'placa', 'año', 
            'cilindrada', 'cilindros', 'combustible', 'transmision', 
            'traccion', 'color', 'vin'
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
    
    // Llenar formulario con datos del vehículo (función original mantenida para compatibilidad)
    populateForm(vehicle) {
        console.log('Llenando formulario con vehículo:', vehicle);
        
        const fields = [
            'placa', 'año', 'carroceria', 
            'cilindrada', 'cilindros', 'combustible', 'transmision', 
            'traccion', 'color', 'vin'
        ];
        
        // Llenar campos normales
        fields.forEach(field => {
            const element = document.getElementById(field);
            if (element && vehicle[field]) {
                element.value = vehicle[field];
            }
        });
        
        // Llenar selectores de marca y modelo con los IDs
        if (vehicle.marca_id) {
            console.log('Estableciendo marca_id:', vehicle.marca_id);
            const marcaSelect = document.getElementById('marca');
            if (marcaSelect) {
                marcaSelect.value = vehicle.marca_id;
                console.log('Marca establecida:', marcaSelect.value);
            }
        }
        
        if (vehicle.modelo_id) {
            console.log('Estableciendo modelo_id:', vehicle.modelo_id);
            const modeloSelect = document.getElementById('modelo');
            if (modeloSelect) {
                modeloSelect.value = vehicle.modelo_id;
                console.log('Modelo establecido:', modeloSelect.value);
            }
        }
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
    
    // Mostrar modal de confirmación de eliminación
    showDeleteModal() {
        const modal = document.getElementById('deleteModal');
        const title = document.getElementById('deleteModalTitle');
        const message = document.getElementById('deleteModalMessage');
        
        if (this.currentVehicle) {
            title.textContent = 'Confirmar Eliminación de Vehículo';
            message.textContent = `¿Estás seguro de que deseas eliminar el vehículo ${this.currentVehicle.placa}?`;
        } else if (this.currentBrand) {
            title.textContent = 'Confirmar Eliminación de Marca';
            message.textContent = `¿Estás seguro de que deseas eliminar la marca ${this.currentBrand.nombre}?`;
        } else if (this.currentModel) {
            title.textContent = 'Confirmar Eliminación de Modelo';
            message.textContent = `¿Estás seguro de que deseas eliminar el modelo ${this.currentModel.nombre}?`;
        } else if (this.currentCarroceria) {
            title.textContent = 'Confirmar Eliminación de Carrocería';
            message.textContent = `¿Estás seguro de que deseas eliminar la carrocería ${this.currentCarroceria.nombre}?`;
        }
        
        modal.classList.add('show');
        modal.style.display = 'flex';
    }
    
    // Ocultar modal de confirmación de eliminación
    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
        
        this.currentVehicle = null;
        this.currentBrand = null;
        this.currentModel = null;
        this.currentCarroceria = null;
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
        const vehiclesGrid = document.getElementById('vehiclesGrid');
        const emptyState = document.getElementById('emptyState');
        const vehiclesTable = document.getElementById('vehiclesTable');
        
        if (vehicles.length === 0) {
            vehiclesGrid.innerHTML = '';
            emptyState.style.display = 'block';
            vehiclesTable.querySelector('.vehicles-container').style.display = 'none';
            return;
        }
        
        emptyState.style.display = 'none';
        vehiclesTable.querySelector('.vehicles-container').style.display = 'block';
        
        vehiclesGrid.innerHTML = vehicles.map(vehicle => `
            <div class="col-lg-4 col-md-6 col-sm-12">
                <div class="vehicle-card">
                    <div class="vehicle-card-header">
                        <div class="vehicle-plate">${vehicle.placa}</div>
                        <div class="vehicle-brand-model">
                            ${vehicle.marcas?.nombre || 'Sin marca'} ${vehicle.modelos?.nombre || 'Sin modelo'}
                        </div>
                        <div class="vehicle-year">${vehicle.año}</div>
                    </div>
                    <div class="vehicle-card-body">
                        <div class="vehicle-specs">
                            <div class="spec-item">
                                <i class="fas fa-car-side"></i>
                                <span class="spec-value">${vehicle.carrocerias?.nombre || 'Sin carrocería'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-gas-pump"></i>
                                <span class="spec-value">${vehicle.combustible || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-cogs"></i>
                                <span class="spec-value">${vehicle.transmision || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-road"></i>
                                <span class="spec-value">${vehicle.traccion || 'Sin especificar'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-palette"></i>
                                <span class="spec-value">${vehicle.color || 'Sin color'}</span>
                            </div>
                            <div class="spec-item">
                                <i class="fas fa-tachometer-alt"></i>
                                <span class="spec-value">${vehicle.cilindrada || 0} cc</span>
                            </div>
                        </div>
                        
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="vehicle-status status-${vehicle.estado}">
                                ${vehicle.estado}
                            </span>
                        </div>
                        
                        <div class="vehicle-actions">
                            <button class="btn-action btn-edit" onclick="app.editVehicle(${vehicle.id})" title="Editar">
                                <i class="fas fa-edit"></i>
                                Editar
                            </button>
                            <button class="btn-action btn-delete" onclick="app.deleteVehicle(${vehicle.id})" title="Eliminar">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // También actualizar el tbody oculto para compatibilidad
        const tbody = document.getElementById('vehiclesTableBody');
        if (tbody) {
            tbody.innerHTML = vehicles.map(vehicle => `
                <tr style="display: none;">
                    <td>${vehicle.placa}</td>
                    <td>${vehicle.marcas?.nombre || '-'}</td>
                    <td>${vehicle.modelos?.nombre || '-'}</td>
                    <td>${vehicle.año}</td>
                    <td>${vehicle.carrocerias?.nombre || '-'}</td>
                    <td>${vehicle.color || '-'}</td>
                    <td>${vehicle.combustible || '-'}</td>
                    <td>${vehicle.estado}</td>
                </tr>
            `).join('');
        }
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
                <td>${brand.id}</td>
                <td><strong>${brand.nombre}</strong></td>
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
                <td>${model.id}</td>
                <td><strong>${model.nombre}</strong></td>
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
                <td>${carroceria.id}</td>
                <td><strong>${carroceria.nombre}</strong></td>
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
