class UsuariosService {
    async getAll() {
        return await apiClient.get('/usuarios');
    }

    async getById(id) {
        return await apiClient.get(`/usuarios/${id}`);
    }

    async create(usuarioData) {
        return await apiClient.post('/usuarios', usuarioData);
    }

    async update(id, usuarioData) {
        return await apiClient.put(`/usuarios/${id}`, usuarioData);
    }

    async delete(id) {
        return await apiClient.delete(`/usuarios/${id}`);
    }

    async updateProfile(userData) {
        return await apiClient.put('/usuarios/profile', userData);
    }

    async changePassword(passwordData) {
        return await apiClient.put('/usuarios/change-password', passwordData);
    }

    async getByRol(rol) {
        return await apiClient.get(`/usuarios/rol/${rol}`);
    }
}

const usuariosService = new UsuariosService();