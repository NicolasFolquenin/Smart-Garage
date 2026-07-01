import http from '../http-common';

class CidadeDataService {

    getAll() {
        return http.get('/api/cidade');
    }

    create(data) {
        return http.post('/api/cidade', data);
    }
}

export default new CidadeDataService();