class RecuerdosService {
    async getAll() {
        return await apiClient.get('/recuerdos');
    }

    async getById(id) {
        return await apiClient.get(`/recuerdos/${id}`);
    }

    async create(recuerdoData) {
        return await apiClient.post('/recuerdos', recuerdoData);
    }

    async update(id, recuerdoData) {
        return await apiClient.put(`/recuerdos/${id}`, recuerdoData);
    }

    async delete(id) {
        return await apiClient.delete(`/recuerdos/${id}`);
    }

    async getByCliente(clienteId) {
        return await apiClient.get(`/recuerdos/cliente/${clienteId}`);
    }

    async marcarEntregado(id) {
        return await apiClient.put(`/recuerdos/${id}/entregar`);
    }

    async enviarRecuerdo(id, metodoEnvio) {
        return await apiClient.post(`/recuerdos/${id}/enviar`, { metodo: metodoEnvio });
    }

    async getPendientes() {
        return await apiClient.get('/recuerdos/pendientes');
    }
}

const recuerdosService = new RecuerdosService();