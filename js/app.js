// Aplicación principal
class FunerariaApp {
    constructor() {
        this.state = {
            user: null,
            currentPage: 'dashboard',
            currentModal: null,
            editingId: null,
            data: {
                clientes: [],
                funerarias: [],
                recuerdos: [],
                usuarios: [],
                familiares: []
            }
        };

        this.init();
    }

    async init() {
        this.checkAuth();
        this.setupEventListeners();
        
        // Cargar datos iniciales si está autenticado
        if (this.state.user) {
            await this.loadInitialData();
        }
    }

    checkAuth() {
        this.state.user = authService.getCurrentUser();
        if (this.state.user) {
            this.showMainSystem();
        } else {
            this.showLogin();
        }
    }

    showLogin() {
        document.getElementById('loginPage').classList.remove('d-none');
        document.getElementById('mainSystem').classList.add('d-none');
    }

    showMainSystem() {
        document.getElementById('loginPage').classList.add('d-none');
        document.getElementById('mainSystem').classList.remove('d-none');
        this.initializeUserInterface();
        this.loadDashboard();
    }

    setupEventListeners() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));
        document.getElementById('logoutBtn').addEventListener('click', () => this.handleLogout());
        document.getElementById('sidebarToggle').addEventListener('click', () => this.toggleSidebar());
        document.getElementById('modalSaveBtn').addEventListener('click', () => this.handleSaveModal());
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const loginBtn = document.getElementById('loginBtn');
        const loginText = document.getElementById('loginText');
        const loginSpinner = document.getElementById('loginSpinner');

        if (!username || !password) {
            showAlert('Por favor, complete todos los campos', 'warning');
            return;
        }

        // Mostrar loading
        loginText.classList.add('d-none');
        loginSpinner.classList.remove('d-none');
        loginBtn.disabled = true;

        /*cosas para prueba*/

        try {
            const usuarios = await usuariosService.getAll();
            console.log('✅ usuariosService.getAll() respondió:', usuarios);
        } catch (serviceError) {
            console.error('❌ Error en usuariosService.getAll():', serviceError);
            console.error('📋 Detalles del error:', {
                message: serviceError.message,
                response: serviceError.response?.data,
                status: serviceError.response?.status
            });
        }

        /*termino de prueba*/

        try {

        

            const result = await authService.login({ username, password });
            
            if (result.success) {
                this.state.user = result.user;
                this.showMainSystem();
                showAlert(`Bienvenido ${result.user.nombre}`, 'success');
                
                // Cargar datos iniciales
                await this.loadInitialData();
            } else {
                showAlert(result.message, 'danger');
            }
        } catch (error) {
            showAlert('Error en el servidor', 'danger');
        } finally {
            loginText.classList.remove('d-none');
            loginSpinner.classList.add('d-none');
            loginBtn.disabled = false;
        }
    }

    handleLogout() {
        if (confirm('¿Está seguro de que desea cerrar sesión?')) {
            authService.logout();
            this.state.user = null;
            this.showLogin();
            document.getElementById('loginForm').reset();
        }
    }

    initializeUserInterface() {
        if (!this.state.user) return;

        document.getElementById('userName').textContent = this.state.user.nombre;
        document.getElementById('userRoleDisplay').textContent = this.getRoleDisplayName(this.state.user.rol);
        this.setupMenuForRole(this.state.user.rol);
        this.setupDashboardButtons(this.state.user.rol);
    }

    getRoleDisplayName(role) {
        const roleNames = {
            'admin': 'Administrador',
            'funeraria': 'Funeraria',
            'trabajador': 'Trabajador',
            'cliente': 'Cliente'
        };
        return roleNames[role] || 'Usuario';
    }

    setupMenuForRole(role) {
        const menuContainer = document.getElementById('mainMenu');
        menuContainer.innerHTML = '';

        const menuItems = this.getMenuItemsForRole(role);
        
        menuItems.forEach(item => {
            const li = document.createElement('li');
            const a = document.createElement('a');
            a.href = '#';
            a.className = item.id === 'dashboard' ? 'active' : '';
            a.innerHTML = `<i class="bi ${item.icon}"></i> ${item.text}`;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToPage(item.id);
            });
            li.appendChild(a);
            menuContainer.appendChild(li);
        });
    }

    getMenuItemsForRole(role) {
        const baseMenu = [
            { id: 'dashboard', text: 'Dashboard', icon: 'bi-speedometer2' }
        ];

        const roleMenus = {
            'admin': [
                ...baseMenu,
                { id: 'clientes', text: 'Clientes', icon: 'bi-people' },
                { id: 'funerarias', text: 'Funerarias', icon: 'bi-building' },
                { id: 'recuerdos', text: 'Recuerdos', icon: 'bi-journal-text' },
                { id: 'usuarios', text: 'Usuarios', icon: 'bi-person-badge' },
                { id: 'familiares', text: 'Familiares', icon: 'bi-diagram-3' }
            ],
            'funeraria': [
                ...baseMenu,
                { id: 'clientes', text: 'Clientes', icon: 'bi-people' },
                { id: 'recuerdos', text: 'Recuerdos', icon: 'bi-journal-text' },
                { id: 'familiares', text: 'Familiares', icon: 'bi-diagram-3' }
            ],
            'trabajador': [
                ...baseMenu,
                { id: 'clientes', text: 'Clientes', icon: 'bi-people' },
                { id: 'recuerdos', text: 'Recuerdos', icon: 'bi-journal-text' },
                { id: 'familiares', text: 'Familiares', icon: 'bi-diagram-3' }
            ],
            'cliente': [
                ...baseMenu,
                { id: 'perfil', text: 'Mi Perfil', icon: 'bi-person' },
                { id: 'recuerdos', text: 'Mis Recuerdos', icon: 'bi-journal-text' },
                { id: 'familiares', text: 'Mis Familiares', icon: 'bi-diagram-3' }
            ]
        };

        return roleMenus[role] || baseMenu;
    }

    setupDashboardButtons(role) {
        const container = document.getElementById('dashboardButtons');
        container.innerHTML = '';

        const buttons = {
            'admin': [
                { text: 'Nuevo Cliente', action: () => this.showModal('cliente'), icon: 'bi-plus-circle' },
                { text: 'Nueva Funeraria', action: () => this.showModal('funeraria'), icon: 'bi-building' }
            ],
            'funeraria': [
                { text: 'Nuevo Cliente', action: () => this.showModal('cliente'), icon: 'bi-plus-circle' },
                { text: 'Nuevo Recuerdo', action: () => this.showModal('recuerdo'), icon: 'bi-journal-plus' }
            ],
            'trabajador': [
                { text: 'Nuevo Cliente', action: () => this.showModal('cliente'), icon: 'bi-plus-circle' },
                { text: 'Nuevo Recuerdo', action: () => this.showModal('recuerdo'), icon: 'bi-journal-plus' }
            ],
            'cliente': [
                { text: 'Nuevo Recuerdo', action: () => this.showModal('recuerdo'), icon: 'bi-journal-plus' },
                { text: 'Agregar Familiar', action: () => this.showModal('familiar'), icon: 'bi-person-plus' }
            ]
        };

        const userButtons = buttons[role] || [];
        userButtons.forEach(btn => {
            const button = document.createElement('button');
            button.className = 'btn btn-primary-custom ms-2';
            button.innerHTML = `<i class="bi ${btn.icon} me-1"></i> ${btn.text}`;
            button.onclick = btn.action;
            container.appendChild(button);
        });
    }

    navigateToPage(pageId) {
        // Ocultar todas las páginas
        document.querySelectorAll('.page-content').forEach(page => {
            page.classList.add('d-none');
        });

        // Mostrar página seleccionada
        document.getElementById(`${pageId}Page`).classList.remove('d-none');
        document.getElementById('pageTitle').textContent = this.getPageTitle(pageId);

        // Actualizar menú activo
        document.querySelectorAll('.sidebar-menu a').forEach(link => {
            link.classList.remove('active');
        });
        event.target.classList.add('active');

        // Cargar datos de la página
        this.loadPageData(pageId);
    }

    getPageTitle(pageId) {
        const titles = {
            'dashboard': 'Dashboard',
            'clientes': 'Gestión de Clientes',
            'funerarias': 'Gestión de Funerarias',
            'recuerdos': 'Gestión de Recuerdos',
            'usuarios': 'Gestión de Usuarios',
            'familiares': 'Gestión de Familiares',
            'perfil': 'Mi Perfil'
        };
        return titles[pageId] || 'Sistema Funeraria';
    }

    async loadInitialData() {
        try {
            // Cargar datos básicos según el rol
            if (authService.hasPermission('admin')) {
                const [clientes, funerarias, recuerdos, usuarios] = await Promise.all([
                    clientesService.getAll(),
                    funerariasService.getAll(),
                    recuerdosService.getAll(),
                    usuariosService.getAll()
                ]);
                
                this.state.data.clientes = clientes.data || [];
                this.state.data.funerarias = funerarias.data || [];
                this.state.data.recuerdos = recuerdos.data || [];
                this.state.data.usuarios = usuarios.data || [];
            } else if (authService.hasPermission('funeraria')) {
                const clientes = await clientesService.getByFuneraria(this.state.user.id_funeraria);
                this.state.data.clientes = clientes.data || [];
            }
        } catch (error) {
            console.error('Error cargando datos iniciales:', error);
        }
    }

    async loadPageData(pageId) {
        try {
            switch (pageId) {
                case 'dashboard':
                    await this.loadDashboard();
                    break;
                case 'clientes':
                    await this.loadClientes();
                    break;
                case 'funerarias':
                    await this.loadFunerarias();
                    break;
                case 'recuerdos':
                    await this.loadRecuerdos();
                    break;
                case 'usuarios':
                    await this.loadUsuarios();
                    break;
                case 'familiares':
                    await this.loadFamiliares();
                    break;
                case 'perfil':
                    await this.loadPerfil();
                    break;
            }
        } catch (error) {
            console.error(`Error cargando página ${pageId}:`, error);
            showAlert('Error al cargar los datos', 'danger');
        }
    }

    async loadDashboard() {
        const statsContainer = document.getElementById('statsContainer');
        const roleContent = document.getElementById('roleSpecificContent');

        // Mostrar loading
        statsContainer.innerHTML = '<div class="col-12 text-center"><div class="loading-spinner"></div> Cargando estadísticas...</div>';
        roleContent.innerHTML = '<div class="text-center"><div class="loading-spinner"></div> Cargando contenido...</div>';

        try {
            // Cargar estadísticas
            let stats = {};
            if (authService.hasPermission('admin')) {
                const clientesStats = await clientesService.getStats();
                const funerariasStats = await funerariasService.getStats();
                stats = { ...clientesStats.data, ...funerariasStats.data };
            }

            this.renderStats(stats);
            this.renderRoleContent();

        } catch (error) {
            console.error('Error cargando dashboard:', error);
            // Datos de ejemplo para desarrollo
            const exampleStats = this.getExampleStatsForRole(this.state.user.rol);
            this.renderStats(exampleStats);
            this.renderRoleContent();
        }
    }

    renderStats(stats) {
        const statsContainer = document.getElementById('statsContainer');
        const user = this.state.user;

        const statsConfig = {
            'admin': [
                { title: 'Clientes', value: stats.totalClientes || 0, icon: 'bi-people', color: 'primary' },
                { title: 'Funerarias', value: stats.totalFunerarias || 0, icon: 'bi-building', color: 'success' },
                { title: 'Recuerdos', value: stats.totalRecuerdos || 0, icon: 'bi-journal-text', color: 'warning' },
                { title: 'Usuarios', value: stats.totalUsuarios || 0, icon: 'bi-person-badge', color: 'info' }
            ],
            'funeraria': [
                { title: 'Mis Clientes', value: this.state.data.clientes.length, icon: 'bi-people', color: 'primary' },
                { title: 'Recuerdos Activos', value: stats.totalRecuerdos || 0, icon: 'bi-journal-text', color: 'warning' },
                { title: 'Pendientes', value: stats.pendientes || 0, icon: 'bi-clock', color: 'danger' }
            ],
            'trabajador': [
                { title: 'Clientes Asignados', value: this.state.data.clientes.length, icon: 'bi-people', color: 'primary' },
                { title: 'Recuerdos Pendientes', value: stats.totalRecuerdos || 0, icon: 'bi-journal-text', color: 'warning' }
            ],
            'cliente': [
                { title: 'Mi Información', value: 'Completa', icon: 'bi-person-check', color: 'success' },
                { title: 'Familiares', value: stats.familiares || 0, icon: 'bi-diagram-3', color: 'primary' }
            ]
        };

        const userStats = statsConfig[user.rol] || statsConfig['cliente'];
        
        statsContainer.innerHTML = userStats.map(stat => `
            <div class="col-md-3 col-6">
                <div class="stats-card ${stat.color}">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h3 class="mb-0">${stat.value}</h3>
                            <small>${stat.title}</small>
                        </div>
                        <i class="bi ${stat.icon} fs-1 opacity-75"></i>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderRoleContent() {
        const roleContent = document.getElementById('roleSpecificContent');
        const user = this.state.user;

        const contentTemplates = {
            'admin': `
                <div class="row">
                    <div class="col-md-8">
                        <div class="card-custom">
                            <div class="card-header-custom">
                                <h5 class="mb-0"><i class="bi bi-people me-2"></i>Clientes Recientes</h5>
                            </div>
                            <div class="card-body">
                                <div class="table-responsive">
                                    <table class="table table-custom">
                                        <thead>
                                            <tr>
                                                <th>Nombre</th>
                                                <th>Fecha Registro</th>
                                                <th>Funeraria</th>
                                                <th>Estado</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${this.state.data.clientes.slice(0, 5).map(cliente => `
                                                <tr>
                                                    <td>${cliente.nombre}</td>
                                                    <td>${formatDate(cliente.created_at)}</td>
                                                    <td>${this.getFunerariaName(cliente.id_funeraria)}</td>
                                                    <td><span class="badge badge-success">Activo</span></td>
                                                </tr>
                                            `).join('') || '<tr><td colspan="4" class="text-center">No hay clientes</td></tr>'}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="card-custom">
                            <div class="card-header-custom">
                                <h5 class="mb-0"><i class="bi bi-activity me-2"></i>Actividad Reciente</h5>
                            </div>
                            <div class="card-body">
                                <p class="text-muted">No hay actividad reciente</p>
                            </div>
                        </div>
                    </div>
                </div>
            `,
            'cliente': `
                <div class="card-custom">
                    <div class="card-header-custom">
                        <h5 class="mb-0"><i class="bi bi-person me-2"></i>Mi Información Personal</h5>
                    </div>
                    <div class="card-body">
                        <p>Bienvenido a su perfil. Aquí puede gestionar su información personal y familiares.</p>
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Datos Personales</h6>
                                <p><strong>Nombre:</strong> ${user.nombre}</p>
                                <p><strong>Funeraria:</strong> ${user.funeraria_nombre || 'No asignada'}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Acciones</h6>
                                <button class="btn btn-primary-custom me-2 mb-2" onclick="app.showModal('perfil')">
                                    <i class="bi bi-pencil me-1"></i> Editar Perfil
                                </button>
                                <button class="btn btn-success me-2 mb-2" onclick="app.navigateToPage('familiares')">
                                    <i class="bi bi-people me-1"></i> Gestionar Familiares
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        };

        roleContent.innerHTML = contentTemplates[user.rol] || contentTemplates['cliente'];
    }

    getFunerariaName(funerariaId) {
        const funeraria = this.state.data.funerarias.find(f => f.id_funeraria === funerariaId);
        return funeraria ? funeraria.nombre : 'No asignada';
    }

    getExampleStatsForRole(role) {
        const stats = {
            'admin': { totalClientes: 145, totalFunerarias: 8, totalRecuerdos: 89, totalUsuarios: 23 },
            'funeraria': { totalClientes: 45, totalRecuerdos: 28, pendientes: 5 },
            'trabajador': { totalClientes: 15, totalRecuerdos: 12 },
            'cliente': { familiares: 3 }
        };
        return stats[role] || {};
    }

    toggleSidebar() {
        document.querySelector('.sidebar').classList.toggle('active');
        document.querySelector('.main-content').classList.toggle('active');
    }

    // Los métodos loadClientes, loadFunerarias, etc. se implementarían similarmente
    async loadClientes() {
        try {
            let clientes;
            if (authService.hasPermission('admin')) {
                clientes = await clientesService.getAll();
            } else if (authService.hasPermission('funeraria') || authService.hasPermission('trabajador')) {
                clientes = await clientesService.getByFuneraria(this.state.user.id_funeraria);
            } else {
                clientes = { data: [] };
            }

            this.renderClientesTable(clientes.data || []);
        } catch (error) {
            console.error('Error cargando clientes:', error);
            showAlert('Error al cargar los clientes', 'danger');
        }
    }

    renderClientesTable(clientes) {
        const tbody = document.getElementById('clientesTableBody');
        tbody.innerHTML = clientes.map(cliente => `
            <tr>
                <td>${cliente.id_cliente}</td>
                <td>${cliente.nombre}</td>
                <td>${formatDate(cliente.fecha_nacimiento)}</td>
                <td>${cliente.genero}</td>
                <td>${formatDate(cliente.fecha_muerte)}</td>
                <td>${cliente.telefono || '-'}</td>
                <td>
                    <span class="badge ${cliente.estatus ? 'badge-success' : 'badge-danger'}">
                        ${cliente.estatus ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editItem('cliente', ${cliente.id_cliente})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteItem('cliente', ${cliente.id_cliente})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="8" class="text-center">No hay clientes registrados</td></tr>';
    }

    showModal(type, id = null) {
        this.state.currentModal = type;
        this.state.editingId = id;

        const modal = new bootstrap.Modal(document.getElementById('genericModal'));
        const title = document.getElementById('modalTitle');
        const body = document.getElementById('modalBody');

        // Configurar según el tipo de modal
        const modalConfigs = {
            'cliente': {
                title: id ? 'Editar Cliente' : 'Nuevo Cliente',
                content: this.getClienteForm(id)
            },
            'recuerdo': {
                title: id ? 'Editar Recuerdo' : 'Nuevo Recuerdo',
                content: this.getRecuerdoForm(id)
            }
            // Agregar más configuraciones para otros modales
        };

        const config = modalConfigs[type] || { title: 'Modal', content: 'Contenido no disponible' };
        title.textContent = config.title;
        body.innerHTML = config.content;

        modal.show();
    }

    getClienteForm(id = null) {
        const cliente = id ? this.state.data.clientes.find(c => c.id_cliente === id) : null;
        
        return `
            <form id="clienteForm">
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Nombre completo</label>
                        <input type="text" class="form-control" name="nombre" value="${cliente?.nombre || ''}" required>
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Género</label>
                        <select class="form-select" name="genero" required>
                            <option value="">Seleccionar...</option>
                            <option value="Masculino" ${cliente?.genero === 'Masculino' ? 'selected' : ''}>Masculino</option>
                            <option value="Femenino" ${cliente?.genero === 'Femenino' ? 'selected' : ''}>Femenino</option>
                            <option value="Otro" ${cliente?.genero === 'Otro' ? 'selected' : ''}>Otro</option>
                        </select>
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Fecha de nacimiento</label>
                        <input type="date" class="form-control" name="fecha_nacimiento" value="${cliente?.fecha_nacimiento || ''}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Fecha de fallecimiento</label>
                        <input type="date" class="form-control" name="fecha_muerte" value="${cliente?.fecha_muerte || ''}">
                    </div>
                </div>
                <div class="row">
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Teléfono</label>
                        <input type="tel" class="form-control" name="telefono" value="${cliente?.telefono || ''}">
                    </div>
                    <div class="col-md-6 mb-3">
                        <label class="form-label">Correo electrónico</label>
                        <input type="email" class="form-control" name="correo" value="${cliente?.correo || ''}">
                    </div>
                </div>
                ${authService.hasPermission('admin') ? `
                <div class="mb-3">
                    <label class="form-label">Funeraria</label>
                    <select class="form-select" name="id_funeraria" required>
                        <option value="">Seleccionar funeraria...</option>
                        ${this.state.data.funerarias.map(f => `
                            <option value="${f.id_funeraria}" ${cliente?.id_funeraria === f.id_funeraria ? 'selected' : ''}>
                                ${f.nombre}
                            </option>
                        `).join('')}
                    </select>
                </div>
                ` : ''}
            </form>
        `;
    }

    async handleSaveModal() {
        const form = document.getElementById(`${this.state.currentModal}Form`);
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            let result;
            if (this.state.editingId) {
                // Editar
                switch (this.state.currentModal) {
                    case 'cliente':
                        result = await clientesService.update(this.state.editingId, data);
                        break;
                    case 'recuerdo':
                        result = await recuerdosService.update(this.state.editingId, data);
                        break;
                    // Agregar más casos para otros modales
                }
            } else {
                // Crear
                switch (this.state.currentModal) {
                    case 'cliente':
                        result = await clientesService.create(data);
                        break;
                    case 'recuerdo':
                        // Para clientes, auto-asignar su ID
                        if (this.state.user.rol === 'cliente') {
                            data.id_cliente = this.state.user.id;
                        }
                        result = await recuerdosService.create(data);
                        break;
                    // Agregar más casos para otros modales
                }
            }

            if (result.success) {
                showAlert(`Registro ${this.state.editingId ? 'actualizado' : 'creado'} correctamente`, 'success');
                bootstrap.Modal.getInstance(document.getElementById('genericModal')).hide();
                
                // Recargar los datos de la página actual
                this.loadPageData(this.state.currentPage);
            } else {
                showAlert(result.message || 'Error al guardar', 'danger');
            }
        } catch (error) {
            showAlert('Error al guardar el registro', 'danger');
        }
    }

    async deleteItem(type, id) {
        if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;

        try {
            let result;
            switch (type) {
                case 'cliente':
                    result = await clientesService.delete(id);
                    break;
                case 'recuerdo':
                    result = await recuerdosService.delete(id);
                    break;
                // Agregar más casos para otros tipos
            }

            if (result.success) {
                showAlert('Registro eliminado correctamente', 'success');
                this.loadPageData(this.state.currentPage);
            } else {
                showAlert(result.message || 'Error al eliminar', 'danger');
            }
        } catch (error) {
            showAlert('Error al eliminar el registro', 'danger');
        }
    }

    editItem(type, id) {
        this.showModal(type, id);
    }

    // Métodos para cargar otras páginas (implementar según necesidad)
    async loadFunerarias() {
        try {
            const funerarias = await funerariasService.getAll();
            this.renderFunerariasTable(funerarias.data || []);
        } catch (error) {
            console.error('Error cargando funerarias:', error);
            showAlert('Error al cargar las funerarias', 'danger');
        }
    }

    async loadRecuerdos() {
        try {
            let recuerdos;
            if (this.state.user.rol === 'cliente') {
                recuerdos = await recuerdosService.getByCliente(this.state.user.id);
            } else if (authService.hasPermission('funeraria') || authService.hasPermission('trabajador')) {
                // Obtener recuerdos de los clientes de esta funeraria
                recuerdos = { data: [] };
                for (const cliente of this.state.data.clientes) {
                    const clienteRecuerdos = await recuerdosService.getByCliente(cliente.id_cliente);
                    if (clienteRecuerdos.data) {
                        recuerdos.data.push(...clienteRecuerdos.data);
                    }
                }
            } else {
                recuerdos = await recuerdosService.getAll();
            }

            this.renderRecuerdosTable(recuerdos.data || []);
        } catch (error) {
            console.error('Error cargando recuerdos:', error);
            showAlert('Error al cargar los recuerdos', 'danger');
        }
    }

    renderRecuerdosTable(recuerdos) {
        const tbody = document.getElementById('recuerdosTableBody');
        tbody.innerHTML = recuerdos.map(recuerdo => `
            <tr>
                <td>${recuerdo.id_recuerdo}</td>
                <td>${this.getClienteName(recuerdo.id_cliente)}</td>
                <td>${recuerdo.titulo}</td>
                <td>${recuerdo.texto.substring(0, 50)}${recuerdo.texto.length > 50 ? '...' : ''}</td>
                <td>${formatDateTime(recuerdo.fecha_creacion)}</td>
                <td>
                    <span class="badge ${recuerdo.entregado ? 'badge-success' : 'badge-warning'}">
                        ${recuerdo.entregado ? 'Entregado' : 'Pendiente'}
                    </span>
                </td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-outline-primary" onclick="app.editItem('recuerdo', ${recuerdo.id_recuerdo})">
                        <i class="bi bi-pencil"></i>
                    </button>
                    ${!recuerdo.entregado ? `
                    <button class="btn btn-sm btn-outline-success" onclick="app.marcarEntregado(${recuerdo.id_recuerdo})">
                        <i class="bi bi-check-lg"></i>
                    </button>
                    ` : ''}
                    <button class="btn btn-sm btn-outline-danger" onclick="app.deleteItem('recuerdo', ${recuerdo.id_recuerdo})">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('') || '<tr><td colspan="7" class="text-center">No hay recuerdos registrados</td></tr>';
    }

    getClienteName(clienteId) {
        const cliente = this.state.data.clientes.find(c => c.id_cliente === clienteId);
        return cliente ? cliente.nombre : 'Cliente no encontrado';
    }

    async marcarEntregado(recuerdoId) {
        try {
            const result = await recuerdosService.marcarEntregado(recuerdoId);
            if (result.success) {
                showAlert('Recuerdo marcado como entregado', 'success');
                this.loadPageData('recuerdos');
                
                // Enviar automáticamente a familiares
                await this.enviarRecuerdoAFamiliares(recuerdoId);
            }
        } catch (error) {
            showAlert('Error al marcar como entregado', 'danger');
        }
    }

    async enviarRecuerdoAFamiliares(recuerdoId) {
        try {
            const recuerdo = this.state.data.recuerdos.find(r => r.id_recuerdo === recuerdoId);
            if (!recuerdo) return;

            // Obtener familiares del cliente
            const familiares = await familiaresService.getByCliente(recuerdo.id_cliente);
            
            if (familiares.data && familiares.data.length > 0) {
                // Enviar a cada familiar
                for (const familiar of familiares.data) {
                    await familiaresService.enviarRecuerdoAFamiliar(
                        recuerdoId, 
                        familiar.id_familiar, 
                        'Correo' // Método por defecto
                    );
                }
                showAlert(`Recuerdo enviado a ${familiares.data.length} familiar(es)`, 'success');
            }
        } catch (error) {
            console.error('Error enviando recuerdos a familiares:', error);
        }
    }

    // Implementar métodos similares para otras páginas...
    async loadUsuarios() {
        if (!authService.hasPermission('admin')) {
            showAlert('No tiene permisos para acceder a esta sección', 'warning');
            return;
        }

        try {
            const usuarios = await usuariosService.getAll();
            this.renderUsuariosTable(usuarios.data || []);
        } catch (error) {
            console.error('Error cargando usuarios:', error);
            showAlert('Error al cargar los usuarios', 'danger');
        }
    }

    async loadFamiliares() {
        try {
            let familiares;
            if (this.state.user.rol === 'cliente') {
                familiares = await familiaresService.getByCliente(this.state.user.id);
            } else {
                familiares = await familiaresService.getAll();
            }

            this.renderFamiliaresTable(familiares.data || []);
        } catch (error) {
            console.error('Error cargando familiares:', error);
            showAlert('Error al cargar los familiares', 'danger');
        }
    }

    async loadPerfil() {
        const content = document.getElementById('perfilContent');
        content.innerHTML = `
            <div class="row">
                <div class="col-md-6">
                    <h6>Información Personal</h6>
                    <p><strong>Nombre:</strong> ${this.state.user.nombre}</p>
                    <p><strong>Rol:</strong> ${this.getRoleDisplayName(this.state.user.rol)}</p>
                    <p><strong>Funeraria:</strong> ${this.state.user.funeraria_nombre || 'No asignada'}</p>
                </div>
                <div class="col-md-6">
                    <h6>Acciones</h6>
                    <button class="btn btn-primary-custom me-2 mb-2" onclick="app.showModal('perfil')">
                        <i class="bi bi-pencil me-1"></i> Editar Perfil
                    </button>
                    <button class="btn btn-outline-secondary me-2 mb-2" onclick="app.showChangePasswordModal()">
                        <i class="bi bi-key me-1"></i> Cambiar Contraseña
                    </button>
                </div>
            </div>
        `;
    }
}

// Inicializar la aplicación
const app = new FunerariaApp();

// Hacer disponible globalmente para los event handlers
window.app = app;
window.navigateToPage = (page) => app.navigateToPage(page);
window.showModal = (type, id) => app.showModal(type, id);