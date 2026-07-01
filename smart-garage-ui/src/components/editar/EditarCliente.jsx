import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import ClienteDataService from '../../services/clienteDataService';
import JuridicaDataService from '../../services/juridicaDataService';
import FisicaDataService from '../../services/fisicaDataService';
import Select from "react-select";
import { Form, Button, Card, Alert, Spinner, ToggleButton, ButtonGroup, Row, Col } from 'react-bootstrap';
import HelpPopover from '../HelpPopover';

const EditarCliente = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [cliente, setCliente] = useState({ nome: "", email: "", telefone: "" });
    const [fisica, setFisica] = useState({ cpf: "", rg: "" });
    const [juridica, setJuridica] = useState({ cnpj: "", razao_social: "", nome_responsavel: "" });
    const [endereco, setEndereco] = useState({ cep: "", logradouro: "", bairro: "", numero: "" });
    const [cidade, setCidade] = useState({ nome: "" });
    const [estado, setEstado] = useState({ uf: "" });

    const [opcao, setOpcao] = useState('');
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [erro, setErro] = useState('');
    const [sucesso, setSucesso] = useState('');
    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    useEffect(() => {
        if (id) {
            setLoading(true);
            ClienteDataService.get(id)
                .then(response => {
                    const { cliente, fisica, juridica, endereco } = response.data;

                    setCliente(cliente || { nome: "", email: "", telefone: "" });
                    setEndereco(endereco || { cep: "", logradouro: "", bairro: "", numero: "" });

                    if (fisica) {
                        setFisica(fisica);
                        setOpcao('fisica');
                    }
                    if (juridica) {
                        setJuridica(juridica);
                        setOpcao('juridica');
                    }
                    if (endereco?.cidade) {
                        setCidade(endereco.cidade);
                        if (endereco.cidade.estado) {
                            setEstado(endereco.cidade.estado);
                        }
                    }
                })
                .catch(e => {
                    console.error("Erro ao buscar cliente para edição:", e);
                    setErro("Não foi possível carregar os dados do cliente.");
                })
                .finally(() => setLoading(false));
        }
    }, [id]);

    const optionsEstados = [
        { label: "AC", value: "AC" }, { label: "AL", value: "AL" }, { label: "AP", value: "AP" },
        { label: "AM", value: "AM" }, { label: "BA", value: "BA" }, { label: "CE", value: "CE" },
        { label: "DF", value: "DF" }, { label: "ES", value: "ES" }, { label: "GO", value: "GO" },
        { label: "MA", value: "MA" }, { label: "MT", value: "MT" }, { label: "MS", value: "MS" },
        { label: "MG", value: "MG" }, { label: "PA", value: "PA" }, { label: "PB", value: "PB" },
        { label: "PR", value: "PR" }, { label: "PE", value: "PE" }, { label: "PI", value: "PI" },
        { label: "RJ", value: "RJ" }, { label: "RN", value: "RN" }, { label: "RS", value: "RS" },
        { label: "RO", value: "RO" }, { label: "RR", value: "RR" }, { label: "SC", value: "SC" },
        { label: "SP", value: "SP" }, { label: "SE", value: "SE" }, { label: "TO", value: "TO" }
    ];

    const validateFields = (tipoCliente) => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // --- 1. VALIDAÇÃO DOS CAMPOS COMUNS ---
        if (!cliente.nome) vazioErros.push("nome");
        if (!cliente.email) vazioErros.push("email");
        if (!cliente.telefone) vazioErros.push("telefone");
        if (cliente.telefone && isNaN(cliente.telefone)) tamanhoErros.push("telefone");

        if (!endereco.cep) vazioErros.push("cep");
        if (endereco.cep && (endereco.cep.length !== 8 || isNaN(endereco.cep))) tamanhoErros.push("cep");

        if (!endereco.logradouro) vazioErros.push("logradouro");
        if (!endereco.bairro) vazioErros.push("bairro");
        if (!endereco.numero) vazioErros.push("numero");
        if (endereco.numero && isNaN(endereco.numero)) tipoErros.push("numero");

        if (!cidade.nome) vazioErros.push("cidade");
        if (!estado.uf) vazioErros.push("estado");

        if (tipoCliente === 'fisica') {
            if (!fisica.cpf) vazioErros.push("cpf");
            if (fisica.cpf && (fisica.cpf.length !== 11 || isNaN(fisica.cpf))) tamanhoErros.push("cpf");

            if (fisica.rg && (fisica.rg.length < 9 || fisica.rg.length > 13 || isNaN(fisica.rg))) tamanhoErros.push("rg");

        } else if (tipoCliente === 'juridica') {
            if (!juridica.cnpj) vazioErros.push("cnpj");
            if (juridica.cnpj && (juridica.cnpj.length !== 14 || isNaN(juridica.cnpj))) tamanhoErros.push("cnpj");

            if (!juridica.nome_responsavel) vazioErros.push("nome_responsavel");
        }

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const handleInputChange = (setter) => (e) => {
        const { name, value } = e.target;
        setter(prev => ({ ...prev, [name]: value }));
    };

    const handleInputChangeCidade = (e) => {
        const { value } = e.target;
        setCidade({ ...cidade, nome: value });
    };

    const handleInputChangeEstado = (selectedOption) => {
        setEstado({ ...estado, uf: selectedOption?.value ?? "" });
    };

    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro]);

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErro('');
        setSucesso('');


        const { vazioErros, tamanhoErros, tipoErros } = validateFields(opcao);

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        const dataPayload = {
            cliente,
            fisica: opcao === 'fisica' ? fisica : null,
            juridica: opcao === 'juridica' ? juridica : null,
            endereco,
            cidade,
            estado
        };

        try {
            if (opcao === "juridica") {
                const verificacaoJuridica = await JuridicaDataService.duplicidade({
                    cnpj: juridica.cnpj,
                    razao_social: juridica.razao_social,
                    idClienteAtual: id
                })

                if (verificacaoJuridica.data.erro) {
                    setErro(verificacaoJuridica.data.mensagemErro);
                    throw new Error(verificacaoJuridica.data.mensagemErro);
                }
            }

            if (opcao === "fisica") {
                const verificacaoFisica = await FisicaDataService.duplicidade({
                    rg: fisica.rg,
                    cpf: fisica.cpf,
                    idClienteAtual: id
                })

                if (verificacaoFisica.data.erro) {
                    setErro(verificacaoFisica.data.erro);
                    throw new Error(verificacaoFisica.data.mensagemErro);
                }
            }
            await ClienteDataService.update(id, dataPayload);
            setSucesso("Cliente atualizado com sucesso!");
            setTimeout(() => navigate('/listagem/clientes'), 1500);
        } catch (error) {
            const mensagem = error.response?.data?.mensagemErro || error.message || "Erro ao atualizar cliente.";
            setErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return <div className="text-center p-5"><Spinner animation="border" /></div>;
    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="mb-1">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Editar Cliente</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Edição de Cliente"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta tela permite atualizar todas as informações de um cliente já cadastrado no sistema, como dados de contato, documentos e endereço.
                                    </p>
                                    <strong>Pontos Importantes:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Tipo de Cliente Fixo:</strong> O tipo de cliente (Pessoa Física ou Jurídica) é definido no cadastro e não pode ser alterado. Os botões no topo apenas indicam qual tipo de registro está sendo editado.
                                        </li>
                                        <li>
                                            <strong>Atualização Completa:</strong> Todos os outros campos, incluindo nome, e-mail, telefone, documentos e endereço, podem ser livremente modificados.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Altere os dados abaixo para atualizar o cliente.</p>
                </div>

                <p className="text-muted small">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>

                {sucesso &&
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{sucesso}</div>
                    </div>}

                {erro &&
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{erro}</div>
                    </div>
                }

                <form onSubmit={handleUpdate} className={sucesso ? 'd-none' : ''}>
                    <ButtonGroup className="mb-4">
                        <ToggleButton variant="outline-primary" checked={opcao === 'fisica'} disabled type="radio">Pessoa Física</ToggleButton>
                        <ToggleButton variant="outline-primary" checked={opcao === 'juridica'} disabled type="radio">Pessoa Jurídica</ToggleButton>
                    </ButtonGroup>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações do Cliente</legend>
                        <div className="row g-3">
                            <Col md={4}>
                                <Form.Group><Form.Label>Nome <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("nome") && "is-invalid"}`} name="nome" value={cliente.nome} onChange={handleInputChange(setCliente)} />
                                    {vazio.includes("nome") && <div className="invalid-feedback">Informe o nome.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Email <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("email") && "is-invalid"}`} name="email" type="email" value={cliente.email} onChange={handleInputChange(setCliente)} />
                                    {vazio.includes("email") && <div className="invalid-feedback">Informe o email.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Telefone <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("telefone") && "is-invalid"}`} name="telefone" value={cliente.telefone} onChange={handleInputChange(setCliente)} />
                                    {vazio.includes("telefone") && <div className="invalid-feedback">Informe o telefone.</div>}
                                    {tamanho.includes("telefone") && <div className="invalid-feedback">Telefone inválido.</div>}
                                </Form.Group>
                            </Col>
                        </div>
                    </fieldset>

                    {opcao === 'fisica' && (
                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Documentos (Pessoa Física)</legend>
                            <div className="row g-3">
                                <Col md={6}>
                                    <Form.Group><Form.Label>CPF <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("cpf") && "is-invalid"}`} name="cpf" value={fisica.cpf} onChange={handleInputChange(setFisica)} />
                                        {vazio.includes("cpf") && <div className="invalid-feedback">Informe o CPF.</div>}
                                        {tamanho.includes("cpf") && <div className="invalid-feedback">CPF inválido (deve ter 11 caracteres numéricos).</div>}
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group><Form.Label>RG</Form.Label><Form.Control className={`form-control ${hasError("rg") && "is-invalid"}`} name="rg" value={fisica.rg} onChange={handleInputChange(setFisica)} />
                                        {tamanho.includes("rg") && <div className="invalid-feedback">RG inválido (deve ter de 9 a 13 caracteres numéricos).</div>}
                                    </Form.Group>
                                </Col>
                            </div>
                        </fieldset>
                    )}
                    {opcao === 'juridica' && (
                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Documentos (Pessoa Jurídica)</legend>
                            <div className="row g-3">
                                <Col md={4}>
                                    <Form.Group><Form.Label>CNPJ <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("cnpj") && "is-invalid"}`} name="cnpj" value={juridica.cnpj} onChange={handleInputChange(setJuridica)} />
                                        {vazio.includes("cnpj") && <div className="invalid-feedback">Informe o CNPJ.</div>}
                                        {tamanho.includes("cnpj") && <div className="invalid-feedback">CNPJ inválido (deve ter 14 caracteres numéricos).</div>}
                                    </Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group><Form.Label>Razão Social</Form.Label><Form.Control className={`form-control ${hasError("razao_social") && "is-invalid"}`} name="razao_social" value={juridica.razao_social} onChange={handleInputChange(setJuridica)} /></Form.Group>
                                </Col>
                                <Col md={4}>
                                    <Form.Group><Form.Label>Nome do Responsável <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("nome_responsavel") && "is-invalid"}`} name="nome_responsavel" value={juridica.nome_responsavel} onChange={handleInputChange(setJuridica)} />
                                        {vazio.includes("nome_responsavel") && <div className="invalid-feedback">Informe o nome do responsável.</div>}
                                    </Form.Group>
                                </Col>
                            </div>
                        </fieldset>
                    )}

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Endereço</legend>
                        <div className="row g-3">
                            <Col md={4}>
                                <Form.Group><Form.Label>CEP <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("cep") && "is-invalid"}`} name="cep" value={endereco.cep} onChange={handleInputChange(setEndereco)} />
                                    {vazio.includes("cep") && <div className="invalid-feedback">Informe o CEP.</div>}
                                    {tamanho.includes("cep") && <div className="invalid-feedback">CEP inválido (deve ter 8 caracteres numéricos).</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Cidade <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("cidade") && "is-invalid"}`} name="nome" value={cidade.nome} onChange={handleInputChangeCidade} />
                                    {vazio.includes("cidade") && <div className="invalid-feedback">Informe a cidade.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group >
                                    <Form.Label>Estado <span className="text-danger">*</span></Form.Label>
                                    <Select
                                        className={`${hasError("estado") && "is-invalid"}`}
                                        isSearchable={true}
                                        isClearable={true}
                                        placeholder="Selecione o estado"
                                        options={optionsEstados}
                                        value={optionsEstados.find(option => option.value === estado.uf)}
                                        onChange={handleInputChangeEstado}
                                    />
                                    {vazio.includes("estado") && <div className="invalid-feedback">Informe o estado.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Logradouro <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("logradouro") && "is-invalid"}`} name="logradouro" value={endereco.logradouro} onChange={handleInputChange(setEndereco)} />
                                    {vazio.includes("logradouro") && <div className="invalid-feedback">Informe o logradouro.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Número <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("numero") && "is-invalid"}`} name="numero" value={endereco.numero} onChange={handleInputChange(setEndereco)} />
                                    {vazio.includes("numero") && <div className="invalid-feedback">Informe o número.</div>}
                                    {tipo.includes("numero") && <div className="invalid-feedback">Número inválido.</div>}
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group><Form.Label>Bairro <span className="text-danger">*</span></Form.Label><Form.Control className={`form-control ${hasError("bairro") && "is-invalid"}`} name="bairro" value={endereco.bairro} onChange={handleInputChange(setEndereco)} />
                                    {vazio.includes("bairro") && <div className="invalid-feedback">Informe o bairro.</div>}
                                </Form.Group>
                            </Col>
                        </div>
                    </fieldset>

                    {/* Botões de Ação */}
                    <div className="d-flex justify-content-end pb-3">
                        <Button variant="outline-secondary" size="lg" className="me-3" onClick={() => navigate('/listagem/clientes')}>
                            Voltar
                        </Button>
                        <Button variant="primary" type="submit" size="lg" disabled={isSubmitting}>
                            {isSubmitting ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </form>
            </div >
        </>
    );
};

export default EditarCliente;