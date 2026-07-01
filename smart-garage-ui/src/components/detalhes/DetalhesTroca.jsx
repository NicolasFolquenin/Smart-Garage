import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import TrocaDataService from '../../services/trocaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import FuncionarioDataService from '../../services/funcionarioDataService';
import EnderecoDataService from '../../services/enderecoDataService';
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';
import { Card, Badge, ListGroup, Row, Col } from 'react-bootstrap';

const DetalhesTroca = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState(null);
    const [automovelFornecido, setAutomovelFornecido] = useState(null);
    const [funcionario, setFuncionario] = useState([]);
    const [endereco, setEndereco] = useState([]);
    const [cidade, setCidade] = useState([]);
    const [estado, setEstado] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        TrocaDataService.getDetalhesById(id)
            .then(response => {
                const detalhesTroca = response.data;
                setDetalhes(detalhesTroca);

                {
                    AutomovelDataService.getDetalhesById(detalhesTroca.automovel_fornecido)
                        .then(autoResp => {
                            setAutomovelFornecido(autoResp.data);
                        })
                        .catch(e => {
                            console.error("Erro ao buscar automóvel fornecido:", e);
                            // Define um erro amigável caso o carro não seja encontrado
                            setAutomovelFornecido({ error: "Automóvel fornecido não encontrado." });
                        });
                }
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da troca:", e);
                setError("Não foi possível carregar os detalhes da troca. Tente novamente mais tarde.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            FuncionarioDataService.getAll(),
            EnderecoDataService.getAll(),
            CidadeDataService.getAll(),
            EstadoDataService.getAll()
        ]).then(([funcionarios, enderecos, cidades, estados]) => {
            setFuncionario(funcionarios.data);
            setEndereco(enderecos.data);
            setCidade(cidades.data);
            setEstado(estados.data);
        }).catch(e => {
            console.error("Erro ao carregar dados:", e);
        })
    }, []);

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando detalhes...</span>
                    </div>
                    <p className="mt-2">Carregando detalhes da troca...</p>
                </div>
            </>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <div className="alert alert-danger container mt-5" role="alert">
                    <h4 className="alert-heading">Erro ao Carregar!</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Voltar</button>
                </div>
            </>
        );
    }

    if (!detalhes) {
        return (
            <>
                <Header />
                <div className="alert alert-warning container mt-5" role="alert">
                    <h4 className="alert-heading">Troca Não Encontrada</h4>
                    <p>Nenhuma informação detalhada foi encontrada.</p>
                    <hr />
                    <button className="btn btn-primary" onClick={() => navigate(-1)}>Voltar</button>
                </div>
            </>
        );
    }

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });

    const { automovel, cliente } = detalhes;

    const funcionarioNome = funcionario?.find(f => f.id === detalhes?.funcionarioId);
    const enderecoInfo = endereco?.find(e => e.clienteId === cliente?.id)
    const cidadeInfo = cidade?.find(c => c.id === enderecoInfo?.cidadeId)
    const estadoInfo = estado?.find(e => e.id === cidadeInfo?.estadoId)

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Detalhes da Troca
                        </h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações da operação de troca.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="d-flex flex-column gap-4">

                    <Row className="g-4">
                        <Col lg={6}>
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                        <i className="bi bi-car-front-fill text-primary me-2"></i>
                                        Automóvel Recebido
                                    </h5>
                                    <ListGroup variant="flush">
                                        <ListGroup.Item><strong>Marca:</strong> {automovel?.marca?.nome || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Modelo:</strong> {automovel?.modelo?.nome || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Ano/Modelo:</strong> {`${automovel?.ano_fabricacao || 'N/A'} / ${automovel?.ano_modelo || 'N/A'}`}</ListGroup.Item>
                                        <ListGroup.Item><strong>Placa:</strong> {automovel?.placa || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Cor:</strong> {automovel?.cor || 'N/A'}</ListGroup.Item>
                                        <ListGroup.Item><strong>Renavam:</strong> {automovel?.renavam || 'N/A'}</ListGroup.Item>
                                    </ListGroup>
                                </Card.Body>
                            </Card>
                        </Col>

                        <Col lg={6}>
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                        <i className="bi bi-car-front-fill text-primary me-2"></i>
                                        Automóvel Fornecido
                                    </h5>
                                    {automovelFornecido ? (
                                        automovelFornecido.error ? (
                                            <div className="alert alert-danger p-2">{automovelFornecido.error}</div>
                                        ) : (
                                            <ListGroup variant="flush">
                                                <ListGroup.Item><strong>Marca:</strong> {automovelFornecido.marca?.nome || 'N/A'}</ListGroup.Item>
                                                <ListGroup.Item><strong>Modelo:</strong> {automovelFornecido?.modelo?.nome || 'N/A'}</ListGroup.Item>
                                                <ListGroup.Item><strong>Ano/Modelo:</strong> {`${automovelFornecido.ano_fabricacao || 'N/A'}/${automovelFornecido.ano_modelo || 'N/A'}`}</ListGroup.Item>
                                                <ListGroup.Item><strong>Placa:</strong> {automovelFornecido.placa || 'N/A'}</ListGroup.Item>
                                                <ListGroup.Item><strong>Cor:</strong> {automovelFornecido.cor || 'N/A'}</ListGroup.Item>
                                                <ListGroup.Item><strong>Renavam:</strong> {automovelFornecido.renavam || 'N/A'}</ListGroup.Item>
                                            </ListGroup>
                                        )
                                    ) : (
                                        <p className="text-muted">Carregando...</p>
                                    )}
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                <i className="bi bi-person-fill text-primary me-2"></i>
                                Informações do Fornecedor
                            </h5>
                            {cliente && (
                                <ListGroup variant="flush">
                                    <ListGroup.Item><strong>Nome:</strong> {cliente.nome || 'N/A'}</ListGroup.Item>
                                    {cliente.fisica?.cpf && <ListGroup.Item><strong>CPF:</strong> {cliente.fisica.cpf}</ListGroup.Item>}
                                    {cliente.juridica?.cnpj && <ListGroup.Item><strong>CNPJ:</strong> {cliente.juridica.cnpj}</ListGroup.Item>}
                                    <ListGroup.Item><strong>Telefone:</strong> {cliente.telefone || 'N/A'}</ListGroup.Item>
                                    <ListGroup.Item><strong>Email:</strong> {cliente.email || 'N/A'}</ListGroup.Item>
                                    <ListGroup.Item><strong>Endereço:</strong> {
                                        enderecoInfo
                                            ? `${enderecoInfo.logradouro}, ${enderecoInfo.numero}, ${enderecoInfo.bairro} - ${cidadeInfo?.nome || ''} (${estadoInfo?.uf || ''})`
                                            : 'N/A'
                                    }</ListGroup.Item>
                                </ListGroup>
                            )}
                        </Card.Body>
                    </Card>

                    <Card className="shadow-sm">
                        <Card.Body>
                            <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                Detalhes da Operação
                            </h5>
                            <ListGroup variant="flush">
                                <ListGroup.Item><strong>Funcionário Responsável:</strong> {funcionarioNome?.nome || "N/A"}</ListGroup.Item>
                                <ListGroup.Item>
                                    <strong className='me-1'>Valor da Diferença:</strong>{formatter.format(detalhes.valor)}
                                </ListGroup.Item>
                                {detalhes.valor > 0 && <ListGroup.Item><strong>Forma de Pagamento:</strong> {detalhes.forma_pagamento || "N/A"}</ListGroup.Item>}
                                <ListGroup.Item><strong>Comissão:</strong> {formatter.format(detalhes.comissao)}</ListGroup.Item>
                                <ListGroup.Item><strong>Data:</strong> {new Date(detalhes.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</ListGroup.Item>
                            </ListGroup>
                        </Card.Body>
                    </Card>

                </div>
            </div >
        </>
    );
};

export default DetalhesTroca;