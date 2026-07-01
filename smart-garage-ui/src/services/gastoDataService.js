import http from '../http-common';

class GastoDataService {

    getAll() {
        return http.get('/api/gasto')
    }

    getById(id) {
        return http.get(`/api/gasto/${id}`)
    }

    getByData() {
        return http.get(`/api/gasto/data`)
    }

    getDetalhesById(id) {
        return http.get(`/api/gasto/detalhes/${id}`);
    };

    create(data) {
        return http.post('/api/gasto', data)
    }

    update(id, data) {
        return http.put(`/api/gasto/${id}`, data)
    }

    remove(id) {
        return http.delete(`/api/gasto/${id}`)
    }

}
export default new GastoDataService()