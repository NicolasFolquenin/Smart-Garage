import Header from "./Header";
import { useState } from "react";
import { useMemo } from "react";
import { useEffect } from "react";
import AutomovelDataService from "../services/automovelDataService";
import MarcaDataService from "../services/marcaDataService";
import ModeloDataService from "../services/modeloDataService";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import HelpPopover from './HelpPopover';
import VendaDataService from "../services/vendaDataService";

const Estoque = () => {

    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000";

    const [automovel, setAutomovel] = useState([]);
    const [automovelInativo, setAutomovelInativo] = useState([]);
    const [marca, setMarca] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [loading, setLoading] = useState(true);
    const [vendas, setVendas] = useState([]);

    const [opcao, setOpcao] = useState('ativos');

    const handleInputChangeOpcao = event => {
        const { value } = event.target;
        setOpcao(value);
    }

    useEffect(() => {
        setLoading(true);
        Promise.all([
            AutomovelDataService.getByAtivo(),
            AutomovelDataService.getByInativo(),
            MarcaDataService.getAll(),
            ModeloDataService.getAll(),
            VendaDataService.getAll(),
        ]).then(([automoveisRes, automoveisInativos, marcasRes, modelosRes, vendasRes]) => {
            setAutomovel(automoveisRes.data);
            setAutomovelInativo(automoveisInativos.data);
            setMarca(marcasRes.data);
            setModelo(modelosRes.data);
            setVendas(vendasRes.data);
        }).catch(e => {
            console.error("Erro ao carregar dados do estoque:", e);
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    const [search, setSearch] = useState("");

    const automoveisFiltrados = useMemo(() => {

        let listaBase;

        switch (opcao) {
            case 'inativos':
                listaBase = automovelInativo;
                break;
            case 'vendidos':
                const idsVendidos = new Set(vendas.map(v => v.automovelId));
                listaBase = automovelInativo.filter(auto => idsVendidos.has(auto.id));
                break;
            case 'ativos':
            default:
                listaBase = automovel;
                break;
        }

        if (!search) return listaBase;

        return listaBase.filter(auto => {
            const marca2 = marca.find(m => m.id === auto.marcaId);
            const modelo2 = modelo.find(m => m.id === auto.modeloId);
            const searchTerm = search.toLowerCase();

            return (
                modelo2?.nome.toLowerCase().includes(searchTerm) ||
                marca2?.nome.toLowerCase().includes(searchTerm) ||
                auto.ano_fabricacao.toString().includes(searchTerm) ||
                auto.placa.toLowerCase().includes(searchTerm)
            );
        });
    }, [search, opcao, automovel, automovelInativo, modelo, marca, vendas]);

    useEffect(() => {
        setCurrentPage(1);
    }, [automoveisFiltrados, opcao]);


    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 6;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;

    const records = automoveisFiltrados.slice(firstIndex, lastIndex);
    const npage = Math.ceil(automoveisFiltrados.length / recordsPerPage);
    const numbers = [...Array(npage + 1).keys()].slice(1);

    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1) };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1) };


    const detalhesAutomovel = (id) => {
        navigate('/detalhes/' + id);
    }


    const renderContent = () => {
        if (loading) {
            return (
                <div className="d-flex justify-content-center align-items-center w-100" style={{ height: '50vh' }}>
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Carregando...</span>
                    </div>
                </div>
            );
        }

        if (records.length === 0) {
            return (
                <>
                    <div className="col-md-4 mt-5"></div>
                    <div className="col-12 text-center p-5 mt-5">
                        <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                        <h4 className="mt-3">Nenhum automóvel encontrado</h4>
                        <p className="text-muted">Tente ajustar os termos da sua busca ou adicione um novo automóvel ao estoque.</p>
                    </div>
                </>
            );
        }

        return (
            <>
                {loading ? (
                    <div className="col-12 d-flex justify-content-center align-items-center" style={{ height: '50vh' }}>
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Carregando...</span>
                        </div>
                    </div>
                ) : records.length > 0 ? (
                    records.map((auto) => {
                        const modelo2 = modelo.find(m => m.id === auto.modeloId);
                        const marca2 = marca.find(m => m.id === auto.marcaId);

                        return (
                            <div key={auto.id} className="col">
                                <div className="card h-100 card-hover">
                                    {auto.imagem ? (
                                        <img
                                            src={`${apiUrl}/${auto.imagem}`}
                                            className="card-img-top car-image"
                                            alt={`${marca2?.nome} ${modelo2?.nome}`}
                                        />
                                    ) : (
                                        <div className="d-flex justify-content-center align-items-center" style={{ height: "200px" }}>
                                            <i className="bi bi-camera fs-1 text-muted"></i>
                                        </div>
                                    )}
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{marca2?.nome} {modelo2?.nome}</h5>
                                        <p className="card-text text-muted">{auto.ano_fabricacao} &bull; {auto.cor}</p>
                                        <h4 className="mb-3">
                                            {auto.valor && `${parseFloat(auto.valor).toLocaleString('pt-BR', {
                                                style: 'currency',
                                                currency: 'BRL'
                                            })}`}
                                        </h4>
                                        <button onClick={() => navigate(`/detalhes/${auto.id}`)} className="btn btn-primary mt-auto">
                                            Ver Detalhes
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <div className="col-12 text-center p-5">
                        <i className="bi bi-search" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                        <h4 className="mt-3">Nenhum automóvel encontrado</h4>
                        <p className="text-muted">Não há automóveis que correspondam aos filtros selecionados.</p>
                    </div>
                )}

            </>
        );
    };

    return (
        <>
            <Header />
            <div className="container py-5">
                <div className="d-flex justify-content-between align-items-center">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Estoque de Automóveis</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Estoque de Automóveis"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta tela é a vitrine virtual da sua garagem, exibindo todos os automóveis cadastrados no sistema.
                                        </p>
                                        <strong>Funcionalidades:</strong>
                                        <ul className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Filtro de Status:</strong> Use o seletor para alternar a visualização entre automóveis "Ativos" (disponíveis para venda) e "Inativos" (já vendidos ou devolvidos).
                                            </li>
                                            <li className="mb-1">
                                                <strong>Busca Inteligente:</strong> O campo de busca permite encontrar automóveis rapidamente por marca, modelo, ano ou placa.
                                            </li>
                                            <li>
                                                <strong>Ver Detalhes:</strong> Clicar no botão "Ver Detalhes" de qualquer automóvel leva a uma página com todas as suas informações, histórico e opções de negociação (como Vender ou Editar).
                                            </li>
                                        </ul>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Consulte e gerencie todos os automóveis disponíveis.</p>
                    </div>
                    <div className="d-flex align-items-center col-md-4">
                        <div className="me-3 col-md-3">
                            <select name="opcao" id="opcao" className="form-select me-2" value={opcao} onChange={handleInputChangeOpcao}>
                                <option value="ativos">Ativos</option>
                                <option value="inativos">Inativos</option>
                                <option value="vendidos">Vendidos</option>
                            </select>
                        </div>
                        <input
                            type="search"
                            className="form-control me-2"
                            placeholder="Buscar por modelo, marca, placa..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>


                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                    {renderContent()}
                </div>

                {!loading && automoveisFiltrados.length > 0 && npage > 1 && (
                    <nav className="d-flex justify-content-center mt-5">
                        <ul className="pagination">
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
        </>
    );
}

export default Estoque;