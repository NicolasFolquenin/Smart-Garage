import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const processarDadosTemporais = (dados, tipo, periodo) => {
    const dateKey = tipo === 'Consignacao' ? 'data_inicio' : 'data';

    let formatKey, formatLabel;
    switch (periodo) {
        case 'ultimos_3_meses':
            formatKey = 'yyyy-ww'; // Agrupa por Ano-Semana (ex: 2025-37)
            formatLabel = (date) => `Semana ${format(date, 'ww')}`;
            break;
        case 'ultimo_semestre':
            formatKey = 'yyyy-MM'; // Agrupa por Ano-Mês (ex: 2025-09)
            formatLabel = (date) => format(date, 'MMM/yy');
            break;
        case 'ultimo_mes':
        default:
            formatKey = 'yyyy-MM-dd'; // Agrupa por Ano-Mês-Dia
            formatLabel = (date) => format(date, 'dd/MM');
            break;
    }

    const dadosAgrupados = dados.reduce((acc, item) => {
        const dataDoItem = item[dateKey];
        if (!dataDoItem) return acc;

        const chave = format(new Date(dataDoItem), formatKey);
        if (!acc[chave]) acc[chave] = 0;
        acc[chave] += parseFloat(item.valor || 0);
        return acc;
    }, {});

    const labelsOrdenados = Object.keys(dadosAgrupados).sort();

    return {
        labels: labelsOrdenados.map(chave => {

            if (periodo === 'ultimos_3_meses') {
                const [ano, semana] = chave.split('-');

                const dataDaSemana = new Date(ano, 0, 1 + (semana - 1) * 7);
                return formatLabel(dataDaSemana);
            }
            return formatLabel(new Date(chave));
        }),
        datasets: [{
            label: `Valor de ${tipo} por ${periodo === 'ultimo_mes' ? 'Dia' : periodo === 'ultimos_3_meses' ? 'Semana' : 'Mês'}`,
            data: labelsOrdenados.map(chave => dadosAgrupados[chave]),
            backgroundColor: 'rgba(13, 110, 253, 0.6)',
        }]
    };
};

const processarDadosPorCategoria = (dados, tipo) => {
    const dadosAgrupados = dados.reduce((acc, item) => {

        const categoria = getCategoriaFromDescricao(item.descricao);

        if (!acc[categoria]) acc[categoria] = 0;
        acc[categoria] += parseFloat(item.valor || 0);
        return acc;
    }, {});
    return {
        labels: Object.keys(dadosAgrupados),
        datasets: [{
            label: `Distribuição de ${tipo}`,
            data: Object.values(dadosAgrupados),
            backgroundColor: ['#0d6efd', '#6c757d', '#6f42c1', '#1b4965ff', '#bd773eff', '#0d7d49ff', '#aa8106ff'],
        }]
    };
};

const processarTrocasPorResultado = (dados) => {
    const resultados = dados.reduce((acc, item) => {
        const valor = parseFloat(item.valor || 0);
        if (valor > 0) acc['Saldo Positivo'] += 1;
        else if (valor < 0) acc['Saldo Negativo'] += 1;
        else acc['Saldo Zero'] += 1;
        return acc;
    }, { 'Saldo Positivo': 0, 'Saldo Negativo': 0, 'Saldo Zero': 0 });
    return {
        labels: Object.keys(resultados),
        datasets: [{
            label: 'Resultado das Trocas',
            data: Object.values(resultados),
            backgroundColor: ['#198754', '#dc3545', '#6c757d'],
        }]
    };
};

const getCategoriaFromDescricao = (descricao) => {
    if (!descricao) return 'Não especificado';

    const desc = descricao.toLowerCase();

    if (desc.includes('óleo') || desc.includes('filtro')) return 'Troca de Óleo e Filtros';
    if (desc.includes('pneu') || desc.includes('roda') || desc.includes('alinhamento') || desc.includes('balanceamento')) return 'Pneus e Rodas';
    if (desc.includes('imposto') || desc.includes('ipva') || desc.includes('documento') || desc.includes('licenciamento')) return 'Documentação e Impostos';
    if (desc.includes('estética') || desc.includes('lavagem') || desc.includes('polimento') || desc.includes('limpeza')) return 'Estética e Limpeza';
    if (desc.includes('bateria') || desc.includes('elétrica')) return 'Parte Elétrica';
    if (desc.includes('freio') || desc.includes('pastilha')) return 'Sistema de Freios';
    if (desc.includes('marketing') || desc.includes('anúncio') || desc.includes('plataforma')) return 'Marketing e Vendas';

    return 'Outros';
};

const processarComprasPorMarca = (dados, todasAsMarcas) => {
    const dadosAgrupados = dados.reduce((acc, compra) => {

        const marcaDoAutomovel = todasAsMarcas.find(m => m.id === compra.automovel?.marcaId);
        const marcaNome = marcaDoAutomovel?.nome || 'Marca Desconhecida';

        if (!acc[marcaNome]) {
            acc[marcaNome] = 0;
        }

        acc[marcaNome] += parseFloat(compra.valor || 0);
        return acc;
    }, {});

    return {
        labels: Object.keys(dadosAgrupados),
        datasets: [{
            label: 'Valor de Compra',
            data: Object.values(dadosAgrupados),
            backgroundColor: ['#0d6efd', '#6c757d', '#6f42c1', '#1b4965ff', '#bd773eff', '#0d7d49ff', '#aa8106ff', '#0a9cb9ff'],
        }]
    };
};



const GraficoRelatorio = ({ dados, tipo, marcas, periodo }) => {
    if (!dados || dados.length === 0) {
        return <p className="text-center text-muted">Não há dados suficientes para gerar um gráfico.</p>;
    }

    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    padding: 20
                }
            },
            title: {
                display: true,
            }
        }
    };

    switch (tipo) {
        case 'Venda':
        case 'Consignacao':
            const dadosGraficoBarra = processarDadosTemporais(dados, tipo, periodo);
            const barOptions = {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        ...commonOptions.plugins.title,
                        text: `Evolução de ${tipo}s no Período`
                    }
                }
            };
            return <Bar data={dadosGraficoBarra} options={barOptions} />;

        case 'Gasto':
        case 'Manutencao':
        case 'Troca':
            const dadosGraficoPizza = tipo === 'Troca' ? processarTrocasPorResultado(dados) : processarDadosPorCategoria(dados, tipo);
            const pieOptions = {
                ...commonOptions,
                plugins: {
                    ...commonOptions.plugins,
                    title: {
                        ...commonOptions.plugins.title,
                        text: tipo === 'Troca' ? 'Proporção de Resultados das Trocas' : `Distribuição de ${tipo}s por Categoria` // Título dinâmico
                    }
                }
            };

            return <Pie
                data={dadosGraficoPizza}
                options={pieOptions}
            />;

        case 'Compra':
            const dadosGraficoPizzaCompra = processarComprasPorMarca(dados, marcas);
            return <Pie
                data={dadosGraficoPizzaCompra}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top' },
                        title: {
                            display: true,
                            text: `Distribuição de Compras por Marca`
                        }
                    }
                }}
            />;

        default:
            return <p className="text-center text-muted">Visualização não disponível para este tipo de relatório.</p>;
    }
};

export default GraficoRelatorio;