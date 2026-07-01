import Header from "../Header";
import { useState } from "react";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useCallback } from "react";
import Select from "react-select";
import HelpPopover from '../HelpPopover';
import { NumericFormat } from 'react-number-format';

import { FaCar } from "react-icons/fa";

const EditarAutomovel = () => {

    const { id } = useParams();

    const [formData, setFormData] = useState({
        ano_fabricacao: "", ano_modelo: "", cor: "", combustivel: "",
        km: "", origem: "", placa: "", renavam: "", valor: "",

        marcaId: null,
        modeloId: null,

        file: null
    });

    useEffect(() => {
        AutomovelDataService.getById(id).then(automovelResp => {
            const automovel = automovelResp.data;
            setFormData(prev => ({ ...prev, ...automovel }));

        }).catch(e => console.error("Erro ao carregar dados:", e));
    }, [id]);

    useEffect(() => {
        MarcaDataService.getAll().then(response => {
            setMarcasOptions(response.data.map(m => ({ value: m.id, label: m.nome })));
        });
    }, []);

    useEffect(() => {
        if (!formData.marcaId) {
            setModelosOptions([]);
            setFormData(prev => ({ ...prev, modeloId: '' }));
            return;
        }

        setIsModelosLoading(true);
        ModeloDataService.getByMarca(formData.marcaId)
            .then(response => {
                const options = response.data.map(modelo => ({
                    value: modelo.id,
                    label: modelo.nome
                }));
                setModelosOptions(options);
            })
            .catch(e => console.error("Erro ao buscar modelos:", e))
            .finally(() => setIsModelosLoading(false));

    }, [formData.marcaId]);


    const [marcasOptions, setMarcasOptions] = useState([]);
    const [modelosOptions, setModelosOptions] = useState([]);
    const [isModelosLoading, setIsModelosLoading] = useState(false);

    const handleInputChange = event => {
        const { name, value } = event.target;
        const finalValue = name === 'placa' ? value.toUpperCase() : value;
        setFormData(prev => ({ ...prev, [name]: finalValue }));
    };


    const handleSelectChange = (selectedOption, fieldName) => {
        setFormData(prev => ({ ...prev, [fieldName]: selectedOption ? selectedOption.value : '' }));
    };

    const [fileError, setFileError] = useState('');

    const handleFileChange = (e) => {
        const file = e.target.files[0];

        setFileError('');

        if (!file) {
            setFormData({ ...formData, file: null });
            return;
        }

        const tiposPermitidos = ['image/jpeg', 'image/png'];
        if (!tiposPermitidos.includes(file.type)) {
            setFileError('Formato de arquivo inválido. Por favor, envie apenas imagens JPG ou PNG.');
            e.target.value = null;
            setFormData({ ...formData, file: null });
            return;
        }

        const tamanhoMaximo = 5 * 1024 * 1024; // 5MB em bytes
        if (file.size > tamanhoMaximo) {
            setFileError('Arquivo muito grande. O tamanho máximo permitido é de 5 MB.');
            e.target.value = null;
            setFormData({ ...formData, file: null });
            return;
        }

        setFormData({ ...formData, file });
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
        if (!formData.valor) vazioErros.push("valor");
        if (!formData.ano_fabricacao) vazioErros.push("ano_fabricacao");
        if (!formData.ano_modelo) vazioErros.push("ano_modelo");
        if (!formData.renavam) vazioErros.push("renavam");
        if (!formData.placa) vazioErros.push("placa");
        if (!formData.origem) vazioErros.push("origem");
        if (!formData.km) vazioErros.push("km");
        if (!formData.combustivel) vazioErros.push("combustivel");
        if (!formData.cor) vazioErros.push("cor");
        if (!formData.modeloId) vazioErros.push("modelo");
        if (!formData.marcaId) vazioErros.push("marca");

        // Tamanho
        if (formData.renavam && (formData.renavam.length !== 11 || isNaN(formData.renavam))) tamanhoErros.push("renavam");
        if (formData.placa && formData.placa.length !== 7) tamanhoErros.push("placa");

        // Tipo
        if (formData.ano_fabricacao && isNaN(formData.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (formData.ano_modelo && isNaN(formData.ano_modelo)) tipoErros.push("ano_modelo");
        if (formData.valor && (isNaN(formData.valor) || formData.valor <= 0)) tipoErros.push("valor");
        if (formData.km && isNaN(formData.km)) tipoErros.push("km");
        if (formData.cor && (!isNaN(formData.cor))) tipoErros.push("cor");
        if (formData.ano_fabricacao && formData.ano_modelo && formData.ano_fabricacao > formData.ano_modelo) tipoErros.push("ano_modelo_fabricacao");
        const anoAtual = new Date().getFullYear();
        if (formData.ano_modelo && (!/^\d{4}$/.test(formData.ano_modelo) || Number(formData.ano_modelo) > anoAtual + 1)) { tipoErros.push("ano_modelo_futuro"); }


        return { vazioErros, tamanhoErros, tipoErros };
    };


    const editAutomovel = async (e) => {

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

            const verificacao = await AutomovelDataService.duplicidade({
                placa: formData.placa,
                renavam: formData.renavam,
                idAutomovelAtual: id
            });

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro);
                setMensagemErro(verificacao.data.mensagemErro);
                throw new Error(verificacao.data.mensagemErro);

            }

            const automovelData = new FormData();
            automovelData.append("ano_fabricacao", formData.ano_fabricacao);
            automovelData.append("ano_modelo", formData.ano_modelo);
            automovelData.append("cor", formData.cor);
            automovelData.append("combustivel", formData.combustivel);
            automovelData.append("km", formData.km);
            automovelData.append("origem", formData.origem);
            automovelData.append("placa", formData.placa);
            automovelData.append("renavam", formData.renavam);
            automovelData.append("valor", formData.valor);
            automovelData.append("marcaId", formData.marcaId);
            automovelData.append("modeloId", formData.modeloId);
            automovelData.append("file", formData.file);


            await AutomovelDataService.update(id, automovelData, {
                headers: { "Content-type": "multipart/form-data" }
            });

            setSucesso(true);
            setMensagemSucesso("Atualizações realizadas com sucesso!");
            setTimeout(() => navigate(`/detalhes/${id}`), 1500);

        } catch (error) {
            setErro(true);
            const mensagem = error.response?.data?.mensagemErro || error.message || "Erro ao atualizar automóvel.";
            setMensagemErro(mensagem);
        } finally {
            setIsSubmitting(false);
        }

    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

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


    return (
        <>
            <Header />

            <div className="container">

                <div className="mb-4 mt-3">
                    <div className="d-flex align-items-center">
                        <h1 className="fw-bold mb-0 me-2">Edição do Automóvel</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Edição de Automóvel"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta página é usada para editar as informações cadastrais de um veículo em estoque. Todas as características podem ser atualizadas.
                                    </p>
                                    <strong>Pontos Importantes:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Dados Gerais:</strong> Corrija informações como marca, modelo, ano, cor, placa, renavam e quilometragem.
                                        </li>
                                        <li className="mb-1">
                                            <strong>Valores e Origem:</strong> Atualize o "Valor de Venda" anunciado ou a origem do veículo (se foi cadastrado incorretamente).
                                        </li>
                                        <li>
                                            <strong>Foto:</strong> Você pode enviar uma nova foto para o automóvel a qualquer momento.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted">Preencha os dados abaixo para editar o automóvel selecionado.</p>
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

                <form onSubmit={editAutomovel} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <div className="form-card card mb-4">
                        <div className="card-header d-flex align-items-center">
                            <FaCar className="me-2" />
                            Informações Principais do Automóvel
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label htmlFor="marca" className="form-label">Marca <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder="Selecione uma marca..."
                                        options={marcasOptions}
                                        value={marcasOptions.find(option => option.value === formData.marcaId) || null}
                                        onChange={(option) => handleSelectChange(option, 'marcaId')}
                                        isClearable isSearchable
                                        styles={getCustomStyles("marca")}
                                    />
                                    {vazio.includes("marca") && <div className="form-text text-danger ms-1">Informe a marca.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="modelo" className="form-label">Modelo <span className="text-danger">*</span></label>
                                    <Select
                                        placeholder="Selecione um modelo..."
                                        options={modelosOptions}
                                        value={modelosOptions.find(option => option.value === formData.modeloId) || null}
                                        onChange={(option) => handleSelectChange(option, 'modeloId')}
                                        isDisabled={!formData.marcaId}
                                        isLoading={isModelosLoading}
                                        isClearable isSearchable
                                        styles={getCustomStyles("modelo")}
                                    />
                                    {vazio.includes("modelo") && <div className="form-text text-danger ms-1">Informe o modelo.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="cor" className="form-label">Cor <span className="text-danger">*</span></label>
                                    <input value={formData.cor ?? ""} type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChange} />
                                    {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
                                    {tipo.includes("cor") && <div className="invalid-feedback">Cor inválida.</div>}
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="anofabricacao" className="form-label">Ano Fabricação <span className="text-danger">*</span></label>
                                    <input value={formData.ano_fabricacao ?? ""} type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"} ${hasError("ano_modelo_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChange} />
                                    {vazio.includes("ano_fabricacao") && <div className="invalid-feedback">Informe o ano.</div>}
                                    {tipo.includes("ano_fabricacao") && <div className="invalid-feedback">Ano inválido.</div>}
                                    {tipo.includes("ano_modelo_fabricacao") && <div className="invalid-feedback ms-1">Ano de fabricação posterior a ano modelo.</div>}
                                </div>
                                <div className="col-md-3">
                                    <label htmlFor="anomodelo" className="form-label">Ano Modelo <span className="text-danger">*</span></label>
                                    <input value={formData.ano_modelo ?? ""} type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"} ${hasError("ano_modelo_futuro") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChange} />
                                    {vazio.includes("ano_modelo") && <div className="invalid-feedback">Informe o ano.</div>}
                                    {tipo.includes("ano_modelo") && <div className="invalid-feedback">Ano inválido.</div>}
                                    {tipo.includes("ano_modelo_futuro") && (<div className="invalid-feedback ms-1">Ano modelo inválido (não pode ser maior que {new Date().getFullYear() + 1}).</div>)}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="placa" className="form-label">Placa <span className="text-danger">*</span></label>
                                    <input value={formData.placa ?? ""} type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChange} />
                                    {vazio.includes("placa") && <div className="invalid-feedback">Informe a placa.</div>}
                                    {tamanho.includes("placa") && <div className="invalid-feedback">Placa inválida (deve ter 7 caracteres).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="renavam" className="form-label">Renavam <span className="text-danger">*</span></label>
                                    <input value={formData.renavam ?? ""} type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChange} />
                                    {vazio.includes("renavam") && <div className="invalid-feedback">Informe o Renavam.</div>}
                                    {tamanho.includes("renavam") && <div className="invalid-feedback">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="km" className="form-label">Quilometragem <span className="text-danger">*</span></label>
                                    <input value={formData.km ?? ""} type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChange} />
                                    {vazio.includes("km") && <div className="invalid-feedback">Informe a quilometragem.</div>}
                                    {tipo.includes("km") && <div className="invalid-feedback">Quilometragem inválida.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="combustivel" className="form-label">Combustível <span className="text-danger">*</span></label>
                                    <select value={formData.combustivel ?? ""} className={`form-select ${hasError("combustivel") && "is-invalid"}`} id="combustivel" name="combustivel" onChange={handleInputChange}>
                                        <option value="">Selecione...</option>
                                        <option value="Diesel">Diesel</option>
                                        <option value="Elétrico">Elétrico</option>
                                        <option value="Etanol">Etanol</option>
                                        <option value="Flex">Flex</option>
                                        <option value="Gasolina">Gasolina</option>
                                        <option value="Híbrido">Híbrido</option>
                                    </select>
                                    {vazio.includes("combustivel") && <div className="invalid-feedback">Informe o combustível.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="origem" className="form-label">Origem do Automóvel <span className="text-danger">*</span></label>
                                    <select value={formData.origem ?? ""} className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" onChange={handleInputChange}>
                                        <option value="">Selecione...</option>
                                        <option value="Compra">Compra</option>
                                        <option value="Consignacao">Consignação</option>
                                        <option value="Troca">Troca</option>
                                    </select>
                                    {vazio.includes("origem") && <div className="invalid-feedback">Informe a origem.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label htmlFor="valor" className="form-label">Valor de Venda (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat value={formData.valor ?? ""} placeholder="R$ 0,00" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor"
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
                                    <label htmlFor="foto" className="form-label">Foto do Automóvel</label>
                                    <input
                                        type="file"
                                        className={`form-control ${fileError ? 'is-invalid' : ''}`}
                                        id="foto"
                                        name="file"
                                        accept="image/png, image/jpeg"
                                        onChange={handleFileChange}
                                    />
                                    {fileError && <div className="invalid-feedback d-block">{fileError}</div>}
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
                </form >
            </div>
        </>
    );
}

export default EditarAutomovel;