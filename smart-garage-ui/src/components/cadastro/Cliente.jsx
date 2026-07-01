import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useState, useCallback, useEffect } from "react";
import ClienteDataService from "../../services/clienteDataService";
import CidadeDataService from '../../services/cidadeDataService';
import EstadoDataService from '../../services/estadoDataService';
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import EnderecoDataService from "../../services/enderecoDataService";
import { useNavigate } from "react-router-dom";
import ToggleButton from 'react-bootstrap/ToggleButton';
import { ButtonGroup } from "react-bootstrap";
import { useLocation } from "react-router-dom";
import HelpPopover from "../HelpPopover";

const Cliente = () => {

    const navigate = useNavigate();

    const consignacao = { negocio: "Consignacao" };
    const compra = { negocio: "Compra" };
    const troca = { negocio: "Troca" };

    const location = useLocation();
    const automovelId = location.state?.automovelId;

    const initialClienteState = { nome: "", email: "", telefone: "" };
    const initialFisicaState = { cpf: "", rg: null };
    const initialJuridicaState = { cnpj: "", razao_social: "", nome_responsavel: "" };
    const initialEnderecoState = { cep: "", logradouro: "", bairro: "", numero: "" };
    const initialCidadeState = { nome: "" };
    const initialEstadoState = { uf: "" };

    const [cliente, setCliente] = useState(initialClienteState);
    const [fisica, setFisica] = useState(initialFisicaState);
    const [juridica, setJuridica] = useState(initialJuridicaState);
    const [endereco, setEndereco] = useState(initialEnderecoState);
    const [cidade, setCidade] = useState(initialCidadeState);
    const [estado, setEstado] = useState(initialEstadoState);
    const [opcao, setOpcao] = useState('fisica');

    const resetFormulario = () => {
        setCliente(initialClienteState);
        setFisica(initialFisicaState);
        setJuridica(initialJuridicaState);
        setEndereco(initialEnderecoState);
        setCidade(initialCidadeState);
        setEstado(initialEstadoState);

        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setErro(false);
        setMensagemErro('');
    };


    const [modeloNegocio, setModeloNegocio] = useState(null);

    useEffect(() => {
        const negocio = sessionStorage.getItem("NegocioAtual");
        if (negocio) {
            setModeloNegocio(JSON.parse(negocio));
        }
    }, []);


    const radios = [
        { name: 'Pessoa Física', value: 'fisica' },
        { name: 'Pessoa Jurídica', value: 'juridica' }
    ];

    const [radioValue, setRadioValue] = useState('fisica');



    const handleInputChangeCliente = event => {
        const { name, value } = event.target;
        setCliente({ ...cliente, [name]: value });
    };

    const handleInputChangeEndereco = event => {
        const { name, value } = event.target;
        setEndereco({ ...endereco, [name]: value });
    };

    const handleInputChangeCidade = event => {
        const { value } = event.target;
        setCidade({ ...cidade, nome: value });
    };

    const handleInputChangeEstado = (selectedOption) => {
        setEstado({ uf: selectedOption?.value ?? "" });
    };

    const handleInputChangeFisica = event => {
        const { name, value } = event.target;
        setFisica({ ...fisica, [name]: value });
    };

    const handleInputChangeJuridica = event => {
        const { name, value } = event.target;
        setJuridica({ ...juridica, [name]: value });
    };

    const optionsEstados = [
        { label: "AC", value: "AC" },
        { label: "AL", value: "AL" },
        { label: "AP", value: "AP" },
        { label: "AM", value: "AM" },
        { label: "BA", value: "BA" },
        { label: "CE", value: "CE" },
        { label: "DF", value: "DF" },
        { label: "ES", value: "ES" },
        { label: "GO", value: "GO" },
        { label: "Ma", value: "MA" },
        { label: "MT", value: "MT" },
        { label: "MS", value: "MS" },
        { label: "MG", value: "MG" },
        { label: "PA", value: "PA" },
        { label: "PB", value: "PB" },
        { label: "PR", value: "PR" },
        { label: "PE", value: "PE" },
        { label: "PI", value: "PI" },
        { label: "RJ", value: "RJ" },
        { label: "RN", value: "RN" },
        { label: "RS", value: "RS" },
        { label: "RO", value: "RO" },
        { label: "RR", value: "RR" },
        { label: "SC", value: "SC" },
        { label: "SP", value: "SP" },
        { label: "SE", value: "SE" },
        { label: "TO", value: "TO" }
    ];


    function validarCPF(cpf) {
        if (typeof cpf !== 'string') return false;
        cpf = cpf.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

        if (cpf.length !== 11) return false;

        // Elimina CPFs inválidos conhecidos (todos os dígitos iguais)
        if (/^(\d)\1+$/.test(cpf)) return false;

        let soma = 0;
        let resto;

        // Validação do primeiro dígito verificador
        for (let i = 1; i <= 9; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(9, 10))) return false;

        soma = 0;
        // Validação do segundo dígito verificador
        for (let i = 1; i <= 10; i++) {
            soma += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }
        resto = (soma * 10) % 11;
        if ((resto === 10) || (resto === 11)) resto = 0;
        if (resto !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    function validarCNPJ(cnpj) {
        if (typeof cnpj !== 'string') return false;
        cnpj = cnpj.replace(/[^\d]/g, ''); // Remove todos os caracteres não numéricos

        if (cnpj.length !== 14) return false;

        // Elimina CNPJs inválidos conhecidos (todos os dígitos iguais)
        if (/^(\d)\1+$/.test(cnpj)) return false;

        // Validação do primeiro dígito verificador
        let tamanho = cnpj.length - 2;
        let numeros = cnpj.substring(0, tamanho);
        let digitos = cnpj.substring(tamanho);
        let soma = 0;
        let pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        let resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(0)) return false;

        // Validação do segundo dígito verificador
        tamanho = tamanho + 1;
        numeros = cnpj.substring(0, tamanho);
        soma = 0;
        pos = tamanho - 7;
        for (let i = tamanho; i >= 1; i--) {
            soma += numeros.charAt(tamanho - i) * pos--;
            if (pos < 2) pos = 9;
        }
        resultado = soma % 11 < 2 ? 0 : 11 - soma % 11;
        if (resultado != digitos.charAt(1)) return false;

        return true;
    }


    const [isSubmitting, setIsSubmitting] = useState(false);


    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);


    const validateFieldsPessoaFisica = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!cliente.nome) vazioErros.push("nome");
        if (!cliente.email) vazioErros.push("email");
        if (!cliente.telefone) vazioErros.push("telefone");

        // if (!fisica.cpf) {
        //     vazioErros.push("cpf");
        // } else {
        //     if (!validarCPF(fisica.cpf)) {
        //         tipoErros.push("cpf");
        //     }
        // }

        if (!fisica.cpf) { vazioErros.push("cpf") };

        if (!endereco.cep) vazioErros.push("cep");
        if (!endereco.logradouro) vazioErros.push("logradouro");
        if (!endereco.bairro) vazioErros.push("bairro");
        if (!endereco.numero) vazioErros.push("numero");

        if (!cidade.nome) vazioErros.push("cidade");

        if (!estado.uf) vazioErros.push("estado");


        // Tamanho
        if (cliente.telefone && (isNaN(cliente.telefone))) tamanhoErros.push("telefone");

        if (fisica.cpf && (fisica.cpf != '' && (fisica.cpf.length !== 11) || isNaN(fisica.cpf))) tamanhoErros.push("cpf");
        if (fisica.rg && (fisica.rg != '' && (fisica.rg.length < 9 || fisica.rg.length > 13) || isNaN(fisica.rg))) tamanhoErros.push("rg");

        if (endereco.cep && (endereco.cep != '' && (endereco.cep.length !== 8) || isNaN(endereco.cep))) tamanhoErros.push("cep");

        // Tipo
        if (endereco.numero && isNaN(endereco.numero)) tipoErros.push("numero");

        if (cliente.data_cadastro && cliente.data_cadastro > new Date()) tipoErros.push("data_cadastro");

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const validateFieldsPessoaJuridica = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!cliente.nome) vazioErros.push("nome");
        if (!cliente.email) vazioErros.push("email");
        if (!cliente.telefone) vazioErros.push("telefone");

        if (!juridica.nome_responsavel) vazioErros.push("nome_responsavel");
        // if (!juridica.cnpj) vazioErros.push("cnpj");

        if (!juridica.cnpj) {
            vazioErros.push("cnpj");
        } else {
            if (!validarCNPJ(juridica.cnpj)) {
                tipoErros.push("cnpj");
            }
        }

        if (!endereco.cep) vazioErros.push("cep");
        if (!endereco.logradouro) vazioErros.push("logradouro");
        if (!endereco.bairro) vazioErros.push("bairro");
        if (!endereco.numero) vazioErros.push("numero");

        if (!cidade.nome) vazioErros.push("cidade");

        if (!estado.uf) vazioErros.push("estado");


        // Tamanho
        if (cliente.telefone && (isNaN(cliente.telefone))) tamanhoErros.push("telefone");

        if (juridica.cnpj && (juridica.cnpj != '' && (juridica.cnpj.length !== 14) || isNaN(juridica.cnpj))) tamanhoErros.push("cnpj");

        if (endereco.cep && (endereco.cep != '' && (endereco.cep.length !== 8) || isNaN(endereco.cep))) tamanhoErros.push("cep");

        // Tipo
        if (endereco.numero && isNaN(endereco.numero)) tipoErros.push("numero");

        if (cliente.data_cadastro && cliente.data_cadastro > new Date()) tipoErros.push("data_cadastro");


        return { vazioErros, tamanhoErros, tipoErros };
    };


    useEffect(() => {
        if (erro) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [erro, mensagemErro]);


    const saveCliente = async (e) => {

        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setIsSubmitting(true);

        const { vazioErros, tamanhoErros, tipoErros } = validateFieldsPessoaFisica();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }


        try {

            const verificacao = await FisicaDataService.duplicidade({
                rg: fisica.rg,
                cpf: fisica.cpf
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro);
                setMensagemErro(verificacao.data.mensagemErro);
                throw new Error(verificacao.data.mensagemErro);
            }

            var dataCliente = {
                data_cadastro: new Date(),
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone
            }

            const verificacaoemail = await ClienteDataService.duplicidade({
                email: cliente.email
            })

            if (verificacaoemail.data.erro) {
                setErro(verificacaoemail.data.erro);
                setMensagemErro(verificacaoemail.data.mensagemErro);
                throw new Error(verificacaoemail.data.mensagemErro);
            }

            const clienteResp = await ClienteDataService.create(dataCliente)
                .catch(e => {
                    console.error("Erro ao criar cliente:", e);
                });

            setCliente(clienteResp.data);

            var dataFisica = {
                cpf: fisica.cpf,
                rg: fisica.rg,
                clienteId: clienteResp?.data.id
            }

            const fisicaResp = await FisicaDataService.create(dataFisica)
                .catch(e => {
                    console.error("Erro ao criar pessoa fisica:", e);
                });

            setFisica(fisicaResp.data);

            var dataEstado = {
                uf: estado.uf
            }

            const estadoResp = await EstadoDataService.create(dataEstado)
                .catch(e => {
                    console.error("Erro ao criar estado:", e);
                });

            setEstado(estadoResp.data);

            var dataCidade = {
                nome: cidade.nome,
                estadoId: estadoResp?.data.id
            }

            const cidadeResp = await CidadeDataService.create(dataCidade)
                .catch(e => {
                    console.error("Erro ao criar cidade:", e);
                });

            setCidade(cidadeResp.data);

            var dataEndereco = {
                bairro: endereco.bairro,
                cep: endereco.cep,
                logradouro: endereco.logradouro,
                numero: endereco.numero,
                clienteId: clienteResp?.data.id,
                cidadeId: cidadeResp?.data.id
            }

            const enderecoResp = await EnderecoDataService.create(dataEndereco)
                .catch(e => {
                    console.error("Erro ao criar endereco:", e);
                });

            setEndereco(enderecoResp.data);

            setSucesso(true);
            setMensagemSucesso("Cliente cadastrado com sucesso!");

            sessionStorage.removeItem("NegocioAtual");

            setTimeout(() => {
                if (modeloNegocio?.negocio === "Venda") {
                    navigate('/venda', { state: { clienteId: clienteResp.data.id, automovelId: automovelId } });
                }
                if (modeloNegocio?.negocio === "Consignacao") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(consignacao));
                    navigate('/listagem/consignacoes',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteResp.data.id
                            }
                        });
                }
                if (modeloNegocio?.negocio === "Compra") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(compra));
                    navigate('/listagem/compras',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteResp.data.id
                            }
                        });
                }
                if (modeloNegocio?.negocio === "Troca") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(troca));
                    navigate('/listagem/trocas',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteResp.data.id

                            }
                        });
                }

            }, 1500);
        } catch (error) {
            console.error("Erro no processo de salvamento:", error);
            setErro(true);
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }
    }

    const saveClienteJuridica = async (e) => {

        e.preventDefault();
        setIsSubmitting(true);

        const { vazioErros, tamanhoErros, tipoErros } = validateFieldsPessoaJuridica();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {

            const verificacao = await JuridicaDataService.duplicidade({
                cnpj: juridica.cnpj,
                razao_social: juridica.razao_social
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro);
                setMensagemErro(verificacao.data.mensagemErro);
                throw new Error(verificacao.data.mensagemErro);
            }

            var dataCliente = {
                data_cadastro: new Date(),
                nome: cliente.nome,
                email: cliente.email,
                telefone: cliente.telefone
            }

            const verificacaoemail = await ClienteDataService.duplicidade({
                email: cliente.email
            })

            if (verificacaoemail.data.erro) {
                setErro(verificacaoemail.data.erro);
                setMensagemErro(verificacaoemail.data.mensagemErro);
                throw new Error(verificacaoemail.data.mensagemErro);
            }

            const clienteJuridicaResp = await ClienteDataService.create(dataCliente)
                .catch(e => {
                    console.error("Erro ao criar cliente:", e);
                });

            setCliente(clienteJuridicaResp.data);

            var dataJuridica = {
                cnpj: juridica.cnpj,
                razao_social: juridica.razao_social,
                nome_responsavel: juridica.nome_responsavel,
                clienteId: clienteJuridicaResp?.data.id
            }

            console.log(dataJuridica);

            const juridicaResp = await JuridicaDataService.create(dataJuridica)
                .catch(e => {
                    console.error("Erro ao criar pessoa jurídica:", e);
                });

            setJuridica(juridicaResp.data);

            var dataEstado = {
                uf: estado.uf
            }

            const estadoResp = await EstadoDataService.create(dataEstado)
                .catch(e => {
                    console.error("Erro ao criar estado:", e);
                });

            setEstado(estadoResp.data);

            var dataCidade = {
                nome: cidade.nome,
                estadoId: estadoResp?.data.id
            }

            const cidadeResp = await CidadeDataService.create(dataCidade)
                .catch(e => {
                    console.error("Erro ao criar cidade:", e);
                });

            setCidade(cidadeResp.data);

            var dataEndereco = {
                bairro: endereco.bairro,
                cep: endereco.cep,
                logradouro: endereco.logradouro,
                numero: endereco.numero,
                clienteId: clienteJuridicaResp?.data.id,
                cidadeId: cidadeResp?.data.id
            }

            const enderecoResp = await EnderecoDataService.create(dataEndereco)
                .catch(e => {
                    console.error("Erro ao criar endereco:", e);
                });

            setEndereco(enderecoResp.data);

            setSucesso(true);
            setMensagemSucesso("Cliente cadastrado com sucesso!");

            sessionStorage.removeItem("NegocioAtual");


            setTimeout(() => {
                if (modeloNegocio?.negocio === "Venda") {
                    navigate('/venda', { state: { clienteId: clienteJuridicaResp.data.id, automovelId: automovelId } });
                }
                if (modeloNegocio?.negocio === "Consignacao") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(consignacao));
                    navigate('/listagem/consignacoes',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteJuridicaResp.data.id
                            }
                        });
                }
                if (modeloNegocio?.negocio === "Compra") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(compra));
                    navigate('/listagem/compras',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteJuridicaResp.data.id
                            }
                        });
                }
                if (modeloNegocio?.negocio === "Troca") {
                    sessionStorage.setItem("NegocioAtual", JSON.stringify(troca));
                    navigate('/listagem/trocas',
                        {
                            state: {
                                startAutomovelCheck: true,
                                clienteId: clienteJuridicaResp.data.id

                            }
                        });
                }

            }, 1500);
        } catch (error) {
            console.error("Erro no processo de salvamento:", error);
            setErro(true);
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }

    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    return (
        <>
            <Header />

            <div className={`mb-4 mt-3 container`}>
                <div className="d-flex align-items-center">
                    <h1 className="fw-bold mb-0 me-2">Cadastro de Cliente</h1>
                    <HelpPopover
                        id="page-help-popover"
                        title="Ajuda: Cadastro de Cliente"
                        content={
                            <>
                                <p style={{ textAlign: "justify" }}>
                                    Esta página é utilizada para cadastrar novos clientes, que podem ser tanto Pessoas Físicas (consumidores) quanto Pessoas Jurídicas (empresas).
                                </p>
                                <strong>Fluxo de Trabalho:</strong>
                                <ol className="mt-1" style={{ textAlign: "justify" }}>
                                    <li className="mb-1">
                                        <strong>Tipo de Pessoa:</strong> Use os botões no topo para alternar entre o formulário de Pessoa Física e Pessoa Jurídica.
                                    </li>
                                    <li className="mb-1">
                                        <strong>Preenchimento:</strong> Insira todas as informações solicitadas sobre o cliente e seu endereço.
                                    </li>
                                    <li>
                                        <strong>Continuidade do Negócio:</strong> Se você chegou a esta tela durante uma operação (como uma Venda ou Compra), após salvar o cliente, o sistema irá redirecioná-lo automaticamente para a próxima etapa do processo já com este novo cliente selecionado.
                                    </li>
                                </ol>
                            </>
                        }
                    />
                </div>
                <p className="text-muted">Preencha os dados abaixo para registrar um novo cliente no sistema.</p>
            </div>
            <div className="container">

                <p className="text-muted small">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>


                {erro && (
                    <div className="alert alert-danger d-flex align-items-center mt-3" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{mensagemErro}</div>
                    </div>
                )}
                {sucesso && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                )}

                <div className={`row mt-4 ${sucesso && "d-none"}`}>
                    <ButtonGroup className="mb-2">
                        {radios.map((radio, idx) => (
                            <ToggleButton
                                key={idx}
                                id={`radio-${idx}`}
                                type="radio"
                                variant="outline-primary"
                                name="radio"
                                value={radio.value}
                                checked={radioValue === radio.value}
                                onChange={(e) => {
                                    setRadioValue(e.currentTarget.value);
                                    setOpcao(radio.value);
                                    resetFormulario();
                                }}
                            >
                                {radio.name}
                            </ToggleButton>
                        ))}
                    </ButtonGroup>

                </div>


                {opcao === 'fisica' &&

                    <form onSubmit={saveCliente} className={`mt-5 ${sucesso && "d-none"}`}>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações do Cliente</legend>
                            <div className="row g-3">
                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Nome <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("nome") && "is-invalid"}`} id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                    {vazio.includes("nome") && <div className="invalid-feedback">Informe o nome.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Email <span className="text-danger">*</span></label>
                                    <input type="email" className={`form-control ${hasError("email") && "is-invalid"}`} id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />
                                    {vazio.includes("email") && <div className="invalid-feedback">Informe o email.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="telefone" class="form-label">Telefone <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("telefone") && "is-invalid"}`} id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />
                                    {vazio.includes("telefone") && <div className="invalid-feedback">Informe o telefone.</div>}
                                    {tamanho.includes("telefone") && <div className="invalid-feedback">Telefone inválido.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="cpf" class="form-label">CPF <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cpf") && "is-invalid"}`} id="cpf" name="cpf" aria-describedby="cpfeHelp" value={fisica.cpf} onChange={handleInputChangeFisica} />
                                    {vazio.includes("cpf") && <div className="invalid-feedback">Informe o CPF.</div>}
                                    {tamanho.includes("cpf") && <div className="invalid-feedback">CPF inválido.</div>}
                                    {tipo.includes("cpf") && <div className="invalid-feedback">CPF inválido.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="rg" class="form-label">RG</label>
                                    <input type="text" className={`form-control ${hasError("rg") && "is-invalid"}`} id="rg" name="rg" aria-describedby="rgHelp" value={fisica.rg} onChange={handleInputChangeFisica} />
                                    {tamanho.includes("rg") && <div className="invalid-feedback">RG inválido (deve ter de 9 a 13 caracteres numéricos).</div>}
                                </div>
                            </div>
                        </fieldset>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações de Endereço</legend>
                            <div className="row g-3">
                                <div class="col-md-4">
                                    <label for="cep" class="form-label">CEP <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cep") && "is-invalid"}`} id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("cep") && <div className="invalid-feedback">Informe o CEP.</div>}
                                    {tamanho.includes("cep") && <div className="invalid-feedback">CEP inválido (deve ter 8 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="cidade" class="form-label">Cidade <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cidade") && "is-invalid"}`} id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                    {vazio.includes("cidade") && <div className="invalid-feedback">Informe a cidade.</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="uf" class="form-label">Estado <span className="text-danger">*</span></label>
                                    <Select isSearchable={true} isClearable={true} className={`${hasError("estado") && "is-invalid"}`} id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                    </Select>
                                    {vazio.includes("estado") && <div className="invalid-feedback">Informe o estado.</div>}
                                </div>


                                <div class="col-md-4">
                                    <label for="logradouro" class="form-label">Logradouro <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("logradouro") && "is-invalid"}`} id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("logradouro") && <div className="invalid-feedback">Informe o logradouro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="numero" class="form-label">Número <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("numero") && "is-invalid"}`} id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("numero") && <div className="invalid-feedback">Informe o número.</div>}
                                    {tipo.includes("numero") && <div className="invalid-feedback">Número inválido.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="bairro" class="form-label">Bairro <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("bairro") && "is-invalid"}`} id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("bairro") && <div className="invalid-feedback">Informe o bairro.</div>}
                                </div>

                            </div>
                        </fieldset>

                        {/* Botão de Submissão */}
                        <div className="d-flex justify-content-end pb-3">
                            <button type="button" className="btn btn-outline-secondary d-flex align-items-center btn-lg px-4 me-3" onClick={() => navigate(-1)}>
                                Voltar
                            </button>
                            <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Salvando..
                                    </>
                                ) : (
                                    "Salvar"
                                )}
                            </button>
                        </div>

                    </form >}

                {opcao === 'juridica' &&
                    <form onSubmit={saveClienteJuridica} className={`mt-5 ${sucesso && "d-none"}`}>

                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações do Cliente</legend>
                            <div className="row g-3">
                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Nome <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("nome") && "is-invalid"}`} id="nome" name="nome" aria-describedby="nomeHelp" value={cliente.nome} onChange={handleInputChangeCliente} />
                                    {vazio.includes("nome") && <div className="invalid-feedback">Informe o nome.</div>}

                                </div>

                                <div class="col-md-4 ">
                                    <label for="valor" class="form-label">Email <span className="text-danger">*</span></label>
                                    <input type="email" className={`form-control ${hasError("email") && "is-invalid"}`} id="email" name="email" aria-describedby="emailHelp" value={cliente.email} onChange={handleInputChangeCliente} />

                                    {vazio.includes("email") && <div className="invalid-feedback">Informe o email.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="telefone" class="form-label">Telefone <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("telefone") && "is-invalid"}`} id="telefone" name="telefone" aria-describedby="telefoneHelp" value={cliente.telefone} onChange={handleInputChangeCliente} />

                                    {vazio.includes("telefone") && <div className="invalid-feedback">Informe o telefone.</div>}
                                    {tamanho.includes("telefone") && <div className="invalid-feedback">Telefone inválido.</div>}
                                </div>
                                <div class="col-md-4">
                                    <label for="cnpj" class="form-label">CNPJ <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cnpj") && "is-invalid"}`} id="cpf" name="cnpj" aria-describedby="cnpjHelp" value={juridica.cnpj} onChange={handleInputChangeJuridica} />
                                    {vazio.includes("cnpj") && <div className="invalid-feedback">Informe o CNPJ.</div>}
                                    {(tamanho.includes("cnpj") || tipo.includes("cnpj")) && <div className="invalid-feedback">CNPJ inválido.</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="razao_social" class="form-label">Razão Social</label>
                                    <input type="text" class="form-control" id="razao_social" name="razao_social" aria-describedby="razao_socialHelp" value={juridica.razao_social} onChange={handleInputChangeJuridica} />
                                </div>

                                <div class="col-md-4">
                                    <label for="nome_responsavel" class="form-label">Nome do responsável <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("nome_responsavel") && "is-invalid"}`} id="nome_responsavel" name="nome_responsavel" aria-describedby="nome_responsavelHelp" value={juridica.nome_responsavel} onChange={handleInputChangeJuridica} />
                                    {vazio.includes("nome_responsavel") && <div className="invalid-feedback">Informe o nome do responsável.</div>}
                                </div>
                            </div>
                        </fieldset>


                        <fieldset className="mb-5">
                            <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações de Endereço</legend>
                            <div className="row g-3">
                                <div class="col-md-4">
                                    <label for="cep" class="form-label">CEP <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cep") && "is-invalid"}`} id="cep" name="cep" aria-describedby="cepHelp" value={endereco.cep} onChange={handleInputChangeEndereco} />

                                    {vazio.includes("cep") && <div className="invalid-feedback">Informe o CEP.</div>}
                                    {tamanho.includes("cep") && <div className="invalid-feedback">CEP inválido (deve ter 8 caracteres numéricos).</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="cidade" class="form-label">Cidade <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("cidade") && "is-invalid"}`} id="cidade" name="cidade" aria-describedby="cidadeHelp" value={cidade.nome} onChange={handleInputChangeCidade} />
                                    {vazio.includes("cidade") && <div className="invalid-feedback">Informe a cidade.</div>}

                                </div>

                                <div class="col-md-4">
                                    <label for="uf" class="form-label">Estado <span className="text-danger">*</span></label>
                                    <Select isSearchable={true} className={`${hasError("estado") && "is-invalid"}`} id="uf" name="uf" placeholder="Selecione o estado" options={optionsEstados} value={optionsEstados.find(option => option.value === estado.uf)} onChange={handleInputChangeEstado}>
                                    </Select>

                                    {vazio.includes("estado") && <div className="invalid-feedback">Informe o estado.</div>}
                                </div>

                                <div class="col-md-4">
                                    <label for="logradouro" class="form-label">Logradouro <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("logradouro") && "is-invalid"}`} id="logradouro" name="logradouro" aria-describedby="logradourodeHelp" value={endereco.logradouro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("logradouro") && <div className="invalid-feedback">Informe o logradouro.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="numero" class="form-label">Número <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("numero") && "is-invalid"}`} id="numero" name="numero" aria-describedby="numerodeHelp" value={endereco.numero} onChange={handleInputChangeEndereco} />

                                    {vazio.includes("numero") && <div className="invalid-feedback">Informe o número.</div>}
                                    {tipo.includes("numero") && <div className="invalid-feedback">Número inválido.</div>}
                                </div>

                                <div class="col-md-4 ">
                                    <label for="bairro" class="form-label">Bairro <span className="text-danger">*</span></label>
                                    <input type="text" className={`form-control ${hasError("bairro") && "is-invalid"}`} id="bairro" name="bairro" aria-describedby="bairroHelp" value={endereco.bairro} onChange={handleInputChangeEndereco} />
                                    {vazio.includes("bairro") && <div className="invalid-feedback">Informe o bairro.</div>}
                                </div>

                            </div>
                        </fieldset>


                        <div className="d-flex justify-content-end pb-3 ">
                            <button type="button" className="btn btn-outline-secondary d-flex align-items-center btn-lg px-4 me-3" onClick={() => navigate(-1)}>
                                Voltar
                            </button>
                            <button type="submit" className="btn btn-primary btn-lg px-4" disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                        Salvando..
                                    </>
                                ) : (
                                    <>
                                        Salvar
                                    </>
                                )}
                            </button>
                        </div>

                    </form >}
            </div >
        </>
    )
}


export default Cliente;