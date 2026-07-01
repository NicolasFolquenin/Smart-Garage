import http from "../http-common";

class ModeloDataService {

    getAll() {
        return http.get("/api/modelo");
    }

    getByMarca(marcaId) {
        return http.get(`/api/modelo/por-marca/${marcaId}`);
    };


    create(data) {
        return http.post("/api/modelo", data);
    }

    getById(id) {
        return http.get(`api/modelo/${id}`);
    }

    update(id, data) {
        return http.put(`/api/modelo/${id}`, data)
    }
}

export default new ModeloDataService(); 