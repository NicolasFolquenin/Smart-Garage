import { createContext, useState, useContext, useEffect } from 'react';
import AuthService from '../services/authDataService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await AuthService.getMe();
                if (response.data.user) {
                    setUser(response.data.user);
                }
            } catch (error) {
                console.error("Não autenticado ou sessão expirada", error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    const login = (userData) => {
        setLoading(true);
        try {
            setUser(userData);

            // LÓGICA DE REDIRECIONAMENTO
            if (userData.precisa_alterar_senha) {
                navigate('/primeiro-acesso/alterar-senha');
            } else {
                navigate('/home');
            }

        } catch (error) {
            console.error("Falha ao processar login:", error);
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await AuthService.logout();
            setUser(null);
            navigate('/');
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