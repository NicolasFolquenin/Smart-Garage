import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FuncionarioDataService from '../services/funcionarioDataService';
import { useAuth } from '../context/AuthContext';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import HelpPopover from './HelpPopover';
import PasswordStrengthMeter from '../components/PasswordStrengthMeter';

const AlterarSenhaPrimeiroAcesso = () => {
    const navigate = useNavigate();
    const { logout } = useAuth();
    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
    const [loading, setLoading] = useState(false);

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

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (senha !== confirmarSenha) {
            setFeedback({ tipo: 'danger', msg: 'As senhas não coincidem.' });
            return;
        }
        setLoading(true);
        try {
            await FuncionarioDataService.alterarSenha(senha); // Você precisará criar esta função no serviço
            setFeedback({ tipo: 'success', msg: 'Senha alterada com sucesso!' });

            setTimeout(() => {
                logout(); // Desloga o utilizador
                navigate('/'); // Redireciona para a página de login
            }, 2000);

        } catch (error) {
            const mensagemErro = error.response?.data?.mensagem
            setFeedback({ tipo: 'danger', msg: mensagemErro });
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <Card className="shadow-lg border-0" style={{ maxWidth: '450px' }}>
                <Card.Body className="p-5">
                    <div className="d-flex align-items-center justify-content-center">
                        <h3 className="text-center mb-0">Primeiro Acesso</h3>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Primeiro Acesso"
                            content="Como este é seu primeiro login, o sistema exige que você defina uma senha pessoal e segura para sua conta. Após definir a nova senha, você será redirecionado para a tela de login para entrar novamente."
                        />
                    </div>
                    <p className="text-center text-muted mb-4">Por segurança, você precisa definir uma nova senha.</p>

                    {feedback.msg && feedback.tipo === 'danger' &&
                        <div className='d-flex align-items-center mb-2 container'>
                            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                            <div className="text text-danger">{feedback.msg}</div>
                        </div>
                    }

                    {feedback.msg && feedback.tipo === 'success' &&
                        <div className='d-flex align-items-center mb-3 container'>
                            <i className="bi bi-check text-sucess me-2"></i>
                            <div className="text text-success">{feedback.msg}</div>
                        </div>
                    }

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label>Nova Senha</Form.Label>
                            <Form.Control type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
                            {senha && <PasswordStrengthMeter password={senha} />}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Nova Senha</Form.Label>
                            <Form.Control type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Definir Nova Senha'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default AlterarSenhaPrimeiroAcesso;