class FamiliaresService {
    async getAll() {
        return await apiClient.get('/familiares');
    }

    async getById(id) {
        return await apiClient.get(`/familiares/${id}`);
    }

    async create(familiarData) {
        return await apiClient.post('/familiares', familiarData);
    }

    async update(id, familiarData) {
        return await apiClient.put(`/familiares/${id}`, familiarData);
    }

    async delete(id) {
        return await apiClient.delete(`/familiares/${id}`);
    }

    async getByCliente(clienteId) {
        return await apiClient.get(`/familiares/cliente/${clienteId}`);
    }

    async enviarRecuerdoAFamiliar(recuerdoId, familiarId, metodo) {
        return await apiClient.post('/recuerdos/enviar', {
            recuerdo_id: recuerdoId,
            familiar_id: familiarId,
            metodo: metodo
        });
    }
}

const familiaresService = new FamiliaresService();