import Header from "../Header";
import { useState } from "react";
import VendaDataService from "../../services/vendaDataService";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import ClienteDataService from "../../services/clienteDataService";
import Select from "react-select";
import FisicaDataService from "../../services/fisicaDataService";
import JuridicaDataService from "../../services/juridicaDataService";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
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

        valor: "", data: "", forma_pagamento: "", comissao: "",

        clienteId: null,
        automovelId: null,

    });


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
            setFormData(prev => ({ ...prev, ...venda }));

            const dataVendaAjustada = ajustarDataParaFusoLocal(venda.data);

            setFormData({
                ...venda,
                data: dataVendaAjustada
            });

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


    useEffect(() => {

        let comissao = "";

        if (formData?.valor !== "") {
            comissao = formData?.valor < 50000 ? 300 : formData?.valor >= 100000 ? 700 : 500;
        }

        setFormData(prev => ({
            ...prev,
            comissao: comissao
        }));

    }, [formData?.valor]);


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
        if (!formData.forma_pagamento) vazioErros.push("forma_pagamento");
        if (!formData.valor) vazioErros.push("valor");

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

            const vendaData = new FormData();
            vendaData.append("data", formData.data);
            vendaData.append("valor", formData.valor);
            vendaData.append("comissao", formData.comissao);
            vendaData.append("forma_pagamento", formData.forma_pagamento);
            vendaData.append("clienteId", formData.clienteId);
            vendaData.append("automovelId", formData.automovelId);


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
                                            <strong>Correção de Dados:</strong> Altere o valor final da venda, a data e a forma de pagamento, se necessário. O valor de comissão será calculado automaticamente a partir do valor final da venda.
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
                                    <label for="valor" class="form-label">Valor da Venda (R$) <span className="text-danger">*</span></label>
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
                                    <label for="forma_pagamento" class="form-label">Forma de Pagamento <span className="text-danger">*</span></label>
                                    <Select className={`${hasError("forma_pagamento") && "is-invalid"}`} id="forma_pagamento" name="forma_pagamento" placeholder="Selecione a forma de pagamento" value={optionsFormaPagamento.find(option => option.value === formData.forma_pagamento)} onChange={(option) => setFormData({ ...formData, forma_pagamento: option.value })} options={optionsFormaPagamento} isClearable={true}>
                                    </Select>
                                    {vazio.includes("forma_pagamento") && <div id="formapagamentohelp" class="form-text text-danger ms-1">Informe a forma de pagamento.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="comissao" class="form-label">Comissão (R$) <span className="text-danger">*</span></label>
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
                                    {vazio.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Informe o valor de comissão.</div>}
                                    {tipo.includes("comissao") && <div id="comissaohelp" class="form-text text-danger ms-1">Valor de comissão inválido.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="data" class="form-label">Data <span className="text-danger">*</span></label><br />
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
                                <div className="col-md-4">
                                    <label for="fornecedor" class="form-label">Proprietario <span className="text-danger">*</span></label>
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
                                <div className="col-md-4">
                                    <label for="automovel" class="form-label">Automóvel <span className="text-danger">*</span></label>
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
                                    {vazio.includes("automovelId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel fornecido.</div>}
                                </div>
                            </div>
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