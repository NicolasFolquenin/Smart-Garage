import http from '../http-common';

class TrocaDataService {

    getAll() {
        return http.get('/api/troca');
    }

    getById(id) {
        return http.get(`api/troca/${id}`);
    }

    getByData() {
        return http.get('/api/troca/data');
    }

    getDetalhesById(id) {
        return http.get(`/api/troca/detalhes/${id}`);
    };

    create(data) {
        return http.post('/api/troca', data);
    }

    update(id, data) {
        return http.put(`/api/troca/${id}`, data);
    }

    remove(id) {
        return http.delete(`/api/troca/${id}`);
    };


}

export default new TrocaDataService();