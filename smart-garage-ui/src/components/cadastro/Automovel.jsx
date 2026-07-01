import Header from "../Header";
import { useState } from "react";
import AutomovelDataService from "../../services/automovelDataService";
import MarcaDataService from "../../services/marcaDataService";
import ModeloDataService from "../../services/modeloDataService";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useCallback } from "react";

const Automovel = () => {

    const location = useLocation();
    const clienteId = location.state?.clienteId;

    const [modeloNegocio, setModeloNegocio] = useState(null);

    useEffect(() => {

        const compra = localStorage.getItem("Compra");
        const consignacao = localStorage.getItem("Consignacao");
        const troca = localStorage.getItem("Troca");

        if (compra) {
            setModeloNegocio(JSON.parse(compra));
            localStorage.removeItem("Compra");
        }

        if (consignacao) {
            setModeloNegocio(JSON.parse(consignacao));
            localStorage.removeItem("Consignacao");
        }

        if (troca) {
            setModeloNegocio(JSON.parse(troca));
            localStorage.removeItem("Troca");
        }
    }, []);

    useEffect(() => {
        if (modeloNegocio?.negocio) {
            setAutomovel(prev => ({
                ...prev,
                origem: modeloNegocio.negocio
            }));
        }
    }, [modeloNegocio]);


    const initialAutomovelState = {
        id: null,
        ano_fabricacao: "",
        ano_modelo: "",
        ativo: false,
        cor: "",
        combustivel: "",
        km: "",
        origem: "",
        placa: "",
        renavam: "",
        valor: "",
        marcaId: "",
        imagem: ""
    };


    const initialMarcaState = {
        id: null,
        marca: ""
    };

    const initialModeloState = {
        id: null,
        modelo: "",
        marcaId: ""
    };

    const [automovel, setAutomovel] = useState(initialAutomovelState);

    const [modelo, setModelo] = useState(initialModeloState);

    const [marca, setMarca] = useState(initialMarcaState);


    // Handlers
    const handleInputChangeAutomovel = event => {
        const { name, value } = event.target;
        setAutomovel({ ...automovel, [name]: value });
    };

    const handleInputChangeModelo = event => {
        const { name, value } = event.target;
        setModelo({ ...modelo, [name]: value });
    };

    const handleInputChangeMarca = event => {
        const { name, value } = event.target;
        setMarca({ ...marca, [name]: value });
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
        if (!automovel.valor) vazioErros.push("valor");
        if (!automovel.ano_fabricacao) vazioErros.push("ano_fabricacao");
        if (!automovel.ano_modelo) vazioErros.push("ano_modelo");
        if (!automovel.renavam) vazioErros.push("renavam");
        if (!automovel.placa) vazioErros.push("placa");
        if (!automovel.origem) vazioErros.push("origem");
        if (!automovel.km) vazioErros.push("km");
        if (!automovel.combustivel) vazioErros.push("combustivel");
        if (!automovel.cor) vazioErros.push("cor");
        if (!modelo.modelo) vazioErros.push("modelo");
        if (!marca.marca) vazioErros.push("marca");

        // Tamanho
        if (automovel.renavam && (automovel.renavam.length !== 11 || isNaN(automovel.renavam))) tamanhoErros.push("renavam");
        if (automovel.placa && automovel.placa.length !== 7) tamanhoErros.push("placa");

        // Tipo
        if (automovel.ano_fabricacao && isNaN(automovel.ano_fabricacao)) tipoErros.push("ano_fabricacao");
        if (automovel.ano_modelo && isNaN(automovel.ano_modelo)) tipoErros.push("ano_modelo");
        if (automovel.valor && isNaN(automovel.valor)) tipoErros.push("valor");
        if (automovel.km && isNaN(automovel.km)) tipoErros.push("km");

        return { vazioErros, tamanhoErros, tipoErros };
    };


    const saveAutomovel = async (e) => {

        e.preventDefault();
        setErro(false);
        setSucesso(false);
        setVazio([]);
        setIsSubmitting(true);


        const { vazioErros, tamanhoErros, tipoErros } = validateFields();

        setVazio(vazioErros);
        setTamanho(tamanhoErros);
        setTipo(tipoErros);

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }

        // Verificação de duplicidade
        try {
            const verificacao = await AutomovelDataService.duplicidade({
                placa: automovel.placa,
                renavam: automovel.renavam
            })

            if (verificacao.data.erro) {
                setErro(verificacao.data.erro);
                setMensagemErro(verificacao.data.mensagemErro);
                return;
            }

        } catch (erro) {

            console.error("Erro na verificação de duplicidade:", erro);

            setErro(erro.response.data.erro);
            setMensagemErro(erro.response.data.mensagemErro);
            return;
        } finally {
            setIsSubmitting(false);
        }

        var dataMarca = {
            nome: marca.marca
        }

        const marcaResp = await MarcaDataService.create(dataMarca)
            .catch(e => {
                console.error("Erro ao criar marca:", e);
            });

        setMarca(marcaResp.data);

        var dataModelo = {
            nome: modelo.modelo,
            marcaId: marcaResp?.data.id
        }

        const formData = new FormData();

        formData.append("ano_fabricacao", automovel.ano_fabricacao);
        formData.append("ano_modelo", automovel.ano_modelo);
        formData.append("ativo", automovel.ativo);
        formData.append("cor", automovel.cor);
        formData.append("combustivel", automovel.combustivel);
        formData.append("km", automovel.km);
        formData.append("origem", automovel.origem);
        formData.append("placa", automovel.placa);
        formData.append("renavam", automovel.renavam);
        formData.append("valor", automovel.valor);
        formData.append("marcaId", marcaResp?.data.id);
        formData.append("file", automovel.file);

        const modeloResp = await ModeloDataService.create(dataModelo)
            .catch(e => {
                console.error("Erro ao criar marca:", e);
            });

        setModelo(modeloResp.data);

        const automovelResp = await AutomovelDataService.create(formData, {
            headers: { "Content-type": "multipart/form-data" }
        })
            .catch(e => {
                console.error("Erro ao cadastrar automovel:", e.response?.data || e.message);
            });

        setSucesso(true);
        setMensagemSucesso("Automóvel cadastrado com sucesso!");


        if (automovel.origem === "Compra" && automovelResp?.data?.id) {
            setTimeout(() => {
                navigate('/compra', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }


        if (automovel.origem === "Consignacao") {
            setTimeout(() => {
                navigate('/consignacao', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }

        if (automovel.origem === "Troca") {
            setTimeout(() => {
                navigate('/troca', { state: { automovelId: automovelResp.data.id, clienteId: clienteId } });
            }, 1500);
        }
    }

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

    return (
        <>
            <Header />
            <div className="container py-5">

                <div className="mb-4">
                    <h1 className="fw-bold">Cadastro de Automóvel</h1>
                    <p className="text-muted">Preencha os dados abaixo para registrar um novo automóvel no sistema.</p>
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


                <form onSubmit={saveAutomovel} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Informações Principais</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="marca" className="form-label">Marca <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("marca") && "is-invalid"}`} id="marca" name="marca" onChange={handleInputChangeMarca} />
                                {vazio.includes("marca") && <div className="invalid-feedback">Informe a marca.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="modelo" className="form-label">Modelo <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("modelo") && "is-invalid"}`} id="modelo" name="modelo" onChange={handleInputChangeModelo} />
                                {vazio.includes("modelo") && <div className="invalid-feedback">Informe o modelo.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="cor" className="form-label">Cor <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("cor") && "is-invalid"}`} id="cor" name="cor" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("cor") && <div className="invalid-feedback">Informe a cor.</div>}
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="anofabricacao" className="form-label">Ano Fabricação <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("ano_fabricacao") && "is-invalid"}`} id="anofabricacao" name="ano_fabricacao" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("ano_fabricacao") && <div className="invalid-feedback">Informe o ano.</div>}
                                {tipo.includes("ano_fabricacao") && <div className="invalid-feedback">Ano inválido.</div>}
                            </div>
                            <div className="col-md-3">
                                <label htmlFor="anomodelo" className="form-label">Ano Modelo <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("ano_modelo") && "is-invalid"}`} id="anomodelo" name="ano_modelo" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("ano_modelo") && <div className="invalid-feedback">Informe o ano.</div>}
                                {tipo.includes("ano_modelo") && <div className="invalid-feedback">Ano inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="foto" className="form-label">Foto do Automóvel</label>
                                <input
                                    type="file"
                                    className="form-control"
                                    id="foto"
                                    name="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setAutomovel({ ...automovel, file });
                                        }
                                    }}
                                />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Documentação e Valores</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="placa" className="form-label">Placa <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("placa") && <div className="invalid-feedback">Informe a placa.</div>}
                                {tamanho.includes("placa") && <div className="invalid-feedback">Placa inválida (deve ter 7 caracteres).</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="renavam" className="form-label">Renavam <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("renavam") && "is-invalid"}`} id="renavam" name="renavam" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("renavam") && <div className="invalid-feedback">Informe o Renavam.</div>}
                                {tamanho.includes("renavam") && <div className="invalid-feedback">Renavam inválido (deve ter 11 dígitos numéricos).</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="valor" className="form-label">Valor (R$) <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("valor") && <div className="invalid-feedback">Informe o valor.</div>}
                                {tipo.includes("valor") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>
                        </div>
                    </fieldset>

                    <fieldset className="mb-5">
                        <legend className="h5 fw-bold mb-3 border-bottom pb-2">Detalhes Adicionais</legend>
                        <div className="row g-3">
                            <div className="col-md-4">
                                <label htmlFor="km" className="form-label">Quilometragem <span className="text-danger">*</span></label>
                                <input type="text" className={`form-control ${hasError("km") && "is-invalid"}`} id="km" name="km" onChange={handleInputChangeAutomovel} />
                                {vazio.includes("km") && <div className="invalid-feedback">Informe a quilometragem.</div>}
                                {tipo.includes("km") && <div className="invalid-feedback">Valor inválido.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="combustivel" className="form-label">Combustível <span className="text-danger">*</span></label>
                                <select className={`form-select ${hasError("combustivel") && "is-invalid"}`} id="combustivel" name="combustivel" onChange={handleInputChangeAutomovel}>
                                    <option value="">Selecione...</option>
                                    <option value="Diesel">Diesel</option>
                                    <option value="Etanol">Etanol</option>
                                    <option value="Elétrico">Elétrico</option>
                                    <option value="Flex">Flex</option>
                                    <option value="Gasolina">Gasolina</option>
                                    <option value="Híbrido">Híbrido</option>
                                </select>
                                {vazio.includes("combustivel") && <div className="invalid-feedback">Informe o combustível.</div>}
                            </div>
                            <div className="col-md-4">
                                <label htmlFor="origem" className="form-label">Origem do Automóvel <span className="text-danger">*</span></label>
                                <select className={`form-select ${hasError("origem") && "is-invalid"}`} id="origem" name="origem" value={automovel.origem} onChange={handleInputChangeAutomovel}>
                                    <option value="">Selecione...</option>
                                    <option value="Compra">Compra</option>
                                    <option value="Consignacao">Consignação</option>
                                    <option value="Troca">Troca</option>
                                </select>
                                {vazio.includes("origem") && <div className="invalid-feedback">Informe a origem.</div>}
                            </div>
                        </div>
                    </fieldset>

                    <div className="d-flex justify-content-end">
                        <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    Salvando..
                                </>
                            ) : (
                                "Cadastrar Automóvel"
                            )}
                        </button>
                    </div>
                </form >
            </div >
        </>
    );

}

export default Automovel;