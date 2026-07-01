import http from '../http-common';

class ClienteDataService {

    getAll() {
        return http.get('/api/cliente');
    }

    getById(id) {
        return http.get(`/api/cliente/${id}`);
    }

    get(id) {
        return http.get(`/api/cliente/detalhado/${id}`);
    }

    update(id, data) {
        return http.put(`/api/cliente/${id}`, data);
    }

    create(data) {
        return http.post('/api/cliente', data);
    }

    duplicidade(data) {
        return http.post("/api/cliente/verificar", data);
    }
}

export default new ClienteDataService();