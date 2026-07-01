import Header from '../Header';
import ManutencaoDataService from '../../services/manutencaoDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../modais/ModalConfirmacao';
import ModalFinalizarManutencao from '../modais/ModalFinalizarManutencao';
import { useAuth } from '../../context/AuthContext';
import HelpPopover from '../HelpPopover';

const Manutencao = () => {

    const navigate = useNavigate();

    const { user } = useAuth();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [todasManutencoes, setTodasManutencoes] = useState([]);


    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleAbrirModalConfirmacao = (troca) => {
        setItemParaDeletar(troca);
        setShowConfirmModal(true);
    };

    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    const handleDeletarManutencao = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await ManutencaoDataService.remove(itemParaDeletar.id);
            setTodasManutencoes(prev => prev.filter(t => t.id !== itemParaDeletar.id));
            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar manutenção:", error);
        } finally {
            setDeleteLoading(false);
        }
    };


    const [showFinalizarModal, setShowFinalizarModal] = useState(false);
    const [manutencaoSelecionada, setManutencaoSelecionada] = useState(null);

    const handleAbrirModalFinalizar = (manutencao) => {
        setManutencaoSelecionada(manutencao);
        setShowFinalizarModal(true);
    };

    const handleFinalizacaoSucesso = (idManutencaoFinalizada) => {
        fetchData();
    };



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
            ManutencaoDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
        ]).then(([manutencoes, automoveis, modelos, marcas]) => {
            setTodasManutencoes(manutencoes.data);
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

        return todasManutencoes
            .filter(item => {
                if (!dataInicioFiltro) return true;
                return new Date(item.data_envio) >= dataInicioFiltro;
            })
            .filter(item => {
                if (opcao === 'ativas') return item.ativo === true;
                if (opcao === 'inativas') return item.ativo === false;
                return true;
            })
            .sort((a, b) => new Date(b.data_envio) - new Date(a.data_envio));

    }, [opcao, periodo, todasManutencoes]);

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

    const editarManutencao = (id) => {
        navigate(`/editar-manutencao/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-manutencao/${id}`);
    }


    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Manutenções</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciamento de Manutenções"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta tela controla os veículos que foram enviados para serviços de manutenção em oficinas externas.
                                        </p>
                                        <strong>Funcionalidades:</strong>
                                        <ul className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Nova Manutenção:</strong> (Visível para gerentes) Permite registrar o envio de um novo veículo para manutenção, informando o serviço, valor orçado e previsão de retorno.
                                            </li>
                                            <li className="mb-1">
                                                <strong>Filtros:</strong> Você pode alternar a visualização entre manutenções "Ativas" (em andamento) e "Finalizadas", além de filtrar por período.
                                            </li>
                                            <li>
                                                <strong>Ações:</strong> Utilize os botões para ver detalhes, editar ou "Finalizar" uma manutenção, registrando a data de retorno do veículo.
                                            </li>
                                        </ul>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Listagem e gerenciamento de manutenções.</p>
                    </div>
                    {user.role === "gerente" &&
                        <button className='btn btn-primary btn-lg' onClick={() => { navigate('/manutencao') }}>
                            <i className="bi bi-plus-circle-fill me-2"></i>
                            Nova Manutenção
                        </button>}
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Manutenções</h5>


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
                                        <th scope="col" className='text-end pe-5' style={{ width: '5%' }}>ID</th>
                                        <th scope="col" className='' style={{ width: '15%' }}>Data Envio</th>
                                        <th scope="col" className='' style={{ width: '15%' }}>
                                            {opcao === 'ativas' ? 'Previsão de Retorno' : 'Data Retorno'}
                                        </th>
                                        <th scope="col" className='ps-5' style={{ width: '30%' }}>Automóvel</th>
                                        <th scope="col" className='text-center ps-5' style={{ width: '10%' }}>Valor</th>
                                        <th scope="col" className="text-center" style={{ width: '20%' }}>Ações
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map((d) => {
                                        const auto = automovel.find(a => a.id === d.automovelId);
                                        const nomeMarca = marca.find(m => m.id === auto?.marcaId);
                                        const noModelo = modelo.find(mo => mo.id === auto?.modeloId);

                                        return (
                                            <tr key={d.id} className="align-middle">
                                                <th scope="row" className='text-end pe-5'>{d.id}</th>
                                                <td>{new Date(d.data_envio).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</td>
                                                <td>
                                                    {d.ativo ?
                                                        (d.previsao_retorno ? new Date(d.previsao_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '')
                                                        :
                                                        (d.data_retorno ? new Date(d.data_retorno).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A')
                                                    }
                                                </td>

                                                <td className='ps-5'>
                                                    <div className="fw-bold">{`${nomeMarca?.nome ?? ''} ${noModelo?.nome ?? ''}`}</div>
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

                                                    {user.role === "gerente" &&
                                                        <button
                                                            className='btn btn-outline-warning btn-sm me-2'
                                                            onClick={() => { editarManutencao(d.id) }}
                                                            title="Editar Manutenção"
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>}

                                                    {d.ativo && user.role === "gerente" && (
                                                        <button
                                                            className='btn btn-outline-success btn-sm me-2'
                                                            onClick={() => handleAbrirModalFinalizar(d)}
                                                            title="Finalizar Manutenção"
                                                        >
                                                            <i className="bi bi-check-circle-fill"></i>
                                                        </button>
                                                    )}


                                                    {/* {user.role === "gerente" &&
                                                        <button
                                                            className='btn btn-outline-danger btn-sm'
                                                            onClick={() => handleAbrirModalConfirmacao(d)}
                                                            title="Excluir Manutenção"
                                                        >
                                                            <i className="bi bi-trash-fill"></i>
                                                        </button>} */}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma manutenção encontrada</h4>
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
            </div>

            <ModalConfirmacao
                show={showConfirmModal}
                onHide={handleFecharModalConfirmacao}
                onConfirm={handleDeletarManutencao}
                loading={deleteLoading}
                titulo="Confirmar Exclusão de Manutenção"
                corpo={
                    <>
                        <p>Você tem certeza que deseja excluir o registro de manutenção?</p>
                        <p><strong>Atenção:</strong> Esta ação <strong>não</strong> pode ser desfeita.</p>
                        <ul>
                            <li>O registro dessa <strong>manutenção</strong> será excluído <strong>permanentemente</strong>.</li>
                        </ul>
                    </>
                }
            />

            {manutencaoSelecionada && (
                <ModalFinalizarManutencao
                    show={showFinalizarModal}
                    onHide={() => setShowFinalizarModal(false)}
                    manutencao={manutencaoSelecionada}
                    onSuccess={handleFinalizacaoSucesso}
                />
            )}
        </>
    );

}

export default Manutencao;