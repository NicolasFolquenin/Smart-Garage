import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AuthService from '../services/authDataService';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import HelpPopover from './HelpPopover';
import PasswordStrengthMeter from './PasswordStrengthMeter';

const ResetarSenha = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [senha, setSenha] = useState('');
    const [confirmarSenha, setConfirmarSenha] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [erro, setErro] = useState('');
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
            setErro('As senhas não coincidem.');
            return;
        }
        setLoading(true);
        setErro('');
        setMensagem('');
        try {
            const response = await AuthService.resetarSenha(token, { senha });
            setMensagem(response.data.mensagem);
            setTimeout(() => navigate('/'), 2000);
        } catch (error) {
            setErro(error.response?.data?.mensagem || 'Erro ao redefinir a senha.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-wrapper">
            <Card className="shadow-lg border-0 login-card-animated" style={{ maxWidth: '450px' }}>
                <Card.Body className="p-5">
                    <div className="d-flex align-items-center justify-content-center">
                        <h3 className="text-center mb-0">Crie uma Nova Senha</h3>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Redefinir Senha"
                            content="Você chegou aqui através de um link enviado para o seu e-mail. Por favor, digite e confirme sua nova senha para recuperar o acesso à sua conta."
                        />
                    </div>
                    {mensagem &&
                        <div className='d-flex align-items-center mb-3 mt-2'>
                            <i class="bi bi-check-circle-fill text-success me-2"></i>
                            <div className="text text-success">{mensagem}</div>
                        </div>
                    }
                    {erro && (
                        <div className='d-flex align-items-center mb-3 mt-2'>
                            <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                            <div className="text text-danger">{erro}</div>
                        </div>

                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3 mt-3">
                            <Form.Label>Nova Senha</Form.Label>
                            <Form.Control type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
                            {senha && <PasswordStrengthMeter password={senha} />}
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirmar Nova Senha</Form.Label>
                            <Form.Control type="password" value={confirmarSenha} onChange={(e) => setConfirmarSenha(e.target.value)} required />
                        </Form.Group>
                        <div className="d-grid">
                            <Button type="submit" disabled={loading}>
                                {loading ? <Spinner size="sm" /> : 'Redefinir Senha'}
                            </Button>
                        </div>
                    </Form>
                </Card.Body>
            </Card>
        </div>
    );
};

export default ResetarSenha;