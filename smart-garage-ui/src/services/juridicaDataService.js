import http from '../http-common';

class JuridicaDataService {

    getAll() {
        return http.get('/api/juridica');
    }

    getById(id) {
        return http.get(`/api/juridica/${id}`);
    }

    getByCnpj(identificacao) {
        return http.get(`/api/juridica/${identificacao}`);
    }

    create(data) {
        return http.post('/api/juridica', data);
    }

    duplicidade(data) {
        return http.post("/api/juridica/verificar", data);
    }
}

export default new JuridicaDataService();