class AuthService {
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login', credentials);
            
            if (response.success) {
                // Guardar token y usuario
                localStorage.setItem('funeraria_token', response.data.token);
                localStorage.setItem('funeraria_user', JSON.stringify(response.data.user));
                
                return {
                    success: true,
                    user: response.data.user,
                    token: response.data.token
                };
            } else {
                return {
                    success: false,
                    message: response.message
                };
            }
        } catch (error) {
            return {
                success: false,
                message: error.response?.data?.message || 'Error de conexión'
            };
        }
    }

    logout() {
        localStorage.removeItem('funeraria_token');
        localStorage.removeItem('funeraria_user');
    }

    getCurrentUser() {
        const user = localStorage.getItem('funeraria_user');
        return user ? JSON.parse(user) : null;
    }

    getToken() {
        return localStorage.getItem('funeraria_token');
    }

    isAuthenticated() {
        return !!this.getToken();
    }

    // Verificar permisos según rol
    hasPermission(requiredRole) {
        const user = this.getCurrentUser();
        if (!user) return false;

        const roleHierarchy = {
            'admin': 4,
            'funeraria': 3,
            'trabajador': 2,
            'cliente': 1
        };

        const userLevel = roleHierarchy[user.rol] || 0;
        const requiredLevel = roleHierarchy[requiredRole] || 0;

        return userLevel >= requiredLevel;
    }
}

const authService = new AuthService();