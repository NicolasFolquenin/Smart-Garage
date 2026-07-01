import { useState, useEffect, useCallback } from 'react';
import Header from '../components/Header';
import ComissaoDataService from '../services/comissaoDataService';
import { Form, Button, Card, Alert, Spinner, InputGroup } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import HelpPopover from './HelpPopover';
import { NumericFormat } from 'react-number-format';

const GerenciarComissoes = () => {
    const [regras, setRegras] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [feedback, setFeedback] = useState({ tipo: '', msg: '' });
    const navigate = useNavigate();

    const fetchData = useCallback(() => {
        setLoading(true);
        ComissaoDataService.getAll()
            .then(response => {
                if (response.data && response.data.length > 0) {
                    setRegras(response.data);
                } else {
                    const regrasPadrao = [
                        { id: `temp-0`, valor_minimo: 0, valor_maximo: 49999.99, valor_comissao: '' },
                        { id: `temp-1`, valor_minimo: 50000, valor_maximo: 100000, valor_comissao: '' },
                        { id: `temp-2`, valor_minimo: 100000.01, valor_maximo: null, valor_comissao: '' },
                    ];
                    setRegras(regrasPadrao);
                }
            })
            .catch((e) => {
                console.error("Erro detalhado da API:", e);
                setFeedback({ tipo: 'danger', msg: 'Erro ao carregar as regras.' });
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleInputChange = (index, field) => (e) => {
        const novasRegras = [...regras];
        let valorInput = e.target.value;

        if (field === 'valor_minimo' || field === 'valor_maximo' || field === 'valor_comissao') {
            const valorNumerico = parseFloat(valorInput);
            if (!isNaN(valorNumerico) && valorNumerico < 0) {
                valorInput = '0';
            }
        }

        // Atualiza o valor do campo que foi modificado
        novasRegras[index][field] = valorInput === '' && field === 'valor_maximo' ? null : valorInput;

        // Se o campo alterado foi um 'valor_maximo' e não é a última faixa
        if (field === 'valor_maximo' && index < novasRegras.length - 1) {
            const valorMaximoNumerico = parseFloat(valorInput);

            if (!isNaN(valorMaximoNumerico) && valorMaximoNumerico >= 0) {
                // Calcula o novo valor mínimo para a próxima faixa e formata com 2 casas decimais
                novasRegras[index + 1].valor_minimo = (valorMaximoNumerico + 0.01).toFixed(2);
            }
        }

        setRegras(novasRegras);
    };

    const handleAdicionarFaixa = () => {
        if (regras.length === 0) return;

        const ultimaRegra = regras[regras.length - 1];
        const valorMaximoAnterior = parseFloat(ultimaRegra.valor_maximo);

        if (isNaN(valorMaximoAnterior)) {
            setFeedback({ tipo: 'warning', msg: 'Defina um valor máximo para a penúltima faixa antes de adicionar uma nova.' });
            return;
        }

        if (valorMaximoAnterior < 0) {
            setFeedback({ tipo: 'warning', msg: 'O valor máximo não pode ser negativo.' });
            return;
        }

        // Lógica de +0.01 aplicada aqui também
        const novoValorMinimo = (valorMaximoAnterior + 0.01).toFixed(2);

        const regrasAtualizadas = [...regras];
        regrasAtualizadas[regras.length - 1].valor_maximo = valorMaximoAnterior;

        setRegras([
            ...regras,
            { id: `temp-${regras.length}`, valor_minimo: novoValorMinimo, valor_maximo: null, valor_comissao: '' }
        ]);
    };

    const handleRemoverFaixa = (indexParaRemover) => {
        if (regras.length <= 1) return;
        const novasRegras = regras.filter((_, index) => index !== indexParaRemover);
        if (novasRegras.length > 0) {
            novasRegras[novasRegras.length - 1].valor_maximo = null;
        }
        setRegras(novasRegras);
    };

    const handleSave = async () => {
        setIsSaving(true);
        setFeedback({ tipo: '', msg: '' });

        for (const regra of regras) {
            const min = parseFloat(regra.valor_minimo);
            const max = parseFloat(regra.valor_maximo);
            const comissao = parseFloat(regra.valor_comissao);

            if ((!isNaN(min) && min < 0) ||
                (regra.valor_maximo !== null && !isNaN(max) && max < 0) ||
                (!isNaN(comissao) && comissao < 0)) {
                setFeedback({ tipo: 'danger', msg: 'Valores não podem ser negativos. Verifique os campos.' });
                setIsSaving(false);
                return;
            }

            if (regra.valor_maximo !== null && !isNaN(min) && !isNaN(max) && max <= min) {
                setFeedback({ tipo: 'danger', msg: `O valor "Até R$" (${max}) deve ser maior que o valor "De R$" (${min}).` });
                setIsSaving(false);
                return;
            }
        }

        try {
            const regrasParaSalvar = regras.map(regra => ({
                valor_minimo: regra.valor_minimo,
                valor_maximo: regra.valor_maximo,
                valor_comissao: regra.valor_comissao
            }));
            await ComissaoDataService.updateAll(regrasParaSalvar);
            setFeedback({ tipo: 'success', msg: 'Regras de comissão salvas com sucesso!' });
        } catch (error) {
            setFeedback({ tipo: 'danger', msg: 'Erro ao salvar as regras. Verifique os valores.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <Header />
            <div className="container mt-4">
                <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
                    <div>
                        <div className="d-flex align-items-center">
                            <h1 className="fw-bold mb-0 me-2">Gerenciar Comissões</h1>
                            <HelpPopover
                                id="page-help-popover"
                                title="Ajuda: Gerenciar Comissões"
                                content={
                                    <>
                                        <p style={{ textAlign: "justify" }}>
                                            Nesta tela, você define as regras que o sistema usará para calcular automaticamente a comissão dos vendedores em cada Venda ou Troca.
                                        </p>
                                        <strong>Funcionamento:</strong>
                                        <ul className="mt-1" style={{ textAlign: "justify" }}>
                                            <li className="mb-1">
                                                <strong>Faixas de Valor:</strong> As comissões são baseadas em faixas de valor de venda. Cada linha representa uma faixa.
                                            </li>
                                            <li className="mb-1">
                                                <strong>Definição de Limites:</strong> O valor "De R$" de uma faixa é sempre o final da faixa anterior. Você só precisa definir o valor "Até R$". A última faixa sempre terá o valor máximo em branco, significando "acima".
                                            </li>
                                            <li>
                                                <strong>Adicionar/Remover:</strong> Use os botões para criar novas faixas de comissão ou remover as existentes.
                                            </li>
                                        </ul>
                                        <small className="d-block mt-3 text-muted">Lembre-se de clicar em "Salvar Alterações" para que as novas regras entrem em vigor.</small>
                                    </>
                                }
                            />
                        </div>
                        <p className="text-muted">Defina as faixas de valor e as comissões correspondentes para vendas e trocas.</p>
                    </div>
                    <button className="btn btn-outline-secondary d-flex align-items-center" onClick={() => navigate('/home')}>
                        <i className="bi bi-arrow-left me-2"></i>
                        Voltar
                    </button>
                </div>

                {feedback.msg && <Alert variant={feedback.tipo}>{feedback.msg}</Alert>}

                <Card className="form-card">
                    <Card.Header as="h5">Regras de Comissão</Card.Header>
                    <Card.Body>
                        {loading ? <Spinner animation="border" /> : (
                            regras.map((regra, index) => (
                                <InputGroup className="mb-3" key={regra.id || `temp-key-${index}`}>
                                    <InputGroup.Text>De R$</InputGroup.Text>
                                    <NumericFormat
                                        customInput={Form.Control}
                                        value={regra.valor_minimo}
                                        onValueChange={(values) => {
                                            const syntheticEvent = { target: { value: values.value } };
                                            handleInputChange(index, 'valor_minimo')(syntheticEvent);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                        readOnly={index > 0}
                                    />
                                    <InputGroup.Text>Até R$</InputGroup.Text>
                                    <NumericFormat
                                        customInput={Form.Control}
                                        placeholder="acima"
                                        value={regra.valor_maximo === null ? '' : regra.valor_maximo}
                                        onValueChange={(values) => {
                                            const syntheticEvent = { target: { value: values.value } };
                                            handleInputChange(index, 'valor_maximo')(syntheticEvent);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    // disabled={index === regras.length - 1 && regras.length > 2}
                                    />
                                    <InputGroup.Text>Comissão de R$</InputGroup.Text>
                                    <NumericFormat
                                        customInput={Form.Control}
                                        placeholder="0,00"
                                        value={regra.valor_comissao}
                                        onValueChange={(values) => {
                                            const syntheticEvent = { target: { value: values.value } };
                                            handleInputChange(index, 'valor_comissao')(syntheticEvent);
                                        }}
                                        thousandSeparator="."
                                        decimalSeparator=","
                                        decimalScale={2}
                                        fixedDecimalScale={true}
                                        allowNegative={false}
                                    />
                                    <Button
                                        variant="outline-danger"
                                        onClick={() => handleRemoverFaixa(index)}
                                        disabled={regras.length <= 1}
                                    >
                                        <i className="bi bi-trash-fill"></i>
                                    </Button>
                                </InputGroup>
                            ))
                        )}
                        <Button variant="outline-primary" onClick={handleAdicionarFaixa}>
                            <i className="bi bi-plus-lg me-2"></i>
                            Adicionar Valores
                        </Button>
                    </Card.Body>
                    <Card.Footer className="text-end">
                        <Button onClick={handleSave} disabled={isSaving || loading}>
                            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                        </Button>
                    </Card.Footer>
                </Card>
            </div>
        </>
    );
};

export default GerenciarComissoes;