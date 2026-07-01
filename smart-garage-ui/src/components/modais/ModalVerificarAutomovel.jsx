import { useState } from 'react';
import AutomovelDataService from '../../services/automovelDataService';
import { Modal, Button, Form, InputGroup, Alert, Spinner } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";

function ModalVerificarAutomovel({ show, onHide, onAutomovelVerificado }) {
    const [identificador, setIdentificador] = useState('');
    const [loading, setLoading] = useState(false);
    const [feedback, setFeedback] = useState({ tipo: '', msg: '' });

    const handleVerificar = async () => {
        setLoading(true);
        setFeedback({ tipo: '', msg: '' });
        try {

            let data;
            const identificadorLimpo = identificador.trim();

            if (identificadorLimpo.length === 0) {
                alert("Por favor, informe uma Placa ou Renavam.")
                return;
            }
            else if (identificadorLimpo.length === 7) {
                data = { placa: identificadorLimpo.toUpperCase() };
            }
            else if (identificadorLimpo.length === 11) {
                if (isNaN(identificadorLimpo)) {
                    setFeedback({ tipo: 'danger', msg: 'Renavam inválido. Deve conter apenas números.' });
                    setLoading(false);
                    return;
                }
                data = { renavam: identificadorLimpo };
            }
            else {
                setFeedback({ tipo: 'danger', msg: 'Placa ou Renavam inválido' });
                setLoading(false);
                return;
            }

            const response = await AutomovelDataService.verificarStatus(data);

            onAutomovelVerificado(response.data);
            onHide();
        } catch (error) {
            const data = error.response?.data;
            if (data && data.status === 'ativo') {
                setFeedback({ tipo: 'danger', msg: data.mensagem });
            } else {
                setFeedback({ tipo: 'danger', msg: 'Erro ao verificar o automóvel.' });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setIdentificador('');
        setFeedback({ tipo: '', msg: '' });
        onHide();
    }

    return (

        <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaUserPlus className="me-2" />
                    Verificar Automóvel
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>

                <p className="text-muted mb-3">
                    Informe a Placa ou Renavam do automóvel a ser registrado.
                </p>
                <Form>
                    <Form.Group>
                        <InputGroup>
                            <InputGroup.Text>
                                <FaSearch />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                value={identificador}
                                onChange={(e) => setIdentificador(e.target.value.toLocaleUpperCase())}
                                placeholder='Digite a Placa ou Renavam...'
                                autoFocus
                            />
                        </InputGroup>
                    </Form.Group>
                </Form>
                {feedback.msg && feedback.tipo == "danger" &&
                    <div className='d-flex align-items-center mt-1 container'>
                        <i className="bi bi-exclamation-triangle-fill text-danger me-2"></i>
                        <div className="text text-danger">{feedback.msg}</div>
                    </div>
                }
            </Modal.Body >
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancelar</Button>
                <Button variant="primary" onClick={handleVerificar} disabled={loading}>
                    {loading ? <Spinner size="sm" /> : 'Verificar'}
                </Button>
            </Modal.Footer>

        </Modal >
    );
}

export default ModalVerificarAutomovel;