import { useState } from 'react';
import { Modal, Button, Form, Alert, Spinner } from 'react-bootstrap';
import AuthService from '../../services/authDataService';

function ModalEsqueciSenha({ show, onHide }) {
    const [usuario, setUsuario] = useState('');
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMensagem('');
        try {
            const response = await AuthService.solicitarResetSenha({ usuario });
            setMensagem(response.data.mensagem);
        } catch (error) {
            setMensagem('Ocorreu um erro. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMensagem('');
        setUsuario('');
        onHide();
    }

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Recuperar Senha</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {mensagem ? (
                    <Alert variant="info">{mensagem}</Alert>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <Form.Label>Informe seu nome de usuário</Form.Label>
                            <Form.Control
                                type="text"
                                value={usuario}
                                onChange={(e) => setUsuario(e.target.value)}
                                required
                                autoFocus
                            />
                        </Form.Group>
                        <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
                            {loading ? <Spinner size="sm" /> : 'Enviar Link de Recuperação'}
                        </Button>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    )
}


export default ModalEsqueciSenha;