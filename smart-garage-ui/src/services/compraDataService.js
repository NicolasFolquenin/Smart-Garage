import http from '../http-common';

class CompraDataService {

    getAll() {
        return http.get('/api/compra');
    }

    getById(id) {
        return http.get(`/api/compra/${id}`);
    }

    getByData() {
        return http.get('/api/compra/data');
    }

    getDetalhesById(id) {
        return http.get(`/api/compra/detalhes/${id}`);
    };


    create(data) {
        return http.post('/api/compra', data);
    }

    update(id, data) {
        return http.put(`/api/compra/${id}`, data);
    }

    remove(id) {
        return http.delete(`/api/compra/${id}`);
    };

}

export default new CompraDataService();