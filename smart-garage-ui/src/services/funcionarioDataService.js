import http from '../http-common';

class FuncionarioDataService {

    getAll() {
        return http.get('/api/funcionario');
    }

    alterarSenha(novaSenha) {
        const data = {
            senha: novaSenha
        };
        return http.post('api/funcionario/alterar-senha', data)
    }

}

export default new FuncionarioDataService();