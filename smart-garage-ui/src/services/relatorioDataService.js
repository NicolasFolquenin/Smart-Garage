import http from "../http-common";

class RelatorioDataService {

    gerarRelatorio(params) {

        return http.get("api/relatorio", { params });
    }
}

export default new RelatorioDataService();