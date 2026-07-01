import Header from '../Header';
import CompraDataService from '../../services/compraDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import ModalCompra from '../modais/ModalCompra';
import ModalVerificarAutomovel from '../modais/ModalVerificarAutomovel';
import HelpPopover from '../HelpPopover';

const Compras = () => {

    const navigate = useNavigate();
    const location = useLocation();

    const compraLocalStorage = { negocio: "Compra" };

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

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [todasCompras, setTodasCompras] = useState([]);

    const handleNovaCompraClick = () => {
        sessionStorage.setItem("NegocioAtual", JSON.stringify({ negocio: "Compra" }));
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

        navigate('/compra', { state: statePayload });
    };

    const [periodo, setPeriodo] = useState('todos');

    const handleInputChangePeriodo = event => {
        const { value } = event.target;
        setPeriodo(value);
    }

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            CompraDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([compras, automoveis, modelos, marcas]) => {
            setTodasCompras(compras.data);
            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
            clearTimeout(timeout);
        });
    }, []);


    const listaAtual = useMemo(() => {

        let dataFiltro = null;

        if (periodo !== 'todos') {
            const hoje = new Date();
            const dataAlvo = new Date();

            if (periodo === 'ultimo_mes') dataAlvo.setMonth(hoje.getMonth() - 1);
            if (periodo === 'ultimos_3_meses') dataAlvo.setMonth(hoje.getMonth() - 3);
            if (periodo === 'ultimo_semestre') dataAlvo.setMonth(hoje.getMonth() - 6);

            dataFiltro = new Date(Date.UTC(
                dataAlvo.getFullYear(),
                dataAlvo.getMonth(),
                dataAlvo.getDate()
            ));

        }

        return todasCompras
            .filter(item => {
                if (!dataFiltro) return true;
                return new Date(item.data) >= dataFiltro;
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [periodo, todasCompras]);

    useEffect(() => {
        setCurrentPage(1);
    }, [periodo]);


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

    const editarCompra = (id) => {
        navigate(`/editar-compra/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-compra/${id}`);
    }


    return (
        <>
            <Header />

            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Compras</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciamento de Compras"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta tela centraliza todas as compras de veículos feitas pela empresa. Daqui, você pode visualizar o histórico e iniciar o registro de novas aquisições.
                                        </p>
                                        <strong>Fluxo "Nova Compra":</strong>
                                        <ol className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Verificação do Cliente:</strong> Ao clicar em "Nova Compra", primeiro você irá identificar o forncedor (cliente). Você pode selecionar um existente ou cadastrar um novo.
                                            </li>
                                            <li className="mb-1">
                                                <strong>Verificação do Automóvel:</strong> Em seguida, o sistema perguntará sobre o veículo. Se ele já esteve no seu estoque, você entrará no modo de "Reativação". Caso contrário, seguirá para o cadastro de um novo automóvel.
                                            </li>
                                            <li>
                                                <strong>Formulário de Compra:</strong> Por fim, você será levado ao formulário final para preencher os detalhes financeiros da transação.
                                            </li>
                                        </ol>
                                        <strong>Funcionalidades da Lista:</strong>
                                        <p className='mb-0 mt-2' style={{ textAlign: "justify" }}>Use o filtro de período para refinar sua busca e os botões de ação para visualizar ou editar os detalhes de cada compra.</p>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Listagem e gerenciamento de compras.</p>
                    </div>
                    <button className='btn btn-primary btn-lg' onClick={handleNovaCompraClick}>
                        <i className="bi bi-plus-circle-fill me-2"></i>
                        Nova Compra
                    </button>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Compras</h5>
                        <select name="periodo" id="periodo" className="form-select w-auto" onChange={handleInputChangePeriodo} value={periodo}>
                            <option value="todos">Todo o Período</option>
                            <option value="ultimo_mes">Último Mês</option>
                            <option value="ultimos_3_meses">Últimos 3 Meses</option>
                            <option value="ultimo_semestre">Último Semestre</option>
                        </select>
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
                                        <th scope="col" className='ps-5' style={{ width: '25%' }}>Data</th>
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
                                                <td className='ps-5'>{new Date(d.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${nomeModelo?.nome ?? ''}`}</div>
                                                    <small className="text-muted">{`Placa: ${auto?.placa}`}</small>
                                                </td>
                                                <td className="text-dark fw-bold text-end">{d.valor && `${parseFloat(d.valor).toLocaleString('pt-BR', {
                                                    style: 'currency',
                                                    currency: 'BRL'
                                                })}`}</td>
                                                <td className='text-center ps-3'>
                                                    <button
                                                        className='btn btn-outline-info btn-sm me-2'
                                                        onClick={() => { verDetalhes(d.id) }}
                                                        title="Ver Detalhes"
                                                    >
                                                        <i className="bi bi-eye-fill"></i>
                                                    </button>

                                                    <button
                                                        className='btn btn-outline-warning btn-sm me-2'
                                                        onClick={() => { editarCompra(d.id) }}
                                                        title="Editar Compra"
                                                    >
                                                        <i className="bi bi-pencil-fill"></i>
                                                    </button>

                                                </td>
                                            </tr>

                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma compra encontrada</h4>
                                <p className="text-muted">Não há registros que correspondam ao filtro selecionado.</p>
                            </div>
                        )}
                    </div>

                    <div className="card-footer bg-light">
                        {!loading && listaAtual.length > 0 && npage > 1 && (
                            <nav className="d-flex justify-content-center">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={prePage}>Anterior</button>
                                    </li>
                                    {numbers.map((n) => (
                                        <li className={`page-item ${currentPage === n ? 'active' : ''}`} key={n}>
                                            <button className="page-link" onClick={() => changeCPage(n)}>{n}</button>
                                        </li>
                                    ))}
                                    <li className={`page-item ${currentPage === npage ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={nextPage}>Próximo</button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </div>

                <ModalCompra
                    show={showClienteModal}
                    onHide={() => setShowClienteModal(false)}
                    compra={compraLocalStorage}
                    onClienteVerificado={handleClienteVerificado}
                />

                <ModalVerificarAutomovel
                    show={showAutomovelModal}
                    onHide={() => setShowAutomovelModal(false)}
                    onAutomovelVerificado={handleAutomovelVerificado}
                />

            </div >
        </>

    );

}

export default Compras;