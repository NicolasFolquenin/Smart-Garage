import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import ManutencaoDataService from '../../services/manutencaoDataService';

const ModalFinalizarManutencao = ({ show, onHide, manutencao, onSuccess }) => {
    const [dataRetorno, setDataRetorno] = useState(new Date());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (show) {
            setError('');
            setDataRetorno(new Date());
        }
    }, [show]);

    const handleFinalizar = async () => {
        if (!manutencao || !manutencao.id) return;

        setLoading(true);
        setError('');

        try {
            await ManutencaoDataService.finalizar(manutencao.id, {
                data_retorno: dataRetorno
            });

            onSuccess(manutencao.id);
            onHide();
        } catch (err) {
            const msg = err.response?.data?.mensagemErro || "Erro ao finalizar manutenção.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Finalizar Manutenção</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}

                <p>Selecione a data de retorno do automóvel. Esta ação definirá a manutenção como <strong>finalizada</strong>.</p>

                <Form.Group>
                    <Form.Label className="fw-bold">Data de Retorno</Form.Label>
                    <DatePicker
                        calendarClassName="custom-datepicker-container"
                        className="form-control"
                        selected={dataRetorno}
                        onChange={(date) => setDataRetorno(date)}
                        dateFormat="dd/MM/yyyy"
                        required
                    />
                </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant="primary" onClick={handleFinalizar} disabled={loading}>
                    {loading ? 'Finalizando...' : 'Confirmar Finalização'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalFinalizarManutencao;