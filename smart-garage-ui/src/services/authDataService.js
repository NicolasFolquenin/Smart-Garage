import http from "../http-common"; // Seu cliente axios

const login = (data) => {
    return http.post("/api/login", data);
};

const logout = async () => {
    try {
        await http.post("/api/login/logout");
    } catch (err) {
        console.error("Erro no logout", err);
    }
};

const getMe = () => {
    return http.get("/api/login/me");
};

const solicitarResetSenha = (data) => {
    return http.post("/api/login/esqueci-senha", data);
};

const resetarSenha = (token, data) => {
    return http.post(`/api/login/resetar-senha/${token}`, data);
};

const authService = {
    login,
    logout,
    getMe,
    solicitarResetSenha,
    resetarSenha,
};

export default authService;