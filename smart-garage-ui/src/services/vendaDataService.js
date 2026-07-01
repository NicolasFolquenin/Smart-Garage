import http from "../http-common";

class VendaDataService {

    getAll() {
        return http.get('/api/venda');
    }

    getByData() {
        return http.get('/api/venda/data');
    }

    getById(id) {
        return http.get(`/api/venda/${id}`);
    }

    getDetalhesById(id) {
        return http.get(`/api/venda/detalhes/${id}`);
    };

    create(data) {
        return http.post('/api/venda', data);
    }

    update(id, data) {
        return http.put(`/api/venda/${id}`, data);
    }

    remove(id) {
        return http.delete(`/api/venda/${id}`);
    };
}

export default new VendaDataService();