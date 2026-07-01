import axios from "axios";
import AuthService from "./services/authDataService";

const apiClient = axios.create({
    baseURL: "http://localhost:3000",
    headers: {
        "Content-type": "application/json"
    }
});

apiClient.interceptors.request.use(
    (config) => {

        const token = AuthService.getCurrentUserToken();

        if (token) {
            config.headers["Authorization"] = 'Bearer ' + token;
        }

        return config;
    },
    (error) => {

        return Promise.reject(error);
    }
);

export default apiClient;
