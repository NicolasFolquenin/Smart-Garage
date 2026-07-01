import http from "../http-common"; // Seu cliente axios

const login = (data) => {
    return http.post("/api/login", data);
};

const logout = () => {
    localStorage.removeItem("user_token");
};

const getCurrentUserToken = () => {
    return localStorage.getItem("user_token");
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
    getCurrentUserToken,
    solicitarResetSenha,
    resetarSenha,
};

export default authService;