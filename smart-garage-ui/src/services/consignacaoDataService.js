import http from '../http-common';

class ConsignacaoDataService {

    getAll() {
        return http.get('/api/consignacao');
    }

    getById(id) {
        return http.get(`api/consignacao/${id}`);
    }

    getByAutomovel(automovelId) {
        return http.get(`api/consignacao/automovel/${automovelId}`);
    }

    getByAtivo() {
        return http.get(`api/consignacao/ativo`);
    }

    getByInativo() {
        return http.get(`api/consignacao/inativo`);
    }

    getDetalhesById(id) {
        return http.get(`/api/consignacao/detalhes/${id}`);
    };

    create(data) {
        return http.post('/api/consignacao', data)
    }

    getAllByDataInicio() {
        return http.get('/api/consignacao/datainicio');
    }

    encerrar(id, data) {
        return http.put(`/api/consignacao/encerrar/${id}`, data)
    }

    update(id, data) {
        return http.put(`/api/consignacao/${id}`, data)
    }

    remove(id) {
        return http.delete(`/api/consignacao/${id}`);
    };
}

export default new ConsignacaoDataService();