import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Header = () => {

    const location = useLocation();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    useEffect(() => {
        const handleKeyDown = (event) => {

            if (event.key === 'F1') {
                event.preventDefault();

                const helpIcon = document.getElementById('page-help-popover');

                if (helpIcon) {
                    helpIcon.click();
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        // Função de limpeza para remover o ouvinte quando o componente for desmontado
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    return (
        <>
            <nav className="navbar navbar-color">
                <div className="container-fluid mx-5">
                    <img src="/static/img/logo.png" alt="Smart Garage Logo" className="navbar-logo mb-1" />
                    <button className="navbar-toggler" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="offcanvas offcanvas-end" tabIndex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel">
                        <div className="offcanvas-header">
                            <h4 className="mb-0" id="offcanvasNavbarLabel">Menu</h4>
                            <button type="button" className="btn-close mb-0" data-bs-dismiss="offcanvas" aria-label="Close"></button>
                        </div>
                        <div className="offcanvas-body ">
                            <hr className="mt-0"></hr>
                            <div className="d-flex flex-column flex-shrink-0 bg-body-primary">
                                <ul className="nav nav-pills flex-column mb-auto">
                                    <li className="nav-item">
                                        <Link to="/home" className={`nav-link  ${location.pathname === '/home' ? 'active' : 'link-body-emphasis'}`} aria-current="page"> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#home"></use></svg>
                                            <i className="bi bi-house-fill me-2"></i>Home</Link>
                                    </li>
                                    <li>
                                        <Link to="/listagem/vendas" className={`nav-link  ${location.pathname === '/listagem/vendas' ? 'active' : 'link-body-emphasis'}`} ><svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#speedometer2"></use></svg>
                                            <i className="bi bi-cash-coin me-2"></i>Vendas
                                        </Link>
                                    </li>
                                    {user.role === "gerente" ? (
                                        <li>
                                            <Link to="/listagem/trocas" className={`nav-link  ${location.pathname === '/listagem/trocas' ? 'active' : 'link-body-emphasis'}`} ><svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#table"></use></svg>
                                                <i class="bi bi-arrow-repeat me-2"></i>Trocas
                                            </Link>
                                        </li>)
                                        : (
                                            <li>
                                                <Link to="/listagem/manutencoes" className={`nav-link  ${location.pathname === '/listagem/manutencoes' ? 'active' : 'link-body-emphasis'}`} ><svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#table"></use></svg>
                                                    <i class="bi bi-wrench me-2"></i>Manutenções
                                                </Link>
                                            </li>
                                        )
                                    }
                                    {user.role === "gerente" && (
                                        <li>
                                            <Link to="/consultas" className={`nav-link ${location.pathname === '/consultas' ? 'active' : 'link-body-emphasis'}`}> <svg className="bi pe-none me-2" width="16" height="16" aria-hidden="true"><use xlinkHref="#grid"></use></svg>
                                                <i className="bi bi-file-earmark-bar-graph-fill me-2"></i>Consultas Gerenciais
                                            </Link>
                                        </li>
                                    )}
                                    <li>
                                        <Link to="/listagem/gastos" className={`nav-link ${location.pathname === '/listagem/gastos' ? 'active' : 'link-body-emphasis'}`}> <svg className="me-2" width="16" height="16" aria-hidden="true"></svg>
                                            <i className="bi bi-safe2-fill me-2"></i>Gastos
                                        </Link>
                                    </li>
                                    {user.role === "gerente" && (
                                        <li>
                                            <Link to="/listagem/compras" className={`nav-link ${location.pathname === '/listagem/compras' ? 'active' : 'link-body-emphasis'}`}> <svg className="me-2" width="16" height="16" aria-hidden="true"></svg>
                                                <i className="bi bi-cart-fill me-2"></i>Compras
                                            </Link>
                                        </li>
                                    )}
                                    {user.role === 'gerente' && (
                                        <li>
                                            <Link to="/listagem/vendedores" className={`nav-link ${location.pathname === ('/listagem/vendedores') ? 'active' : 'link-body-emphasis'}`}><svg className="me-2" width="16" height="16" aria-hidden="true"></svg>
                                                <i className="bi bi-people-fill me-2"></i>
                                                Vendedores
                                            </Link>
                                        </li>
                                    )}
                                    <Link to="/listagem/clientes" className={`nav-link ${location.pathname.includes('/clientes') ? 'active' : 'link-body-emphasis'}`}><svg className="me-2" width="16" height="16" aria-hidden="true"></svg>
                                        <i className="bi bi-person-lines-fill me-2"></i>
                                        Clientes
                                    </Link>
                                    {user.role === 'gerente' && (
                                        <li>
                                            <Link to="/gerenciar/comissoes" className={`nav-link ${location.pathname.includes('/gerenciar/comissoes') ? 'active' : 'link-body-emphasis'}`}> <svg className="me-2" width="16" height="16" aria-hidden="true"></svg>
                                                <i class="bi bi-cash me-2"></i>
                                                Comissões</Link>
                                        </li>
                                    )}
                                </ul>
                                <hr></hr>

                                <div>
                                    <a onClick={handleLogout} className="d-flex align-items-center text-dark text-decoration-none">
                                        <i className="bi bi-box-arrow-right me-2"></i>
                                        <strong>Sair</strong>
                                    </a>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </nav >
        </>
    )
}

export default Header;
