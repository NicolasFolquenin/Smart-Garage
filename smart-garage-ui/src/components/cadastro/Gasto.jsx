import { useState, useEffect } from "react";
import Header from "../Header";
import Select from "react-select";
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useNavigate } from "react-router-dom";
import AutomovelDataService from "../../services/automovelDataService";
import ModeloDataService from "../../services/modeloDataService";
import MarcaDataService from "../../services/marcaDataService";
import GastoDataService from "../../services/gastoDataService";
import { FaCar, FaRegIdCard, FaCalendarAlt, FaFileSignature } from "react-icons/fa";
import HelpPopover from '../HelpPopover';
import { NumericFormat } from 'react-number-format';

const Gasto = () => {

    const [automovel, setAutomovel] = useState([]);
    const [modelo, setModelo] = useState([]);
    const [marca, setMarca] = useState([]);

    useEffect(() => {
        setLoading(true);
        const timeout = setTimeout(() => setLoading(false), 8000);
        Promise.all([
            AutomovelDataService.getByAtivo(),
            ModeloDataService.getAll(),
            MarcaDataService.getAll()
        ]).then(([automoveis, modelos, marcas]) => {
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



    const [placa, setPlaca] = useState("");

    const navigate = useNavigate();

    const initialGastoState = {
        id: null,
        data: new Date(),
        descricao: "",
        valor: "",
        automovelId: ""
    };

    const [gasto, setGasto] = useState(initialGastoState);


    const handleInputChangeGasto = event => {
        const { name, value } = event.target;
        setGasto({ ...gasto, [name]: value });
    }

    const handleInputChangePlaca = event => {
        const { value } = event.target;
        setPlaca(value.toUpperCase());
    }

    const [loading, setLoading] = useState(true);

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
        if (!gasto.valor) vazioErros.push("valor");
        if (!gasto.data) vazioErros.push("data");
        if (!gasto.automovelId) vazioErros.push("automovelId");

        // Tipo
        if (gasto.data && gasto.data > new Date()) tipoErros.push("data");
        if (gasto.valor && (isNaN(gasto.valor) || gasto.valor <= 0)) tipoErros.push("valor");

        return { vazioErros, tamanhoErros, tipoErros };
    };

    const hasError = (field) => vazio.includes(field) || tamanho.includes(field) || tipo.includes(field);

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
                    <span>Placa: {label.placa}</span>
                    <span className="mx-2">|</span>
                    <FaCalendarAlt className="me-1" />
                    <span>Ano: {label.ano}</span>
                </div>
            </div>
        </div>
    );


    const buscarAutomovel = async (e) => {

        e.preventDefault();
        setErro(false);
        setMensagemErro('');

        if (!placa || placa.trim() === "") {
            setErro(true);
            setMensagemErro("Informe a placa para busca.");
            return;
        }

        if (placa.length !== 7) {
            setErro(true);
            setMensagemErro("Placa inválida.");
            return;
        }

        try {

            const autoResp = await AutomovelDataService.getByPlaca(placa)

            if (autoResp.data.erro) {
                setErro(autoResp.data.erro);
                setMensagemErro(autoResp.data.mensagemErro);
                throw new Error(autoResp.data.mensagemErro);

            }

            if (autoResp && autoResp.data) {

                setGasto(prev => ({
                    ...prev,
                    automovelId: autoResp?.data.id || ""
                }));

            }

        } catch (error) {
            console.error("Erro no processo de busca pelo automovel:", error);
            setErro(true);
            const mensagem = error.response?.data?.mensagemErro || error.message || "Ocorreu um erro inesperado.";
            setMensagemErro(mensagem);
        }
    }

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


    const saveGasto = async (e) => {

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

        // Só continua se não houver erros
        if (vazioErros.length > 0 || tamanhoErros.length > 0 || tipoErros.length > 0) {
            setIsSubmitting(false);
            return;
        }


        try {

            var dataGasto = {
                data: gasto.data,
                valor: gasto.valor,
                descricao: gasto.descricao,
                automovelId: gasto.automovelId,
            }

            const gastoResp = await GastoDataService.create(dataGasto)
                .catch(e => {
                    console.error("Erro ao registrar gasto:", e);
                });

            setGasto(gastoResp.data);

            setSucesso(true);
            setMensagemSucesso("Registro de gasto realizado com sucesso!");

            setTimeout(() => {
                navigate('/listagem/gastos');
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
                        <h1 className="fw-bold mb-0 me-2">Registro de Gastos</h1>
                        <HelpPopover
                            id="page-help-popover"
                            title="Ajuda: Registro de Gastos"
                            content={
                                <>
                                    <p style={{ textAlign: "justify" }}>
                                        Esta página é usada para registrar despesas gerais da garagem ou custos específicos associados a um automóvel que já está no estoque.
                                    </p>
                                    <strong>Fluxo de Trabalho:</strong>
                                    <ol className="mt-1" style={{ textAlign: "justify" }}>
                                        <li className="mb-1">
                                            <strong>Busca (Opcional):</strong> Use o campo "Renavam" para encontrar o automóvel desejado. O sistema preencherá o campo 'Automóvel' na seção de detalhes automaticamente.
                                        </li>
                                        <li>
                                            <strong>Detalhes do Gasto:</strong> Preencha o valor, a data e uma descrição para o gasto. Se você não usou a busca, pode selecionar o automóvel manualmente na lista.
                                        </li>
                                    </ol>
                                </>
                            }
                        />
                    </div>
                    <p className="text-muted mt-3">Preencha os dados abaixo para registrar um novo gasto.</p>
                </div>

                <p className="text-muted small mb-4">
                    Campos com <span className="text-danger">*</span> são de preenchimento obrigatório.
                </p>


                {sucesso && (
                    <div className="alert alert-success d-flex align-items-center" role="alert">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        <div>{mensagemSucesso}</div>
                    </div>
                )}

                <form className={`mb-4 col-md-6 ${sucesso ? "d-none" : ""}`}>
                    <legend className="h5 fw-bold mb-3 border-bottom pb-2">Busca pelo Automóvel</legend>
                    <div className="row">
                        <div className="col-md-8">
                            <label for="valor" class="form-label">Placa</label>
                            <input type="text" className={`form-control ${hasError("placa") && "is-invalid"}`} id="placa" name="placa" aria-describedby="placaHelp" onChange={handleInputChangePlaca} value={placa} />
                        </div>
                        <div className="col-md-4 d-flex align-items-end">
                            <button
                                type="button"
                                className="btn btn-primary w-50"
                                onClick={buscarAutomovel}
                            >
                                Buscar
                            </button>
                        </div>
                        {erro && (
                            <div className="d-flex align-items-center col-md-6 mt-1 mb-0" role="alert">
                                <i className="bi text-danger bi-exclamation-triangle-fill me-2"></i>
                                <div class="form-text text-danger">{mensagemErro}</div>
                            </div>
                        )}

                    </div>
                </form>

                <form onSubmit={saveGasto} encType="multipart/form-data" className={sucesso ? "d-none" : ""}>


                    <div className="card mb-4 form-card">
                        <div className="card-header d-flex align-items-center">
                            <FaFileSignature className="me-2" />
                            Detalhes do Gasto
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                <div className="col-md-4">
                                    <label for="valor" class="form-label">Valor do Gasto (R$) <span className="text-danger">*</span></label>
                                    <NumericFormat className={`form-control ${hasError("valor") && "is-invalid"}`} id="valor" name="valor" placeholder="R$ 0,00" value={gasto.valor}
                                        onValueChange={(values) => {
                                            const syntheticEvent = {
                                                target: {
                                                    name: "valor",
                                                    value: values.value
                                                }
                                            };
                                            handleInputChangeGasto(syntheticEvent);
                                        }}

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
                                    <label for="data" class="form-label">Data <span className="text-danger">*</span></label><br />
                                    <DatePicker
                                        style={{ width: "100%;" }}
                                        className={`form-control ${hasError("data") && "is-invalid"}`}
                                        calendarClassName="custom-datepicker-container"
                                        type="text"
                                        aria-describedby="dataHelp"
                                        id="data"
                                        name="data"
                                        selected={gasto.data}
                                        onChange={(date) => setGasto({ ...gasto, data: date })}
                                        dateFormat="dd/MM/yyyy"
                                    />
                                    {vazio.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Informe a data.</div>}
                                    {tipo.includes("data") && <div id="dataHelp" class="form-text text-danger ms-1">Data inválida.</div>}
                                </div>
                                <div className="col-md-4">
                                    <label for="automovel" class="form-label">Automóvel <span className="text-danger">*</span></label>
                                    <Select formatOptionLabel={formatOptionLabel}
                                        styles={getCustomStyles("automovelId")} isSearchable={true} className={`${hasError("automovelId") && "is-invalid"}`} id="automovel" name="automovel" placeholder="Selecione o automovel" options={optionsAutomovel} onChange={(option) => setGasto({ ...gasto, automovelId: option ? option.value : "" })} value={optionsAutomovel.find(option => option.value === gasto.automovelId) || null} isClearable={true}
                                        filterOption={(option, inputValue) => {
                                            const label = option.label;
                                            const texto = [
                                                label.marca,
                                                label.modelo,
                                                label.renavam,
                                                label.placa
                                            ].filter(Boolean).join(" ").toLowerCase();
                                            return texto.includes(inputValue.toLowerCase());
                                        }}>
                                    </Select>
                                    {vazio.includes("automovelId") && <div id="valorHelp" class="form-text text-danger ms-1">Informe o automóvel.</div>}
                                </div>
                                <div className="col-md-8">
                                    <label for="descricao" class="form-label">Descrição</label>
                                    <textarea type="text" placeholder="Detalhes do serviço, peças trocadas, etc." className={`form-control ${hasError("descricao") && "is-invalid"}`} id="descricao" name="descricao" aria-describedby="descricaoHelp" onChange={handleInputChangeGasto} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="d-flex justify-content-end pb-3">
                        <button type="button" className="btn btn-outline-secondary d-flex align-items-center btn-lg px-4 me-3" onClick={() => navigate(-1)}>
                            Voltar
                        </button>
                        <button type="submit" className="btn btn-primary btn-lg px4" disabled={isSubmitting}>
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

export default Gasto;