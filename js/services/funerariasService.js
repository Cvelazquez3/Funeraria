class ClientesService {
    async getAll() {
        return await apiClient.get('/clientes');
    }

    async getById(id) {
        return await apiClient.get(`/clientes/${id}`);
    }

    async create(clienteData) {
        return await apiClient.post('/clientes', clienteData);
    }

    async update(id, clienteData) {
        return await apiClient.put(`/clientes/${id}`, clienteData);
    }

    async delete(id) {
        return await apiClient.delete(`/clientes/${id}`);
    }

    async getByFuneraria(funerariaId) {
        return await apiClient.get(`/clientes/funeraria/${funerariaId}`);
    }

    async getStats() {
        return await apiClient.get('/clientes/stats');
    }
}

const clientesService = new ClientesService();