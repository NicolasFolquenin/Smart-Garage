// Importe os ícones que vamos usar
import { FaCar, FaUserAlt, FaLock } from 'react-icons/fa';
import { InputGroup, Form } from 'react-bootstrap';
import ModalEsqueciSenha from './modais/ModalEsqueciSenha';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../services/authDataService';
import { useAuth } from '../context/AuthContext';
import HelpPopover from './HelpPopover';

const Login = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [usuario, setUsuario] = useState('');
    const [senha, setSenha] = useState('');
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    const [showEsqueciSenhaModal, setShowEsqueciSenhaModal] = useState(false);

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

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [])

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setErro('');

        try {
            const response = await AuthService.login({ usuario, senha });

            if (response?.data.token) {

                localStorage.setItem("user_token", response?.data.token);

                login(response.data.token);

            }
        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem || "Erro ao tentar fazer login.";
            setErro(mensagemErro);
            setLoading(false);
        }
    };

    return (

        <>
            <div className="login-page-wrapper">
                <div className="card shadow-lg border-0 login-card-animated" style={{ width: '100%', maxWidth: '450px' }}>
                    <div className="text-end me-3 mt-2">
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Login"
                            content='Insira seu nome de usuário e senha, em seguida clique no botão "Entrar" para acessar o sistema. Se você não se lembra da sua senha, clique no link "Esqueceu a senha?".'
                        />
                    </div>
                    <div className="card-body p-5">
                        <div className={`text-center ${!erro ? "mb-5" : "mb-2"}`}>
                            <img src="/static/img/logoapenas.png" alt="Smart Garage Logo" className="navbar-logo mb-1" />
                            {/* <div className="d-flex align-items-center justify-content-center"> */}
                            <h1 className="fw-bold">Smart Garage</h1>

                            {/* </div> */}
                            <p className="text-muted">Faça login para continuar</p>
                        </div>

                        {erro && (
                            <div className='d-flex align-items-center mb-3 container'>
                                <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                                <div className="text text-danger">{erro}</div>
                            </div>

                        )}

                        <form onSubmit={handleLogin}>
                            <InputGroup className="mb-3">
                                <InputGroup.Text><FaUserAlt /></InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Nome de usuário"
                                    value={usuario}
                                    onChange={(e) => setUsuario(e.target.value)}
                                    required
                                />
                            </InputGroup>

                            <InputGroup className="mb-4">
                                <InputGroup.Text><FaLock /></InputGroup.Text>
                                <Form.Control
                                    type="password"
                                    placeholder="Senha"
                                    value={senha}
                                    onChange={(e) => setSenha(e.target.value)}
                                    required
                                />
                            </InputGroup>

                            <div className="d-grid mb-3">
                                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Entrando...
                                        </>
                                    ) : (
                                        'Entrar'
                                    )}
                                </button>
                            </div>

                            <div className="text-center">
                                <a href="#" onClick={(e) => { e.preventDefault(); setShowEsqueciSenhaModal(true); }} className="text-decoration-none small">
                                    Esqueceu a senha?
                                </a>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <ModalEsqueciSenha
                show={showEsqueciSenhaModal}
                onHide={() => setShowEsqueciSenhaModal(false)}
            />
        </>
    );
};

export default Login;