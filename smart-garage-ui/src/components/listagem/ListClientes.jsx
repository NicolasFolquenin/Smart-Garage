import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ClienteDataService from '../../services/clienteDataService';
import { Table, Card, Button, InputGroup, Form, Spinner, Alert, Badge } from 'react-bootstrap';
import HelpPopover from '../HelpPopover';

const ListClientes = () => {
    const navigate = useNavigate();
    const [clientes, setClientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const fetchData = useCallback(() => {
        setLoading(true);
        ClienteDataService.getAll()
            .then(response => {
                setClientes(response.data);
            })
            .catch(e => console.error("Erro ao carregar clientes:", e))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const clientesFiltrados = useMemo(() => {
        if (!searchTerm) return clientes;
        return clientes.filter(cliente =>
            cliente.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, clientes]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);


    const recordsPerPage = 10;
    const lastIndex = currentPage * recordsPerPage;
    const firstIndex = lastIndex - recordsPerPage;
    const records = clientesFiltrados.slice(firstIndex, lastIndex);
    const npage = Math.ceil(clientesFiltrados.length / recordsPerPage);
    const numbers = npage > 0 && isFinite(npage) ? [...Array(npage + 1).keys()].slice(1) : [];
    const changeCPage = (n) => setCurrentPage(n);
    const prePage = () => { if (currentPage > 1) setCurrentPage(currentPage - 1); };
    const nextPage = () => { if (currentPage < npage) setCurrentPage(currentPage + 1); };

    const handleEdit = (clienteId) => {
        navigate(`/editar-cliente/${clienteId}`);
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Gerenciar Clientes</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciamento de Clientes"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Esta tela funciona como a sua agenda de contatos, listando todos os clientes (Pessoas Físicas e Jurídicas) cadastrados no sistema.
                                        </p>
                                        <strong>Funcionalidades:</strong>
                                        <ul className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Busca Rápida:</strong> Utilize o campo de busca no canto superior direito para filtrar e encontrar um cliente rapidamente pelo nome.
                                            </li>
                                            <li className="mb-1">
                                                <strong>Edição de Dados:</strong> O botão "Editar" permite acessar o formulário do cliente para atualizar informações de contato, documentos ou endereço.
                                            </li>
                                            <li>
                                                <strong>Cadastro de Novos Clientes:</strong> Note que não há um botão "Novo Cliente" aqui. Os clientes são cadastrados diretamente durante as operações de Venda, Compra, Troca ou Consignação para garantir que cada novo contato esteja vinculado a uma negociação.
                                            </li>
                                        </ul>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Consulte, busque e edite os clientes do sistema.</p>
                    </div>
                </div>

                <Card className="form-card">
                    <Card.Header className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Lista de Clientes</h5>
                        <Form.Control
                            type="search"
                            placeholder="Buscar por nome..."
                            className="w-auto"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center p-5"><Spinner animation="border" /></div>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>Nome</th>
                                        <th className=''>Tipo</th>
                                        <th>Documento</th>
                                        <th>Contato (Telefone)</th>
                                        <th className="text-center">Ações</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {records.map(cliente => (
                                        <tr key={cliente.id}>
                                            <td className="align-middle">{cliente.nome}</td>
                                            <td className="">
                                                {cliente.tipo === 'Pessoa Física' ? (
                                                    <span className="chip-tipo">
                                                        <i className="bi bi-person-badge"></i>
                                                        Pessoa Física
                                                    </span>
                                                ) : (
                                                    <span className="chip-tipo">
                                                        <i className="bi bi-building"></i>
                                                        Pessoa Jurídica
                                                    </span>
                                                )}
                                            </td>
                                            <td className="align-middle">{cliente.documento}</td>
                                            <td className="align-middle">{cliente.telefone}</td>
                                            <td className="text-center">
                                                <Button variant="outline-warning" size="sm" onClick={() => handleEdit(cliente.id)}>
                                                    <i className="bi bi-pencil-fill"></i> Editar
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                    <Card.Footer>
                        {!loading && clientesFiltrados.length > 0 && npage > 1 && (
                            <nav className="d-flex justify-content-center">
                                <ul className="pagination mb-0">
                                    <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link pointer" onClick={prePage}>Anterior</button>
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
                    </Card.Footer>
                </Card>
            </div>
        </>
    );
};

export default ListClientes;