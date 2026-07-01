import Header from "../Header";
import { useState } from "react";
import ManutencaoDataService from "../../services/manutencaoDataService";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaBuilding, FaUserTie, FaIdCard, FaFileContract } from "react-icons/fa";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
import React from "react";
import HelpPopover from "../HelpPopover";
import { NumericFormat } from "react-number-format";

const EditarManutencao = () => {

    const { id } = useParams();

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    const [loading, setLoading] = useState(true);


    const [formData, setFormData] = useState({
        valor: "", data_envio: "", descricao: "", previsao_retorno: "",


        automovelId: null,

    });


    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            ManutencaoDataService.getById(id),
            AutomovelDataService.getAll(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll(),
        ]).then(([manutencaoId, automoveis, modelos, marcas]) => {
            const manutencao = manutencaoId.data;
            setFormData(prev => ({ ...prev, ...manutencao }));

            const dataEnvioAjustada = ajustarDataParaFusoLocal(manutencao.data_envio);
            const previsaoRetornoAjustada = ajustarDataParaFusoLocal(manutencao.previsao_retorno);

            setFormData({
                ...manutencao,
                data_envio: dataEnvioAjustada,
                previsao_retorno: previsaoRetornoAjustada
            });

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

    const ajustarDataParaFusoLocal = (dataString) => {
        if (!dataString) return null;

        const dataUtc = new Date(dataString);

        const timezoneOffsetEmMs = dataUtc.getTimezoneOffset() * 60 * 1000;

        const dataCorrigida = new Date(dataUtc.valueOf() + timezoneOffsetEmMs);

        return dataCorrigida;
    };


    const handleAutomovelChange = (selectedOption) => {
        setFormData({ ...formData, automovelId: selectedOption ? selectedOption.value : "" });
    };


    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };


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
        if (!formData.data_envio) vazioErros.push("data_envio");
        if (!formData.valor) vazioErros.push("valor");
        if (!formData.automovelId) vazioErros.push("automovelId");

        // Tipo
        if (formData.data_envio && formData.data_envio > new Date()) tipoErros.push("data_envio");

        const hoje = new Date();

        hoje.setHours(0, 0, 0, 0);

        if (formData.previsao_retorno && formData.previsao_retorno < hoje) tipoErros.push("previsao_retorno");
        if (formData.valor && (isNaN(formData.valor) || formData.valor <= 0)) tipoErros.push("valor");


        return { vazioErros, tamanhoErros, tipoErros };
    };

    const optionsAutomovel = automovel?.map((d) => {
        const nomeMarca = marca?.find(marca => marca.id === d.marcaId);
        const nomeModelo = modelo?.find(modelo => modelo.marcaId === nomeMarca.id);

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



    const editarManutencao = async (e) => {

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

            const manutencaoData = new FormData();
            manutencaoData.append("data_envio", formData.data_envio);
            manutencaoData.append("previsao_retorno", formData.previsao_retorno);
            manutencaoData.append("valor", formData.valor);
            manutencaoData.append("descricao", formData.descricao);
            manutencaoData.append("automovelId", formData.automovelId);

            await ManutencaoDataService.update(id, manutencaoData);

            setSucesso(true);
            setMensagemSucesso("Manutencão editada com sucesso!");

            setTimeout(() => {
                navigate('/listagem/manutencoes');
            }, 1500)

        } catch (error) {
            console.error("Erro ao atualizar manutenção:", error);
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


    return (
        <>
            <Header />

            <div className="container">
                <div className="mb-4 mt-3">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Edição de Manutenção</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Edição de Manutenção"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta página serve para atualizar as informações de um veículo que foi enviado para manutenção externa.
                                    </p>
                                    <strong>Pontos Importantes:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Datas e Prazos:</strong> Altere a 'Data de envio' ou a 'Previsão de retorno' para refletir o andamento do serviço.
                                        </li>
                                        <li className="mb-1">
                                            <strong>Custos e Descrição:</strong> Atualize o valor orçado para a manutenção e edite a descrição para detalhar os serviços que estão sendo realizados.
                                        </li>
                                        <li>
                                            <strong>Automóvel:</strong> É possível corrigir o automóvel associado a este registro de manutenção, caso tenha sido selecionado incorretamente.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Preencha os dados abaixo para editar a manutenção desejada.</p>
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

                <form onSubmit={editarManutencao} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" />
                            Detalhes da Manutenção
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor da Manutenção (R$) <span className="text-danger">*</span></label>
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
                                    <label for="data" class="form-label">Data de envio <span className="text-danger">*</span></label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        customInput={
                                            <CustomDateInput className={`form-control ${hasError("data_envio") && "is-invalid"}`} />
                                        }
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={formData.data_envio}
                                        onChange={(date) => setFormData({ ...formData, data_envio: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />

                                    {(vazio.includes("data_envio") || tipo.includes("data_envio")) && (
                                        <div className="invalid-feedback" style={{ display: "block" }}>
                                            {vazio.includes("data_envio") ? "Informe a data." : "Data inválida."}
                                        </div>
                                    )}

                                </div>
                                <div className="col-md-4">
                                    <label for="data" class="form-label">Previsão de retorno</label><br />
                                    <DatePicker
                                        calendarClassName="custom-datepicker-container"
                                        customInput={
                                            <CustomDateInput className={`form-control ${hasError("previsao_retorno") && "is-invalid"}`} />
                                        }
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={formData.previsao_retorno}
                                        onChange={(date) => setFormData({ ...formData, previsao_retorno: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />

                                    {(vazio.includes("previsao_retorno") || tipo.includes("previsao_retorno")) && (
                                        <div className="invalid-feedback" style={{ display: "block" }}>
                                            {vazio.includes("previsao_retorno") ? "Informe a previsao de retorno." : "Data inválida."}
                                        </div>
                                    )}

                                </div>
                                <div className="col-md-4">
                                    <label for="automovel" class="form-label">Automóvel <span className="text-danger">*</span></label>
                                    <Select styles={getCustomStyles("automovelId")} formatOptionLabel={formatOptionLabel} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovelId" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={handleAutomovelChange} value={optionsAutomovel.find(option => option.value === formData.automovelId) || null} isClearable={true}
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
                                    {vazio.includes("automovelId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel.</div>}
                                </div>
                                <div className="col-md-8">
                                    <label for="descricao" class="form-label">Descrição</label>
                                    <textarea type="text" rows="3" className={`form-control ${hasError("descricao") && "is-invalid"}`} id="descricao" name="descricao" aria-describedby="descricaoHelp" onChange={handleInputChange} value={formData.descricao ?? ""} />

                                    {tipo.includes("descricao") && <div id="descricaohelp" class="form-text text-danger ms-1">Descrição inválida.</div>}
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

export default EditarManutencao;