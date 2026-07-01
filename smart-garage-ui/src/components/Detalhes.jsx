import { useEffect } from "react";
import Header from "./Header";
import { useNavigate, useParams } from "react-router-dom";
import AutomovelDataService from "../services/automovelDataService";
import React from "react";
import { useCallback, useState } from "react";
import ModalVenda from "./modais/ModalVenda";
import ModeloDataService from "../services/modeloDataService";
import MarcaDataService from "../services/marcaDataService";
import { FaCar } from "react-icons/fa";
import HelpPopover from "./HelpPopover";

const Detalhes = () => {

    const vendaLocalStorage = { negocio: "Venda" };

    const { id } = useParams();
    const [automovel, setAutomovel] = useState({});
    const [marca, setMarca] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showModal, setShowModal] = useState(false);

    const navigate = useNavigate();

    const consulta = useCallback(() => {
        AutomovelDataService.getById(id)
            .then(response => {
                setAutomovel(response.data);
            }).catch(e => {
                console.log("Erro ao buscar automóvel:", e);
            }).finally(() => {
                setLoading(false);
            });
    }, [id, navigate]);

    useEffect(() => {
        consulta();
    }, [consulta]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            MarcaDataService.getAll(),
            ModeloDataService.getAll(),
        ]).then(([marcasRes, modelosRes]) => {
            setMarca(marcasRes.data);
            setModelo(modelosRes.data);
        }).catch(e => {
            console.error("Erro ao carregar dados do estoque:", e);
        })
    }, []);


    if (loading) {
        return (
            <>
                <Header />
                <div className="d-flex justify-content-center align-items-center" style={{ height: '80vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando Detalhes...</span>
                    </div>
                </div>
            </>
        );
    }

    if (!automovel) {
        return (
            <>
                <Header />
                <div className="container py-5 text-center">
                    <h2>Automóvel não encontrado</h2>
                    <p>O Automóvel que você está procurando não existe ou foi removido.</p>
                    <Link to="/estoque" className="btn btn-primary">Voltar ao Estoque</Link>
                </div>
            </>
        );
    }

    const marcaNome = marca.find(m => m.id === automovel?.marcaId);
    const modeloNome = modelo.find(m => m.id === automovel?.modeloId);

    return (
        <>
            <Header />
            <div className="container py-5">
                <div className="row">
                    {/* Coluna da Imagem */}
                    <div className="col-lg-7">
                        {
                            automovel.imagem ? (
                                <img
                                    src={automovel.imagem !== null ? `http://localhost:3000/${automovel.imagem}` : "/fotos/no-photos.png"}
                                    alt="Imagem do Automóvel"
                                    className="img-fluid rounded shadow-lg w-100"
                                    style={{ objectFit: 'cover', maxHeight: '500px' }}
                                />) : (
                                <div
                                    className="d-flex justify-content-center align-items-center w-100 rounded"
                                    style={{
                                        height: '500px',
                                        backgroundColor: '#f8f9fa'
                                    }}
                                >
                                    <FaCar size={100} color="#6c757d" />
                                </div>
                            )
                        }
                    </div>

                    <div className="col-lg-5">
                        <div className="p-3">
                            <div className="d-flex align-items-center">
                                <h1 className="display-5 fw-bold mb-0 me-2">{`${marcaNome?.nome} ${modeloNome?.nome}`}</h1>
                                <HelpPopover
                                    id="page-help-popover"
                                    title="Ajuda: Detalhes do Automóvel"
                                    content={
                                        <>
                                            <p style={{ textAlign: "justify" }}>
                                                Esta página exibe as informações detalhadas de um veículo específico do seu estoque.
                                            </p>
                                            <strong>Ações Disponíveis:</strong>
                                            <ul className="mt-1" style={{ textAlign: "justify" }}>
                                                <li className="mb-1">
                                                    <strong>Editar:</strong> Permite corrigir ou atualizar qualquer informação cadastral do veículo, como valor, quilometragem, cor, etc.
                                                </li>
                                                <li className="mb-1">
                                                    <strong>Vender:</strong> Inicia o processo de venda para este automóvel, abrindo um modal para você identificar o cliente (comprador). Esta opção só está disponível para veículos ativos.
                                                </li>
                                                <li>
                                                    <strong>Voltar:</strong> Retorna para a tela de listagem do estoque.
                                                </li>
                                            </ul>
                                        </>
                                    }
                                />
                            </div>
                            <p className="lead text-muted">ID do Automóvel: {automovel && automovel.id}</p>

                            <h2 className="text-primary my-4">{automovel && automovel.valor && `${parseFloat(automovel.valor).toLocaleString('pt-BR', {
                                style: 'currency',
                                currency: 'BRL'
                            })}`}</h2>

                            <dl className="row">
                                <dt className="col-sm-4">Ano/Modelo</dt>
                                <dd className="col-sm-8">{automovel && automovel.ano_fabricacao} / {automovel && automovel.ano_modelo}</dd>

                                <dt className="col-sm-4">Cor</dt>
                                <dd className="col-sm-8">{automovel && automovel.cor}</dd>

                                <dt className="col-sm-4">Placa</dt>
                                <dd className="col-sm-8">{automovel && automovel.placa}</dd>

                                <dt className="col-sm-4">KM</dt>
                                <dd className="col-sm-8">{automovel && automovel.km} </dd>

                                <dt className="col-sm-4">Combustível</dt>
                                <dd className="col-sm-8">{automovel && automovel.combustivel} </dd>
                            </dl>

                            <hr />

                            {/* Botões de Ação */}
                            <div className="d-grid gap-2 d-md-flex justify-content-md-start mt-4">
                                <button onClick={() => navigate(`/editar-automovel/${automovel.id}`)} className="btn btn-primary btn-lg px-4 me-md-2">
                                    <i className="bi bi-pencil-fill me-2"></i>Editar
                                </button>
                                {automovel.ativo &&
                                    <button onClick={() => setShowModal(true)} className="btn btn-outline-secondary btn-lg px-4 me-md-2">
                                        <i className="bi bi-tag-fill me-2"></i>Vender
                                    </button>
                                }
                                <button onClick={() => navigate('/estoque')} className="btn btn-outline-secondary btn-lg px-4">
                                    <i class="bi bi-arrow-return-left me-2"></i>Voltar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <ModalVenda
                    show={showModal}
                    onHide={() => setShowModal(false)}
                    venda={vendaLocalStorage}
                    automovelId={automovel && automovel.id}
                />

            </div>
        </>
    );
}


export default Detalhes; 