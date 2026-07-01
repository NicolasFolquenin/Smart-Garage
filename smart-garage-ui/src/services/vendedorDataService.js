import http from '../http-common';

class VendedorDataService {

    getByFuncionarioId(funcionarioId) {
        return http.get(`/api/vendedor/${funcionarioId}`);
    }

    create(data) {
        return http.post("/api/vendedor", data);
    }

    getAll() {
        return http.get("/api/vendedor");
    }

    // id aqui é o ID do Vendedor
    updateStatus(id, data) {
        // data deve ser um objeto como { ativo: false }
        return http.patch(`/api/vendedor/${id}/status`, data);
    }

}

export default new VendedorDataService();