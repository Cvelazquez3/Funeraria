// Configuración base de la API
const API_CONFIG = {
    BASE_URL: 'https://q0s3mgvm-3000.usw3.devtunnels.ms/api/usuarios/1', // CAMBIAR ESTA URL POR LA DE TU API
    TIMEOUT: 10000
};

// Interceptor de axios para manejar tokens y errores globalmente
class ApiClient {
    constructor() {
        this.client = axios.create({
            baseURL: API_CONFIG.BASE_URL,
            timeout: API_CONFIG.TIMEOUT,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        // Request interceptor - agregar token a todas las peticiones
        this.client.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('funeraria_token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor - manejar errores globalmente
        this.client.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('funeraria_token');
                    localStorage.removeItem('funeraria_user');
                    window.location.reload();
                }
                return Promise.reject(error);
            }
        );
    }

    // Métodos HTTP reutilizables
    async get(endpoint, params = {}) {
        try {
            const response = await this.client.get(endpoint, { params });
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async post(endpoint, data = {}) {
        try {
            const response = await this.client.post(endpoint, data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async put(endpoint, data = {}) {
        try {
            const response = await this.client.put(endpoint, data);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    async delete(endpoint) {
        try {
            const response = await this.client.delete(endpoint);
            return response.data;
        } catch (error) {
            this.handleError(error);
            throw error;
        }
    }

    handleError(error) {
        console.error('API Error:', error);
        
        if (error.response) {
            // El servidor respondió con un código de error
            const message = error.response.data?.message || 'Error del servidor';
            showAlert(message, 'danger');
        } else if (error.request) {
            // La petición fue hecha pero no se recibió respuesta
            showAlert('Error de conexión con el servidor', 'danger');
        } else {
            // Algo pasó al configurar la petición
            showAlert('Error en la aplicación', 'danger');
        }
    }
}

// Instancia global del cliente API
const apiClient = new ApiClient();