import http from '../http-common';

class ManutencaoDataService {

    getAll() {
        return http.get('/api/manutencao')
    }

    getById(id) {
        return http.get(`/api/manutencao/${id}`)
    }

    getByAtivo() {
        return http.get(`api/manutencao/ativo`);
    }

    getByInativo() {
        return http.get(`api/manutencao/inativo`);
    }

    getDetalhesById(id) {
        return http.get(`/api/manutencao/detalhes/${id}`);
    };

    getAllByDataEnvio() {
        return http.get('/api/manutencao/dataenvio');
    }

    create(data) {
        return http.post('/api/manutencao', data)
    }

    finalizar(id, data) {
        return http.put(`/api/manutencao/finalizar/${id}`, data);
    };

    update(id, data) {
        return http.put(`/api/manutencao/${id}`, data)
    }

    remove(id) {
        return http.delete(`/api/manutencao/${id}`)
    }

}
export default new ManutencaoDataService()