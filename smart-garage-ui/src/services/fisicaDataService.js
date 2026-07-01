import http from '../http-common';

class FisicaDataService {

    getAll() {
        return http.get('/api/fisica');
    }

    getById(id) {
        return http.get(`/api/fisica/${id}`);
    }

    getByCpf(identificacao) {
        return http.get(`/api/fisica/${identificacao}`);
    }

    create(data) {
        return http.post('/api/fisica', data);
    }

    duplicidade(data) {
        return http.post("/api/fisica/verificar", data);
    }

}

export default new FisicaDataService();