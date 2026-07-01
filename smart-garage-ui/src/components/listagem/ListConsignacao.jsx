import Header from '../Header';
import ConsignacaoDataService from '../../services/consignacaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalConsignacao from '../modais/ModalConsignacao';
import ModalEncerrarConsignacao from '../modais/ModalEncerrarConsignacao';
import { useAuth } from '../../context/AuthContext';
import ModalVerificarAutomovel from '../modais/ModalVerificarAutomovel';
import HelpPopover from '../HelpPopover';

const Consignacoes = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const { user } = useAuth();

    const consignacaoLocalStorage = { negocio: "Consignacao" };

    const [showEncerrarModal, setShowEncerrarModal] = useState(false);
    const [consignacaoSelecionada, setConsignacaoSelecionada] = useState(null);

    const [showClienteModal, setShowClienteModal] = useState(false);
    const [showAutomovelModal, setShowAutomovelModal] = useState(false);
    const [clienteSelecionadoId, setClienteSelecionadoId] = useState(null);

    useEffect(() => {
        const { startAutomovelCheck, clienteId } = location.state || {};

        if (startAutomovelCheck && clienteId) {

            setClienteSelecionadoId(clienteId);

            setShowAutomovelModal(true);

            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state, navigate]);

    const handleNovaConsignacaoClick = () => {
        sessionStorage.setItem("NegocioAtual", JSON.stringify({ negocio: "Consignacao" }));
        setShowClienteModal(true);
    };

    const handleClienteVerificado = (clienteId) => {
        setClienteSelecionadoId(clienteId);
        setShowClienteModal(false);
        setShowAutomovelModal(true);
    };

    const handleAutomovelVerificado = (resultado) => {
        setShowAutomovelModal(false);

        const statePayload = {
            clienteId: clienteSelecionadoId
        };

        if (resultado.status === 'inativo') {
            statePayload.automovelExistente = resultado.automovel;
        }

        navigate('/consignacao', { state: statePayload });
    };

    const handleAbrirModalEncerramento = (consignacao) => {
        setConsignacaoSelecionada(consignacao);
        setShowEncerrarModal(true);
    };

    const handleEncerramentoSucesso = (idConsignacaoEncerrada) => {
        fetchData();
    };

    const [todasConsignacoes, setTodasConsignacoes] = useState([]);
    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [opcao, setOpcao] = useState('ativas');
    const [periodo, setPeriodo] = useState('todos');

    const handleInputChangeOpcao = event => {
        const { value } = event.target;
        setOpcao(value);
    }

    const handleInputChangePeriodo = event => {
        const { value } = event.target;
        setPeriodo(value);
    }

    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(() => {
        setLoading(true);
        Promise.all([
            ConsignacaoDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
        ]).then(([consignacoes, automoveis, modelos, marcas]) => {
            setTodasConsignacoes(consignacoes.data)
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
        });
    }, []);


    useEffect(() => {
        fetchData();
    }, [fetchData]);


    const listaAtual = useMemo(() => {

        let dataInicioFiltro = null;

        if (periodo !== 'todos') {
            const hoje = new Date();
            const dataAlvo = new Date();

            if (periodo === 'ultimo_mes') dataAlvo.setMonth(hoje.getMonth() - 1);
            if (periodo === 'ultimos_3_meses') dataAlvo.setMonth(hoje.getMonth() - 3);
            if (periodo === 'ultimo_semestre') dataAlvo.setMonth(hoje.getMonth() - 6);

            dataInicioFiltro = new Date(Date.UTC(
                dataAlvo.getFullYear(),
                dataAlvo.getMonth(),
                dataAlvo.getDate()
            ));

        }

        return todasConsignacoes
            .filter(item => {
                if (!dataInicioFiltro) return true;
                return new Date(item.data_inicio) >= dataInicioFiltro;
            })
            .filter(item => {
                if (opcao === 'ativas') return item.ativo === true;
                if (opcao === 'inativas') return item.ativo === false;
                return true;
            })
            .sort((a, b) => new Date(b.data_inicio) - new Date(a.data_inicio));

    }, [opcao, periodo, todasConsignacoes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [opcao, periodo]);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const records = listaAtual.slice(firstIndex, lastIndex);
    const npage = Math.ceil(listaAtual.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

    const editarConsignacao = (id) => {
        navigate(`/editar-consignacao/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-consignacao/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Consignações</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciamento de Consignações"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Aqui você gerencia todos os contratos de consignação. A tela permite filtrar por contratos ativos ou finalizados e iniciar novos registros.
                                        </p>
                                        <strong>Fluxo "Nova Consignação":</strong>
                                        <ol className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Verificação do Cliente:</strong> Primeiro, identifique o proprietário do veículo (cliente).
                                            </li>
                                            <li className="mb-1">
                                                <strong>Verificação do Automóvel:</strong> Em seguida, informe os dados do veículo para verificar se ele já existe no sistema (reativação) ou se é um novo cadastro.
                                            </li>
                                            <li>
                                                <strong>Formulário de Consignação:</strong> Finalmente, preencha os detalhes do contrato, como o valor acordado com proprietário e a data de início.
                                            </li>
                                        </ol>
                                        <strong>Ações da Lista:</strong>
                                        <ul className='mt-2' style={{ textAlign: "justify" }}>
                                            <li><strong>Visualizar/Editar:</strong> Acessa os detalhes ou permite a correção do registro.</li>
                                            <li><strong>Encerrar:</strong> Finaliza um contrato ativo, registrando a data de encerramento.</li>
                                        </ul>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Listagem e gerenciamento de consignações.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={handleNovaConsignacaoClick}>
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Nova Consignação
                    </button>
                </div>

                <div className="card shadow-sm mb-4">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Consignações {opcao === "ativas" ? "Ativas" : "Finalizadas"}</h5>
                        <div className="d-flex align-items-center gap-2">
                            <select name="opcao" id="opcao" className="form-select w-auto" onChange={handleInputChangeOpcao}>
                                <option value="ativas">Ativas</option>
                                <option value="inativas">Finalizadas</option>
                            </select>

                            <select name="periodo" id="periodo" className="form-select w-auto" onChange={handleInputChangePeriodo} value={periodo}>
                                <option value="todos">Todo o Período</option>
                                <option value="ultimo_mes">Último Mês</option>
                                <option value="ultimos_3_meses">Últimos 3 Meses</option>
                                <option value="ultimo_semestre">Último Semestre</option>
                            </select>
                        </div>

                    </div>

                    <div className="card-body">
                        {loading ? (
                            <div className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Carregando...</span>
                                </div>
                            </div>
                        ) : records.length > 0 ? (
                            <table className="table mt-4 table-hover">
                                <thead>
                                    <tr>
                                        <th scope="col" className='text-end pe-5' style={{ width: '10%' }}>ID</th>
                                        <th scope="col" className='ps-5' style={{ width: '25%' }}>Data Início</th>
                                        <th scope="col" className='' style={{ width: '35%' }}>Automóvel</th>
                                        <th scope="col" className='text-center' style={{ width: '10%' }}>Valor</th>
                                        <th scope="col" className="text-center" style={{ width: '20%' }}>Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const nomeModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row" className='text-end pe-5'>{d.id}</th>
                                                <td className='ps-5'>{new Date(d.data_inicio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${nomeModelo?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                </td>
                                                <td className="text-dark fw-bold text-end">{d.valor && `${parseFloat(d.valor).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`}</td>
                                                <td className="text-center ps-3">
                                                    <button className='btn btn-outline-info btn-sm me-2' onClick={() => verDetalhes(d.id)} title="Ver Detalhes"><i className="bi bi-eye-fill"></i></button>
                                                    {user.role === "gerente" &&
                                                        <button className='btn btn-outline-warning btn-sm me-2' onClick={() => editarConsignacao(d.id)} title="Editar"><i className="bi bi-pencil-fill"></i></button>}
                                                    {d.ativo && (
                                                        <button className='btn btn-outline-success btn-sm me-2' onClick={() => handleAbrirModalEncerramento(d)} title="Encerrar"><i className="bi bi-check-circle-fill"></i></button>
                                                    )}
                                                    {/* {user.role === "gerente" &&
                                                        <button className='btn btn-outline-danger btn-sm' onClick={() => handleAbrirModalConfirmacao(d)} title="Excluir"><i className="bi bi-trash-fill"></i></button>} */}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma consignação encontrada</h4>
                                <p className="text-muted">Não há registros que correspondam ao filtro selecionado.</p>
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {!loading && listaAtual.length > 0 && npage > 1 && (
                            <nav className="d-flex justify-content-center">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <span className="page-link pointer" onClick={prePage}>Anterior</span>
                                    </li>
                                    {numbers.map((n) => (
                                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                            <span className="page-link pointer" onClick={() => changeCPage(n)}>{n}</span>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                                        <span className="page-link pointer" onClick={nextPage}>Próximo</span>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>

                <ModalConsignacao
                    show={showClienteModal}
                    onHide={() => setShowClienteModal(false)}
                    consignacao={consignacaoLocalStorage}
                    onClienteVerificado={handleClienteVerificado}
                />

                {consignacaoSelecionada && (
                    <ModalEncerrarConsignacao
                        show={showEncerrarModal}
                        onHide={() => { setShowEncerrarModal(false) }}
                        consignacao={consignacaoSelecionada}
                        onSuccess={handleEncerramentoSucesso}
                    />
                )}

                <ModalVerificarAutomovel
                    show={showAutomovelModal}
                    onHide={() => setShowAutomovelModal(false)}
                    onAutomovelVerificado={handleAutomovelVerificado}
                />

            </div>
        </>
    );

}

export default Consignacoes;