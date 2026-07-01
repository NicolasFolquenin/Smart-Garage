import http from '../http-common';

class EstadoDataService {

    getAll() {
        return http.get('/api/estado');
    }

    create(data) {
        return http.post('/api/estado', data);
    }
}

export default new EstadoDataService();