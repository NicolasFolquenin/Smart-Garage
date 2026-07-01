import http from "../http-common";

class MarcaDataService {

    getAll() {
        return http.get("/api/marca");
    }

    create(data) {
        return http.post("/api/marca", data);
    }

    getById(id) {
        return http.get(`api/marca/${id}`);
    }

    update(id, data) {
        return http.put(`/api/marca/${id}`, data)
    }
}

export default new MarcaDataService(); 