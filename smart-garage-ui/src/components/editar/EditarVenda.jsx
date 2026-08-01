import Header from "../Header";
import { useState } from "react";
import VendaDataService from "../../services/vendaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import ComissaoDataService from "../../services/comissaoDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import ClienteDataService from "../../services/clienteDataService";
import Select from "react-select";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature, FaPlus, FaTrash, FaMoneyBillWave } from "react-icons/fa";
import React from "react";
import HelpPopover from "../HelpPopover";
import { NumericFormat } from "react-number-format";

const EditarVenda = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [cliente, setCliente] = useState([]);
    const [fisica, setFisica] = useState([]);
    const [juridica, setJuridica] = useState([]);

    const [loading, setLoading] = useState(true);


    const [formData, setFormData] = useState({

        valor: "", data: "", comissao: "",

        clienteId: null,
        automovelId: null,

    });

    // Estado para múltiplos pagamentos
    const [pagamentos, setPagamentos] = useState([
        { forma_pagamento: "", valor: "", observacao: "" }
    ]);

    const [regrasComissao, setRegrasComissao] = useState([]);

    useEffect(() => {
        ComissaoDataService.getAll()
            .then(response => {
                setRegrasComissao(response.data);
            })
            .catch(e => console.error("Erro ao buscar regras de comissão:", e));
    }, []);


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            VendaDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
            ClienteDataService.getAll(),
            FisicaDataService.getAll(),
            JuridicaDataService.getAll()
        ]).then(([vendaId, automoveis, modelos, marcas, clientes, fisica, juridica]) => {
            const venda = vendaId.data;

            const dataVendaAjustada = ajustarDataParaFusoLocal(venda.data);

            setFormData({
                ...venda,
                data: dataVendaAjustada
            });

            // Carregar pagamentos existentes
            if (venda.pagamento_vendas && venda.pagamento_vendas.length > 0) {
                setPagamentos(venda.pagamento_vendas.map(p => ({
                    forma_pagamento: p.forma_pagamento,
                    valor: p.valor,
                    observacao: p.observacao || ""
                })));
            } else if (venda.forma_pagamento) {
                // Fallback para vendas antigas com forma_pagamento direto
                setPagamentos([{
                    forma_pagamento: venda.forma_pagamento,
                    valor: venda.valor,
                    observacao: ""
                }]);
            }

            setAutomovel(automoveis.data);
            setModelo(modelos.data);
            setMarca(marcas.data);
            setCliente(clientes.data);
            setFisica(fisica.data);
            setJuridica(juridica.data);
        }).catch((err) => {
            console.error("Erro ao carregar dados:", err);
            setLoading(false);
        }).finally(() => {
            setLoading(false);
            clearTimeout(timeout);
        });
    }, []);

    const ajustarDataParaFusoLocal = (dataString) => {
        if (!dataString) return null;

        const dataUtc = new Date(dataString);

        const timezoneOffsetEmMs = dataUtc.getTimezoneOffset() * 60 * 1000;

        const dataCorrigida = new Date(dataUtc.valueOf() + timezoneOffsetEmMs);

        return dataCorrigida;
    };


    const handleProprietarioChange = (selectedOption) => {
        setFormData({ ...formData, clienteId: selectedOption ? selectedOption.value : "" });
    };

    const handleAutomovelChange = (selectedOption) => {
        setFormData({ ...formData, automovelId: selectedOption ? selectedOption.value : "" });
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handlers de pagamento
    const handlePagamentoChange = (index, field, value) => {
        const novosPagamentos = [...pagamentos];
        novosPagamentos[index][field] = value;
        setPagamentos(novosPagamentos);
    };

    const adicionarPagamento = () => {
        if (pagamentos.length < 3) {
            setPagamentos([...pagamentos, { forma_pagamento: "", valor: "", observacao: "" }]);
        }
    };

    const removerPagamento = (index) => {
        if (pagamentos.length > 1) {
            const novosPagamentos = pagamentos.filter((_, i) => i !== index);
            setPagamentos(novosPagamentos);
        }
    };

    const somaPagamentos = pagamentos.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);
    const valorVenda = parseFloat(formData.valor || 0);
    const diferencaPagamentos = Math.abs(somaPagamentos - valorVenda);
    const pagamentosConferem = diferencaPagamentos < 0.01 && valorVenda > 0;


    useEffect(() => {
        const valorVenda = parseFloat(formData?.valor);
        if (isNaN(valorVenda)) {
            setFormData(prev => ({ ...prev, comissao: '' }));
            return;
        }

        let comissaoCalculada = '';

        if (regrasComissao && regrasComissao.length > 0) {
            for (const regra of regrasComissao) {
                const min = parseFloat(regra.valor_minimo);
                const maxParsed = parseFloat(regra.valor_maximo);
                const max = (!isNaN(maxParsed) && maxParsed > 0) ? maxParsed : Infinity;

                if (valorVenda >= min && valorVenda <= max) {
                    comissaoCalculada = regra.valor_comissao;
                    break;
                }
            }
        } else {
            comissaoCalculada = valorVenda < 50000 ? 300 : valorVenda >= 100000 ? 700 : 500;
        }

        setFormData(prev => ({
            ...prev,
            comissao: comissaoCalculada
        }));

    }, [formData?.valor, regrasComissao]);


    const [isSubmitting, setIsSubmitting] = useState(false);

    const [mensagemErro, setMensagemErro] = useState('');
    const [erro, setErro] = useState(false);

    const [mensagemSucesso, setMensagemSucesso] = useState('');
    const [sucesso, setSucesso] = useState(false);

    const [vazio, setVazio] = useState([]);
    const [tamanho, setTamanho] = useState([]);
    const [tipo, setTipo] = useState([]);

    const navigate = useNavigate();

    const validateFields = () => {
        let vazioErros = [];
        let tamanhoErros = [];
        let tipoErros = [];

        // Vazio
        if (!formData.data) vazioErros.push("data");
        if (!formData.clienteId) vazioErros.push("clienteId");
        if (!formData.comissao) vazioErros.push("comissao");
        if (!formData.automovelId) vazioErros.push("automovelId");
        if (!formData.valor) vazioErros.push("valor");

        // Validação dos pagamentos
        pagamentos.forEach((p, i) => {
            if (!p.forma_pagamento) vazioErros.push(`pagamento_forma_${i}`);
            if (!p.valor) vazioErros.push(`pagamento_valor_${i}`);
        });

        if (!pagamentosConferem && formData.valor) {
            tipoErros.push("pagamentos_soma");
        }

        // Tipo
        if (formData.valor && isNaN(formData.valor)) tipoErros.push("valor");
        if (formData.valor && formData.valor <= 0) tipoErros.push("valor");
        if (formData.comissao && formData.comissao < 0) tipoErros.push("comissao");
        if (formData.comissao && isNaN(formData.comissao)) tipoErros.push("comissao");
        if (formData.data && formData.data > new Date()) tipoErros.push("data");

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

    const optionsAutomovel = automovel?.map((d) => {
        const nomeMarca = marca?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modelo?.find(modelo => modelo.id === d.modeloId);

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


    const getCustomStyles = (fieldName) => ({
        option: (provided, state) => ({
            ...provided,
            padding: 10,
            fontSize: '1rem',
            fontWeight: 'normal',
            backgroundColor: state.isFocused ? 'var(--bs-secondary-bg, #f0f0f0)' : 'var(--bs-body-bg, white)',
            color: 'var(--bs-body-color, black)',
            whiteSpace: 'pre-wrap',
        }),
        control: (provided) => ({
            ...provided,
            fontSize: '1rem',
            backgroundColor: 'var(--bs-body-bg, white)',
            borderColor: hasError(fieldName) ? '#dc3545' : 'var(--bs-border-color, #dee2e6)',
            '&:hover': {
                borderColor: hasError(fieldName) ? '#dc3545' : provided['&:hover']?.borderColor,
            }
        }),
        singleValue: (provided) => ({
            ...provided,
            fontWeight: 'normal',
            color: 'var(--bs-body-color, #333)',
        }),
        menu: (provided) => ({
            ...provided,
            backgroundColor: 'var(--bs-body-bg, white)',
            zIndex: 9999,
        }),
        input: (provided) => ({
            ...provided,
            color: 'var(--bs-body-color, #333)'
        })
    });

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


    const editarVenda = async (e) => {

        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
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

            const vendaData = {
                data: formData.data,
                valor: formData.valor,
                comissao: formData.comissao,
                clienteId: formData.clienteId,
                automovelId: formData.automovelId,
                pagamentos: pagamentos.map(p => ({
                    forma_pagamento: p.forma_pagamento,
                    valor: parseFloat(p.valor),
                    observacao: p.observacao || null
                }))
            };

            await VendaDataService.update(id, vendaData);

            setSucesso(true);
            setMensagemSucesso("Venda editada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/vendas');
            }, 1500)

        } catch (error) {
            console.error("Erro ao atualizar venda:", error);
        } finally {
            setIsSubmitting(false);
        }
    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    const CustomDateInput = React.forwardRef(({ value, onClick, className }, ref) => (
        <>
            <input
                type="text"
                className={className}
                onClick={onClick}
                ref={ref}
                value={value}
                readOnly
            />
        </>
    ));

    const formatter = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    });


    return (
        <>
            <Header />
            <div className="container">

                <div className="mb-4 mt-3">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Edição de Venda</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Edição de Venda"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Use esta página para corrigir ou atualizar os detalhes de uma venda já registrada no sistema.
                                    </p>
                                    <strong>Pontos Importantes:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Correção de Dados:</strong> Altere o valor final da venda, a data e as formas de pagamento, se necessário. O valor de comissão será calculado automaticamente a partir do valor final da venda.
                                        </li>
                                        <li className="mb-1">
                                            <strong>Vínculos:</strong> Você pode corrigir o cliente (comprador) ou o automóvel associado a esta transação.
                                        </li>
                                        <li>
                                            <strong>Impacto Financeiro:</strong> Lembre-se que as alterações nos valores afetarão diretamente os relatórios financeiros e de comissões.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Preencha os dados abaixo para editar a venda desejada.</p>
                </div>

                <p className="text-muted small">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>

                {erro &&
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        <div>{mensagemErro}</div>
                    </div>
                }
                {sucesso &&
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                }

                <form onSubmit={editarVenda} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" />
                            Detalhes da Venda
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="valor" className="form-label">Valor da Venda (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" placeholder="R$ 0,00" value={formData.valor ?? ""}
                                        onValueChange={(values) => {
                                            const syntheticEvent = {
                                                target: {
                                                    name: "valor",
                                                    value: values.value
                                                }
                                            };
                                            handleInputChange(syntheticEvent);
                                        }}

                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                    {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="comissao" className="form-label">Comissão (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("comissao") && "is-invalid"}`} id="comissao" name="comissao" placeholder="R$ 0,00" value={formData.comissao ?? ""}
                                        onValueChange={(values) => {
                                            const syntheticEvent = {
                                                target: {
                                                    name: "comissao",
                                                    value: values.value
                                                }
                                            };
                                            handleInputChange(syntheticEvent);
                                        }}

                                        thousandSeparator="."
                                        decimalSeparator=","
                                        prefix="R$ "
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    {vazio.includes("comissao") && <div id="comissaohelp" className="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                    {tipo.includes("comissao") && <div id="comissaohelp" className="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="data" className="form-label">Data <span className="text-danger">*</span></label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        customInput={
                                            <CustomDateInput className={`form-control ${hasError("data") && "is-invalid"}`} />
                                        }
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={formData.data}
                                        onChange={(date) => setFormData({ ...formData, data: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />

                                    {(vazio.includes("data") || tipo.includes("data")) && (
                                        <div className="invalid-feedback" style={{ display: "block" }}>
                                            {vazio.includes("data") ? "Informe a data." : "Data inválida."}
                                        </div>
                                    )}

                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="fornecedor" className="form-label">Proprietario <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabelFornecedor} isSearchable={true} className={`${hasError("clienteId") && "is-invalid"}`} id="fornecedor" name="clienteId" placeholder="Selecione o fornecedor" options={optionsFornecedor} onChange={handleProprietarioChange} value={optionsFornecedor.find(option => option.value === formData.clienteId) || null} isClearable={true}
                                        styles={getCustomStyles("clienteId")}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.nome,
                                                label.razaoSocial,
                                                label.marca,
                                                label.modelo,
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("clienteId") && <div className="form-text text-danger ms-1">Informe o comprador.</div>}
                                </div>
                                <div className="col-md-6">
                                    <label htmlFor="automovel" className="form-label">Automóvel <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovelId" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === formData.automovelId) || null} isClearable={true}
                                        styles={getCustomStyles("automovelId")}
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
                                    {vazio.includes("automovelId") && <div id="valorHelp" className="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card de Formas de Pagamento */}
                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                <FaMoneyBillWave className="me-2" />
                                Formas de Pagamento
                            </div>
                            {pagamentos.length < 3 && (
                                <button
                                    type="button"
                                    className="btn btn-outline-primary btn-sm d-flex align-items-center"
                                    onClick={adicionarPagamento}
                                >
                                    <FaPlus className="me-1" /> Adicionar
                                </button>
                            )}
                        </div>
                        <div className="card-body">
                            {pagamentos.map((pagamento, index) => (
                                <div key={index} className={`row g-3 align-items-end ${index > 0 ? 'mt-2 pt-3 border-top' : ''}`}>
                                    <div className="col-md-4">
                                        <label className="form-label">
                                            Forma de Pagamento {index + 1} <span className="text-danger">*</span>
                                        </label>
                                        <Select
                                            placeholder="Selecione..."
                                            options={optionsFormaPagamento}
                                            value={optionsFormaPagamento.find(o => o.value === pagamento.forma_pagamento) || null}
                                            onChange={(option) => handlePagamentoChange(index, 'forma_pagamento', option ? option.value : '')}
                                            isClearable={true}
                                            styles={getCustomStyles(`pagamento_forma_${index}`)}
                                            className={`${hasError(`pagamento_forma_${index}`) && "is-invalid"}`}
                                        />
                                        {vazio.includes(`pagamento_forma_${index}`) && (
                                            <div className="form-text text-danger ms-1">Informe a forma de pagamento.</div>
                                        )}
                                    </div>
                                    <div className="col-md-3">
                                        <label className="form-label">
                                            Valor (R$) <span className="text-danger">*</span>
                                        </label>
                                        <NumericFormat
                                            className={`form-control ${hasError(`pagamento_valor_${index}`) && "is-invalid"}`}
                                            placeholder="R$ 0,00"
                                            value={pagamento.valor}
                                            onValueChange={(values) => handlePagamentoChange(index, 'valor', values.value)}
                                            thousandSeparator="."
                                            decimalSeparator=","
                                            prefix="R$ "
                                            decimalScale={2}
                                            fixedDecimalScale={true}
                                            allowNegative={false}
                                        />
                                        {vazio.includes(`pagamento_valor_${index}`) && (
                                            <div className="form-text text-danger ms-1">Informe o valor.</div>
                                        )}
                                    </div>
                                    <div className="col-md-4">
                                        <label className="form-label">Observação</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ex: Entrada, Parcela..."
                                            value={pagamento.observacao}
                                            onChange={(e) => handlePagamentoChange(index, 'observacao', e.target.value)}
                                        />
                                    </div>
                                    <div className="col-md-1 d-flex justify-content-center">
                                        {pagamentos.length > 1 && (
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => removerPagamento(index)}
                                                title="Remover pagamento"
                                            >
                                                <FaTrash />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}

                            {/* Resumo dos pagamentos */}
                            <div className={`mt-4 p-3 rounded d-flex justify-content-between align-items-center ${pagamentosConferem ? 'bg-success bg-opacity-10 border border-success' : valorVenda > 0 ? 'bg-warning bg-opacity-10 border border-warning' : 'border'}`}>
                                <div>
                                    <span className="fw-bold">Soma dos Pagamentos: </span>
                                    <span className={pagamentosConferem ? 'text-success fw-bold' : 'text-warning fw-bold'}>
                                        {formatter.format(somaPagamentos)}
                                    </span>
                                    <span className="text-muted mx-2">/</span>
                                    <span className="text-muted">
                                        Valor da Venda: {formatter.format(valorVenda)}
                                    </span>
                                </div>
                                <div>
                                    {pagamentosConferem ? (
                                        <span className="badge bg-success d-flex align-items-center">
                                            <i className="bi bi-check-circle-fill me-1"></i> Valores conferem
                                        </span>
                                    ) : valorVenda > 0 ? (
                                        <span className="badge bg-warning text-dark d-flex align-items-center">
                                            <i className="bi bi-exclamation-triangle-fill me-1"></i> Diferença: {formatter.format(diferencaPagamentos)}
                                        </span>
                                    ) : null}
                                </div>
                            </div>

                            {tipo.includes("pagamentos_soma") && (
                                <div className="form-text text-danger ms-1 mt-2">
                                    A soma dos pagamentos deve ser igual ao valor da venda.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="d-flex justify-content-end">
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

                </form>

            </div >
        </>
    )
}

export default EditarVenda;