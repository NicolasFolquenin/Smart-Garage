import http from '../http-common';

class EnderecoDataService {

    getAll() {
        return http.get('/api/endereco');
    }

    create(data) {
        return http.post('/api/endereco', data);
    }
}

export default new EnderecoDataService();