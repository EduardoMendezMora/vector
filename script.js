// Véctor - Sistema de Administración de Flotilla
// JavaScript principal para la funcionalidad de la aplicación

class VictorApp {
    constructor() {
        this.currentVehicle = null;
        this.currentBrand = null;
        this.currentModel = null;
        this.vehicles = [];
        this.brands = [];
        this.models = [];
        this.isEditing = false;
        this.isEditingBrand = false;
        this.isEditingModel = false;
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
        }
    }
    
    // Mostrar módulo de vehículos
    showVehiclesModule() {
        // Ocultar otras tablas y mostrar tabla de vehículos
        document.getElementById('brandsTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'none';
        document.getElementById('vehiclesTable').style.display = 'block';
        document.getElementById('emptyBrandsState').style.display = 'none';
        document.getElementById('emptyModelsState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Vehículo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Vehículo';
        
        // Cargar vehículos, marcas y modelos
        this.loadVehicles();
        this.loadBrands();
        this.loadModels();
    }
    
    // Mostrar módulo de marcas
    showBrandsModule() {
        // Ocultar otras tablas y mostrar tabla de marcas
        document.getElementById('vehiclesTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'none';
        document.getElementById('brandsTable').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('emptyModelsState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Marca';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primera Marca';
        
        // Cargar marcas
        this.loadBrands();
    }
    
    // Mostrar módulo de modelos
    showModelsModule() {
        // Ocultar otras tablas y mostrar tabla de modelos
        document.getElementById('vehiclesTable').style.display = 'none';
        document.getElementById('brandsTable').style.display = 'none';
        document.getElementById('modelsTable').style.display = 'block';
        document.getElementById('emptyState').style.display = 'none';
        document.getElementById('emptyBrandsState').style.display = 'none';
        
        // Actualizar botones
        document.getElementById('addBtnText').textContent = 'Agregar Modelo';
        document.getElementById('addFirstBtnText').textContent = 'Agregar Primer Modelo';
        
        // Cargar modelos
        this.loadModels();
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
    async loadBrands() {
        try {
            this.showLoading(true);
            
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
            this.renderBrands();
            
        } catch (error) {
            console.error('Error al cargar marcas:', error);
            this.showToast('Error al cargar marcas: ' + error.message, 'error');
            this.brands = [];
            this.renderBrands();
        } finally {
            this.showLoading(false);
        }
    }
    
    // Cargar modelos desde Supabase
    async loadModels() {
        try {
            this.showLoading(true);
            
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
            this.renderModels();
            this.populateModelBrandFilter();
            
        } catch (error) {
            console.error('Error al cargar modelos:', error);
            this.showToast('Error al cargar modelos: ' + error.message, 'error');
            this.models = [];
            this.renderModels();
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
                <td>${vehicle.marcas?.nombre || '-'}</td>
                <td>${vehicle.modelos?.nombre || '-'}</td>
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
    
    // Mostrar modal de agregar (vehículo, marca o modelo)
    showAddModal() {
        if (this.currentSubModule === 'marcas') {
            this.showBrandModal();
        } else if (this.currentSubModule === 'modelos') {
            this.showModelModal();
        } else {
            this.showVehicleModal();
        }
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
        
        // Llenar selectores
        this.populateBrandsDropdown();
        
        // Si está editando, cargar modelos de la marca seleccionada
        if (this.isEditing && vehicle.marca) {
            this.populateModelsDropdown(vehicle.marca);
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
            this.loadBrands();
            
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
            this.loadModels();
            
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
    
    // Manejar cambio de marca en vehículo
    handleMarcaChange(e) {
        const marcaId = e.target.value;
        this.populateModelsDropdown(marcaId);
    }
    
    // Llenar selector de modelos según la marca seleccionada
    populateModelsDropdown(marcaId) {
        const selector = document.getElementById('modelo');
        const currentValue = selector.value;
        
        selector.innerHTML = '<option value="">Seleccionar modelo...</option>';
        
        if (marcaId) {
            const modelsForBrand = this.models.filter(model => 
                model.marca_id == marcaId && model.estado === 'activo'
            );
            
            modelsForBrand.forEach(model => {
                const option = document.createElement('option');
                option.value = model.id;
                option.textContent = model.nombre;
                selector.appendChild(option);
            });
        }
        
        if (currentValue) {
            selector.value = currentValue;
        }
    }
    
    // Llenar selector de marcas en el modal de vehículo
    populateBrandsDropdown() {
        const selector = document.getElementById('marca');
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
    }
    
    // Confirmar eliminación
    async confirmDelete() {
        if (!this.currentVehicle && !this.currentBrand && !this.currentModel) return;
        
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
                this.loadBrands();
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
                this.loadModels();
                this.showToast('Modelo eliminado exitosamente', 'success');
            }
            
        } catch (error) {
            console.error('Error al eliminar:', error);
            const itemType = this.currentVehicle ? 'vehículo' : (this.currentBrand ? 'marca' : 'modelo');
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
                <td>${vehicle.marcas?.nombre || '-'}</td>
                <td>${vehicle.modelos?.nombre || '-'}</td>
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
