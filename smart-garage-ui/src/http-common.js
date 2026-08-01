import axios from "axios";
import AuthService from "./services/authDataService";
import { toast } from 'react-toastify';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
    headers: {
        "Content-type": "application/json"
    },
    withCredentials: true // Permite o envio de cookies automaticamente
});

apiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response) {
            if (error.response.status === 401) {
                // Não dispara o reload/logout automático se for a rota de verificação de login
                // Isso evita um loop infinito (Reload -> fetchUser -> 401 -> Reload)
                if (error.config && error.config.url && !error.config.url.includes('/login/me')) {
                    toast.error("Sua sessão expirou. Faça login novamente.");
                    AuthService.logout();
                    setTimeout(() => {
                        window.location.href = '/';
                    }, 1500);
                }
            } else if (error.response.status >= 500) {
                toast.error("Ocorreu um erro no servidor. Tente novamente mais tarde.");
            } else if (error.response.status === 403) {
                 toast.error("Você não tem permissão para realizar esta ação.");
            }
        } else if (error.request) {
            toast.error("Não foi possível conectar ao servidor.");
        }
        return Promise.reject(error);
    }
);

export default apiClient;
