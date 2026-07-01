import http from "../http-common";

class ComissaoDataService {
    getAll() {
        return http.get("/api/comissao");
    }
    updateAll(data) {
        return http.put("/api/comissao", data);
    }
}

export default new ComissaoDataService();