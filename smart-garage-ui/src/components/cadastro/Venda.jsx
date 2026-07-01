import { useState, useEffect } from "react";
import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useLocation, useNavigate } from "react-router-dom";
import ClienteDataService from "../../services/clienteDataService";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import VendaDataService from "../../services/vendaDataService";
import ConsignacaoDataService from "../../services/consignacaoDataService";
import { FaBuilding, FaUserTie, FaIdCard } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileContract, FaFileSignature } from "react-icons/fa";
import { useAuth } from '../../context/AuthContext';
import ComissaoDataService from '../../services/comissaoDataService';
import HelpPopover from "../HelpPopover";
import { NumericFormat } from 'react-number-format';

const Venda = () => {

    const { user } = useAuth();

    const location = useLocation();
    const automovelId = location.state?.automovelId;
    const clienteId = location.state?.clienteId;

    const [automovel, setAutomovel] = useState();

    const [id, setId] = useState();

    useEffect(() => {
        AutomovelDataService.getById(automovelId)
            .then((automovel) => {
                setAutomovel(automovel.data)
            }).catch((erro) => {
                console.error("Erro ao carregar dados:", erro);
            })
    }, [])

    const navigate = useNavigate();

    const initialVendaState = {
        id: null,
        valor: "",
        data: new Date(),
        comissao: "",
        forma_pagamento: "",
        automovelId: "",
        clienteId: "",
        funcionarioId: user?.id
    };

    const [venda, setVenda] = useState(initialVendaState);

    useEffect(() => {
        setVenda(prev => ({
            ...prev,
            clienteId: clienteId || "",
            automovelId: automovelId || ""
        }));
    }, [clienteId, automovelId]);

    useEffect(() => {
        if (automovel?.valor && !venda.valor) {
            setVenda(prev => ({
                ...prev,
                valor: automovel.valor
            }));
        }
    }, [automovel?.valor]);



    const handleInputChangeVenda = event => {
        const { name, value } = event.target;
        setVenda({ ...venda, [name]: value });
    }

    const handleSelectChange = (selectedOption, fieldName) => {
        setVenda(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
    };

    const [loading, setLoading] = useState(true);

    const [automovelOpt, setAutomovelOpt] = useState([]);
    const [modeloOpt, setModeloOpt] = useState([]);
    const [marcaOpt, setMarcaOpt] = useState([]);
    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll(),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([clientes, fisica, juridica, automoveis, modelos, marcas]) => {
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
            setAutomovelOpt(automoveis.data);
            setModeloOpt(modelos.data);
            setMarcaOpt(marcas.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false); // Garante que o loading não fica travado
        }).finally(() => {
            setLoading(false); // Esconde o loading quando tudo terminar
            clearTimeout(timeout);
        });
    }, []);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!venda.valor) vazioErros.push("valor");
        if (!venda.data) vazioErros.push("data");
        if (!venda.clienteId) vazioErros.push("clienteId");
        if (!venda.comissao) vazioErros.push("comissao");
        if (!venda.automovelId) vazioErros.push("automovelId");
        if (!venda.forma_pagamento) vazioErros.push("forma_pagamento");

        // Tamanho

        // Tipo
        if (venda.data && venda.data > new Date()) tipoErros.push("data");
        if (venda.valor && (isNaN(venda.valor) || venda.valor <= 0)) tipoErros.push("valor");

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const optionsFornecedor = cliente?.map((d) => {
        const pessoaFisica = fisica.find(pessoa => pessoa.clienteId === d.id);
        const pessoaJuridica = juridica.find(pessoa => pessoa.clienteId === d.id);

        return {
            value: d.id,

            label: {
                nome: d.nome,
                razaoSocial: pessoaJuridica?.razao_social,
                cpf: pessoaFisica?.cpf,
                cnpj: pessoaJuridica?.cnpj,
                tipo: pessoaJuridica ? 'juridica' : 'fisica'
            }
        }
    });

    const formatOptionLabelFornecedor = ({ value, label }) => {

        const isPessoaJuridica = label.tipo === 'juridica';
        const IconePrincipal = isPessoaJuridica ? FaBuilding : FaUserTie;

        const titulo = isPessoaJuridica ? (label.razaoSocial || label.nome) : label.nome;

        return (
            <div className="d-flex align-items-center">
                <IconePrincipal size="2.5em" color="#0d6efd" className="me-3" />

                <div>
                    <div className="fw-bold fs-6">{titulo}</div>

                    <div className="small text-muted d-flex align-items-center mt-1">
                        {isPessoaJuridica ? (
                            <>
                                <FaFileContract className="me-1" />
                                <span>CNPJ: {label.cnpj}</span>
                            </>
                        ) : (
                            <>
                                <FaIdCard className="me-1" />
                                <span>CPF: {label.cpf}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    const optionsAutomovel = automovelOpt?.map((d) => {
        const nomeMarca = marcaOpt?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modeloOpt?.find(modelo => modelo.id === d.modeloId);

        return {
            value: d.id,

            label: {
                marca: nomeMarca?.nome,
                modelo: nomeModelo?.nome,
                renavam: d.renavam,
                ano: d.ano_modelo,
                placa: d.placa
            }
        };
    });

    const formatOptionLabel = ({ value, label }) => (
        <div className="d-flex align-items-center">
            <FaCar size="2.5em" color="#0d6efd" className="me-3" />

            <div>
                <div className="fw-bold fs-6">
                    {label.marca || "Marca não encontrada"} {label.modelo || ""}
                </div>

                <div className="small text-muted d-flex align-items-center mt-1">
                    <FaRegIdCard className="me-1" />
                    <span>Renavam: {label.renavam}</span>
                    <span className="mx-2">|</span>
                    <FaCalendarAlt className="me-1" />
                    <span>Ano: {label.ano}</span>
                </div>
            </div>
        </div>
    );

    const optionsFormaPagamento = [
        {
            label: "Cartão",
            value: "Cartão"
        },
        {
            label: "Dinheiro",
            value: "Dinheiro"
        },
        {
            label: "Financiamento",
            value: "Financiamento"
        },
        {
            label: "Pix",
            value: "Pix"
        }
    ];

    const getCustomStyles = (fieldName) => ({
        option: (provided, state) => ({
            ...provided,
            padding: 10,
            fontSize: '1rem',
            fontWeight: 'normal',
            backgroundColor: state.isFocused ? '#f0f0f0' : 'white',
            color: 'black',
            whiteSpace: 'pre-wrap',
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '1rem',
            borderColor: hasError(fieldName) ? '#dc3545' : provided.borderColor,
            '&:hover': {
                borderColor: hasError(fieldName) ? '#dc3545' : provided['&:hover']?.borderColor,
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: 'normal',
            color: '#333',
        }),
        menu: (provided) => ({
            ...provided,
            zIndex: 9999,
        }),
    });

    const [regrasComissao, setRegrasComissao] = useState([]);

    useEffect(() => {
        ComissaoDataService.getAll()
            .then(response => {
                setRegrasComissao(response.data);
            })
            .catch(e => console.error("Erro ao buscar regras de comissão:", e));
    }, []);

    useEffect(() => {
        const valorVenda = parseFloat(venda.valor);
        if (isNaN(valorVenda) || regrasComissao.length === 0) {
            setVenda(prev => ({ ...prev, comissao: '' }));
            return;
        }

        let comissaoCalculada = '';
        // Encontra a regra correta
        for (const regra of regrasComissao) {
            const min = parseFloat(regra.valor_minimo);
            const max = regra.valor_maximo ? parseFloat(regra.valor_maximo) : Infinity;

            if (valorVenda >= min && valorVenda < max) {
                comissaoCalculada = regra.valor_comissao;
                break;
            }
        }

        setVenda(prev => ({
            ...prev,
            comissao: comissaoCalculada
        }));

    }, [venda.valor, regrasComissao]);


    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    const saveVenda = async (e) => {

        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setTamanho([]);
        setTipo([]);
        setIsSubmitting(true);

        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        try {

            const dataVenda = {
                comissao: venda.comissao,
                valor: venda.valor,
                data: venda.data,
                forma_pagamento: venda.forma_pagamento,
                clienteId: venda.clienteId,
                automovelId: venda.automovelId,
                funcionarioId: venda.funcionarioId
            };

            const vendaResp = await VendaDataService.create(dataVenda)
                .catch(e => {
                    console.error("Erro ao criar venda:", e);
                });

            setVenda(vendaResp.data);

            const buscaConsignacao = await ConsignacaoDataService.getByAutomovel(automovelId)
                .catch(e => {
                    console.error("Erro ao buscar consignacao:", e);
                });


            if (buscaConsignacao) {

                const id = buscaConsignacao.data.id;

                const updateConsignacao = await ConsignacaoDataService.update(id,
                    {
                        ativo: false,
                        data_fim: venda.data
                    }
                )
                    .catch(e => {
                        console.error("Erro ao atualizar consignação:", e);
                    });
            }

            const updateAutomovel = await AutomovelDataService.update(automovelId,
                { ativo: false }
            )
                .catch(e => {
                    console.error("Erro ao buscar automóvel:", e);
                });

            setSucesso(true);
            setMensagemSucesso("Operação de venda realizada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/vendas');
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


    return (
        <>
            <Header />
            <div className="container">

                <div className="mb-4 mt-3">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Registro de Venda</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Registro de Venda"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Utilize esta tela para formalizar a venda de um automóvel do seu estoque para um cliente. Esta ação irá inativar o veículo no sistema e registrar a transação financeira.
                                    </p>
                                    <strong>Fluxo de Trabalho:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Detalhes da Venda:</strong> Preencha o valor final da venda, a forma de pagamento e a data da transação. A comissão é calculada automaticamente com base no valor da venda.
                                        </li>
                                        <li>
                                            <strong>Pós-Venda:</strong> Ao salvar, o automóvel será marcado como inativo. Se o veículo era consignado, o contrato de consignação será automaticamente finalizado com a data da venda.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Preencha os dados abaixo para registrar uma nova venda no sistema.</p>
                </div>

                <p className="text-muted small">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>

                {erro && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
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

                <form onSubmit={saveVenda} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" />
                            Detalhes da Venda
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor da Venda (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" placeholder="R$ 0,00" onValueChange={(values) => { setVenda(prev => ({ ...prev, valor: values.value })); }} value={venda.valor}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    {vazio.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div id="valorHelp" class="form-text text-danger ms-1">Valor inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="forma_pagamento" class="form-label">Forma de Pagamento <span className="text-danger">*</span></label>
                                    <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === venda.forma_pagamento)} onChange={(option) => setVenda({ ...venda, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}
                                        styles={getCustomStyles("forma_pagamento")}>
                                    </Select>
                                    {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="comissao" class="form-label">Comissão (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat type="text" className={`form-control ${hasError("comissao") && "is-invalid"}`} id="comissao" name="comissao" placeholder="R$ 0,00" value={venda?.comissao} readOnly
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false} />
                                    {vazio.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                    {tipo.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="data" class="form-label">Data <span className="text-danger">*</span></label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        className={`form-control ${hasError("data") && "is-invalid"}`}
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={venda.data}
                                        onChange={(date) => setVenda({ ...venda, data: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                    {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                    {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="fornecedor" class="form-label">Comprador <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} styles={getCustomStyles("clienteId")}
                                        isSearchable={true} className={`${hasError("clienteId") && "is-invalid"}`} id="clienteId" name="clienteId" placeholder="Selecione o fornecedor" options={optionsFornecedor} value={optionsFornecedor.find(option => option.value === venda.clienteId) || null} isClearable={true} filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.nome,
                                                label.razaoSocial,
                                                label.cpf,
                                                label.cnpj,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe o comprador.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="automovel_fornecido" class="form-label">Automóvel Fornecido <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabel} styles={getCustomStyles("automovelId")} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovelId" name="automovelId" placeholder="Selecione o automovel" options={optionsAutomovel} value={optionsAutomovel.find(option => option.value === venda.automovelId) || null} isClearable={true}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.marca,
                                                label.modelo,
                                                label.renavam,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("automovelId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pb-3">
                        <button type="button" className="btn btn-outline-secondary d-flex align-items-center btn-lg px-4 me-3" onClick={() => navigate(`/detalhes/${automovelId}`)}>
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
                </form >
            </div >
        </>
    )
}

export default Venda;