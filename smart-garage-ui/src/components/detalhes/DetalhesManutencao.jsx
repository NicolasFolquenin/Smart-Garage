import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../Header';
import ManutencaoDataService from '../../services/manutencaoDataService';
import { Card, Badge, ListGroup } from 'react-bootstrap';

const DetalhesManutencao = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [detalhes, setDetalhes] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        ManutencaoDataService.getDetalhesById(id)
            .then(response => {
                setDetalhes(response.data);
            })
            .catch(e => {
                console.error("Erro ao buscar detalhes da manutenção:", e);
                setError("Não foi possível carregar os detalhes da manutenção. Tente novamente mais tarde.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [id]);

    if (loading) {
        return (
            <>
                <Header />
                <div className="container mt-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando detalhes...</span>
                    </div>
                    <p className="mt-2">Carregando detalhes da manutenção...</p>
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
                    <h4 className="alert-heading">Manutencao Não Encontrada</h4>
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

    const { automovel } = detalhes;

    return (
        <>
            <Header />
            <div className="container mt-4 mb-5">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <h1 className="fw-bold mb-0 text-primary">
                            <i className="bi bi-file-earmark-text me-3"></i>
                            Detalhes da Manutenção</h1>
                        <p className="text-muted fs-6 mt-1">Visão completa das informações sobre a manutenção.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate(-1)}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                <div className="d-flex flex-column gap-4">

                    <div className="row g-4">
                        <div>
                            <Card className="shadow-sm h-100">
                                <Card.Body>
                                    <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                        <i className="bi bi-car-front-fill text-primary me-2"></i>
                                        Detalhes do Automóvel
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
                        </div>
                    </div>

                    <div>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <h5 className="card-title d-flex align-items-center border-bottom pb-2 mb-3">
                                    <i className="bi bi-info-circle-fill text-primary me-2"></i>
                                    Informações da Manutenção
                                </h5>
                                <ListGroup variant="flush">
                                    <ListGroup.Item><strong>Data de Envio:</strong> {detalhes?.data_envio ? new Date(detalhes.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</ListGroup.Item>
                                    <ListGroup.Item><strong>Data de Retorno:</strong> {detalhes?.data_retorno ? new Date(detalhes.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : ''}</ListGroup.Item>
                                    <ListGroup.Item><strong>Valor:</strong> <span>{formatter.format(detalhes.valor)}</span></ListGroup.Item>
                                    <ListGroup.Item><strong className='me-1'>Descrição:</strong>{detalhes.descricao}</ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    </div>

                </div>
            </div >
        </>
    );
};

export default DetalhesManutencao;