import Header from '../Header';
import VendaDataService from '../../services/vendaDataService';
import AutomovelDataService from '../../services/automovelDataService';
import ModeloDataService from '../../services/modeloDataService';
import MarcaDataService from '../../services/marcaDataService';
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalConfirmacao from '../modais/ModalConfirmacao';
import { useAuth } from '../../context/AuthContext';
import HelpPopover from '../HelpPopover';

const Vendas = () => {

    const { user } = useAuth();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [todasVendas, setTodasVendas] = useState([]);

    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [itemParaDeletar, setItemParaDeletar] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleAbrirModalConfirmacao = (venda) => {
        setItemParaDeletar(venda);
        setShowConfirmModal(true);
    };

    const handleFecharModalConfirmacao = () => {
        setItemParaDeletar(null);
        setShowConfirmModal(false);
    };

    const handleDeletarVenda = async () => {
        if (!itemParaDeletar) return;

        setDeleteLoading(true);
        try {
            await VendaDataService.remove(itemParaDeletar.id);
            setTodasVendas(prev => prev.filter(v => v.id !== itemParaDeletar.id));
            handleFecharModalConfirmacao();
        } catch (error) {
            console.error("Erro ao deletar venda:", error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const navigate = useNavigate();

    const [periodo, setPeriodo] = useState('todos');
    const [origem, setOrigem] = useState('todas');

    const handleInputChangePeriodo = event => {
        const { value } = event.target;
        setPeriodo(value);
    }

    const handleInputChangeOrigem = event => {
        setOrigem(event.target.value);
    };

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            VendaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
        ]).then(([vendas, automoveis, modelos, marcas]) => {
            setTodasVendas(vendas.data);
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

        return todasVendas
            .filter(venda => {
                if (origem === 'todas') return true;
                return venda.origem_automovel === origem;
            })
            .filter(item => {
                if (!dataFiltro) return true;
                return new Date(item.data) >= dataFiltro;
            })
            .sort((a, b) => new Date(b.data) - new Date(a.data));

    }, [periodo, todasVendas, origem]);

    useEffect(() => {
        setCurrentPage(1);
    }, [periodo, origem]);


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

    const editarVenda = (id) => {
        navigate(`/editar-venda/${id}`)
    }

    const verDetalhes = (id) => {
        navigate(`/detalhes-venda/${id}`);
    }

    return (
        <>
            <Header />
            <div className="container">
                <div className="d-flex justify-content-between align-items-center mb-4 mt-3">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Vendas</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciamento de Vendas"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta página centraliza o histórico de todas as vendas realizadas. A partir daqui, você pode analisar o desempenho e acessar os detalhes de cada transação.
                                        </p>
                                        <strong>Funcionalidades da Lista:</strong>
                                        <ul className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Filtro de Origem:</strong> Permite visualizar apenas as vendas de veículos que entraram no estoque por Compra, Consignação ou Troca.
                                            </li>
                                            <li className="mb-1">
                                                <strong>Filtro de Período:</strong> Ajuda a analisar as vendas de um intervalo de tempo específico, como o último mês ou semestre.
                                            </li>
                                            <li>
                                                <strong>Ações:</strong> Utilize os botões para visualizar os detalhes completos da venda ou, se for um gerente, editar um registro caso seja necessário corrigir alguma informação.
                                            </li>
                                        </ul>
                                        <small className="d-block mt-3 text-muted" style={{ textAlign: "justify" }}>Para registrar uma nova venda, vá até a página de "Detalhes" do automóvel desejado e clique em "Vender".</small>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Listagem e gerenciamento de vendas.</p>
                    </div>
                </div>

                <div className="card shadow-sm">
                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Vendas</h5>
                        <div className="d-flex align-items-center gap-2">
                            <select name="origem" id="origem" className="form-select w-auto" onChange={handleInputChangeOrigem} value={origem}>
                                <option value="todas">Origem: Todas</option>
                                <option value="Compra">Origem: Compra</option>
                                <option value="Consignacao">Origem: Consignação</option>
                                <option value="Troca">Origem: Troca</option>
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

                                                    {user.role === "gerente" &&
                                                        <button
                                                            className='btn btn-outline-warning btn-sm me-2'
                                                            onClick={() => { editarVenda(d.id) }}
                                                            title="Editar Venda"
                                                        >
                                                            <i className="bi bi-pencil-fill"></i>
                                                        </button>}
                                                </td>
                                            </tr>

                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="text-center p-5">
                                <i className="bi bi-journal-x" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                                <h4 className="mt-3">Nenhuma venda encontrada</h4>
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
                onConfirm={handleDeletarVenda}
                loading={deleteLoading}
                titulo="Confirmar Cancelamento de Venda"
                corpo={
                    <>
                        <p>Você tem certeza que deseja cancelar a venda?</p>
                        <p > <strong>Atenção:</strong> Esta ação excluirá <strong>permanentemente</strong> o registro da venda. O automóvel associado retornará ao status de "Ativo" no estoque.</p>
                    </>
                }
            />
        </>
    );

}

export default Vendas;