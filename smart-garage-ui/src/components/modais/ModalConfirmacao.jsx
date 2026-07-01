import { Modal, Button } from 'react-bootstrap';

const ModalConfirmacao = ({ show, onHide, onConfirm, titulo, corpo, loading, botao, status }) => {
    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>{titulo || "Confirmar Ação"}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {corpo || "Você tem certeza que deseja prosseguir com esta ação?"}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide} disabled={loading}>
                    Cancelar
                </Button>
                <Button variant={`${status ? (status === true ? "outline-success" : "outline-danger") : "outline-danger"}`} onClick={onConfirm} disabled={loading}>
                    {botao ? botao : 'Confirmar Exclusão'}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ModalConfirmacao;