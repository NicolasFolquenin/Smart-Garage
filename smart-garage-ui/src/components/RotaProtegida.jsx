import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Carregando...</span>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/" replace />;
    }

    if (user && user.precisa_alterar_senha && location.pathname !== '/primeiro-acesso/alterar-senha') {
        return <Navigate to="/primeiro-acesso/alterar-senha" replace />;
    }

    if (allowedRoles) {
        const isSuperAdmin = user.role === 'super_admin' || user.super_admin === true;
        // Super Admin herda todas as permissões de gerente
        const hasRole = allowedRoles.includes(user.role) || (isSuperAdmin && (allowedRoles.includes('gerente') || allowedRoles.includes('super_admin')));

        if (!hasRole) {
            return <Navigate to="/acesso-negado" replace />;
        }
    }

    return <Outlet />;
};

export default ProtectedRoute;