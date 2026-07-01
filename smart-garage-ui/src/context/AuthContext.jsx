import { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import AuthService from '../services/authDataService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const token = AuthService.getCurrentUserToken();
            if (token) {
                const decodedUser = jwtDecode(token);
                setUser(decodedUser);
            }
        } catch (error) {
            console.error("Token inválido:", error);
            AuthService.logout();
        } finally {
            setLoading(false);
        }

    }, []);

    const login = (token) => {
        setLoading(true);
        try {
            localStorage.setItem("user_token", token);
            const decodedUser = jwtDecode(token);
            setUser(decodedUser);

            // LÓGICA DE REDIRECIONAMENTO
            if (decodedUser.precisa_alterar_senha) {
                navigate('/primeiro-acesso/alterar-senha');
            } else {
                navigate('/home');
            }

        } catch (error) {
            console.error("Falha ao processar token no login:", error);
            localStorage.removeItem("user_token");
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {

        setLoading(true);
        try {
            AuthService.logout();
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        user,
        loading,
        login,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};