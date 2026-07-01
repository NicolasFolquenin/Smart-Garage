import { Modal, Button, Form, InputGroup, Alert } from 'react-bootstrap';
import { FaSearch, FaUserPlus, FaExclamationTriangle, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from 'react';
import FisicaDataService from '../../services/fisicaDataService';
import JuridicaDataService from '../../services/juridicaDataService';

function ModalTroca({ show, onHide, troca, onClienteVerificado }) {
    const navigate = useNavigate();
    const [identificacao, setId] = useState('');
    const [cadastro, setCadastro] = useState(false);


    const handleRedirect = (path, state) => {
        sessionStorage.setItem("NegocioAtual", JSON.stringify(troca));
        onHide();
        navigate(path, { state });

    };

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.body.style.overflow = 'auto';
        };

    }, [show]);

    if (!show) {
        return null;
    }

    const buscaCliente = async (identificacao) => {

        try {

            const [fisicaResp, juridicaResp] = await Promise.all([
                FisicaDataService.getByCpf(identificacao)
                    .catch(error => {
                        console.warn(`CPF não encontrado ou erro na busca: ${error.message}`);
                        return null; // Retorna null em caso de erro
                    }),
                JuridicaDataService.getByCnpj(identificacao)
                    .catch(error => {
                        console.warn(`CNPJ não encontrado ou erro na busca: ${error.message}`);
                        return null; // Retorna null em caso de erro
                    })
            ]);


            const fisicaEncontrada = fisicaResp?.data?.[0];
            const juridicaEncontrada = juridicaResp?.data?.[0];


            if (fisicaEncontrada?.id && fisicaEncontrada?.clienteId) {

                onClienteVerificado(fisicaEncontrada.clienteId);

            } else if (juridicaEncontrada?.id && juridicaEncontrada?.clienteId) {
                onClienteVerificado(juridicaEncontrada.clienteId);

            } else {
                setCadastro(true);
            }
        } catch (e) {
            console.log("Erro na busca do cliente:", e);
        }
    }

    const handleSubmit = (event) => {
        event.preventDefault();

        if (identificacao.trim()) {
            buscaCliente(identificacao);
        } else {
            alert('Por favor, informe um CPF ou CNPJ.');
        }
    };


    return (
        <Modal show={show} onHide={onHide} backdrop="static" keyboard={false}>
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center">
                    <FaUserPlus className="me-2" />
                    Registro de Troca
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className={cadastro ? "d-none" : ""}>
                    <p className="text-muted mb-3">
                        Para começar, informe o CPF ou CNPJ do fornecedor do automóvel.
                    </p>
                    <Form onSubmit={handleSubmit}>
                        <Form.Group>
                            <InputGroup>
                                <InputGroup.Text>
                                    <FaSearch />
                                </InputGroup.Text>
                                <Form.Control
                                    id="cpfCnpj"
                                    type="text"
                                    value={identificacao}
                                    onChange={(e) => setId(e.target.value)}
                                    placeholder="Digite o CPF ou CNPJ..."
                                    autoFocus
                                />
                            </InputGroup>
                        </Form.Group>

                        <div className="d-grid gap-2 mt-4">
                            <Button variant="primary" type="submit" size="md">
                                Buscar Cliente
                            </Button>
                            <Button variant="link" onClick={() => handleRedirect('/cliente')} className="text-secondary">
                                Não sei o documento, cadastrar novo
                            </Button>
                        </div>
                    </Form>
                </div>

                {cadastro && (
                    <>
                        <Alert variant="warning" className="d-flex align-items-center">
                            <FaExclamationTriangle className="me-3" size="2em" />
                            <div>
                                <Alert.Heading style={{ fontSize: "large" }}>Cliente não encontrado!</Alert.Heading>
                                Verifique o documento informado ou cadastre um novo cliente no sistema.
                            </div>
                        </Alert>

                        <div className="d-flex justify-content-center gap-3 mt-4">
                            <Button variant="outline-secondary" onClick={() => setCadastro(false)}>
                                <FaArrowLeft className="me-2" />
                                Tentar Novamente
                            </Button>
                            <Button variant="primary" onClick={() => handleRedirect('/cliente')}>
                                <FaUserPlus className="me-2" />
                                Cadastrar Fornecedor
                            </Button>
                        </div>
                    </>
                )}
            </Modal.Body>
        </Modal>
    );
}

export default ModalTroca;