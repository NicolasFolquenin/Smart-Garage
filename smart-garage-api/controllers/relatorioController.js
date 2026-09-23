const Entidade = require('../models/index');
const { Op } = require("sequelize");

exports.gerarRelatorio = async (req, res) => {
    const { tipo, dataInicio, dataFim } = req.query;

    if (tipo === 'Venda') {
        try {
            const dtInicio = dataInicio ? new Date(dataInicio) : new Date(0);
            const dtFim = dataFim ? new Date(dataFim) : new Date();

            const vendas = await Entidade.Venda.findAll({
                where: { data: { [Op.between]: [dtInicio, dtFim] } },
                include: [
                    { model: Entidade.Automovel, as: 'automovel', required: false },
                    { model: Entidade.Cliente, as: 'cliente', required: false },
                    { model: Entidade.PagamentoVenda, as: 'pagamento_vendas', required: false }
                ],
                order: [['data', 'DESC']]
            });

            const relatorioEnriquecido = [];

            for (const venda of vendas) {
                let custo = 0;
                let lucro = 0;
                let comissao = parseFloat(venda.comissao || 0);
                const origem = venda.automovel?.origem || venda.origem_automovel;
                const autoId = venda.automovelId || venda.automovel?.id;

                if (autoId) {
                    if (origem === 'Compra') {
                        const compra = await Entidade.Compra.findOne({ where: { automovelId: autoId } });
                        custo = parseFloat(compra?.valor || venda.automovel?.custo_aquisicao || 0);
                    } else if (origem === 'Troca') {
                        const troca = await Entidade.Troca.findOne({
                            where: {
                                [Op.or]: [
                                    { automovelId: autoId },
                                    { automovel_fornecido: autoId }
                                ]
                            }
                        });
                        custo = parseFloat(troca?.valor_aquisicao || venda.automovel?.custo_aquisicao || 0);
                    } else if (origem === 'Consignacao') {
                        const consignacao = await Entidade.Consignacao.findOne({ where: { automovelId: autoId } });
                        custo = parseFloat(consignacao?.valor || 0);
                    } else {
                        custo = parseFloat(venda.automovel?.custo_aquisicao || 0);
                    }
                } else {
                    custo = parseFloat(venda.automovel?.custo_aquisicao || 0);
                }

                lucro = parseFloat(venda.valor || 0) - custo - comissao;

                relatorioEnriquecido.push({
                    ...venda.toJSON(),
                    custo,
                    lucro,
                    origem
                });
            }

            return res.status(200).send(relatorioEnriquecido);

        } catch (error) {
            console.error("Erro detalhado ao gerar relatório de vendas:", error);
            return res.status(500).send({ mensagem: "Erro ao gerar relatório de vendas.", error: error.message });
        }
    }

    let EntidadeSelecionada;
    let includeOptions = [];
    let dateColumnName;


    if (tipo === 'BalancoGeral') {
        try {
            const dtInicio = dataInicio ? new Date(dataInicio) : new Date(0);
            const dtFim = dataFim ? new Date(dataFim) : new Date();

            const vendas = await Entidade.Venda.findAll({
                where: { data: { [Op.between]: [dtInicio, dtFim] } },
                include: [
                    { model: Entidade.Automovel, as: 'automovel', required: false },
                    { model: Entidade.Cliente, as: 'cliente', required: false },
                    { model: Entidade.PagamentoVenda, as: 'pagamento_vendas', required: false }
                ],
                order: [['data', 'DESC']]
            });

            let totalLucroVendas = 0;
            const vendasEnriquecidas = [];

            for (const venda of vendas) {
                let custo = 0;
                let lucro = 0;
                let comissao = parseFloat(venda.comissao || 0);
                const origem = venda.automovel?.origem || venda.origem_automovel;
                const autoId = venda.automovelId || venda.automovel?.id;

                if (autoId) {
                    if (origem === 'Compra') {
                        const compra = await Entidade.Compra.findOne({ where: { automovelId: autoId } });
                        custo = parseFloat(compra?.valor || venda.automovel?.custo_aquisicao || 0);
                    } else if (origem === 'Troca') {
                        const troca = await Entidade.Troca.findOne({
                            where: {
                                [Op.or]: [
                                    { automovelId: autoId },
                                    { automovel_fornecido: autoId }
                                ]
                            }
                        });
                        custo = parseFloat(troca?.valor_aquisicao || venda.automovel?.custo_aquisicao || 0);
                    } else if (origem === 'Consignacao') {
                        const consignacao = await Entidade.Consignacao.findOne({ where: { automovelId: autoId } });
                        custo = parseFloat(consignacao?.valor || 0);
                    } else {
                        custo = parseFloat(venda.automovel?.custo_aquisicao || 0);
                    }
                } else {
                    custo = parseFloat(venda.automovel?.custo_aquisicao || 0);
                }

                lucro = parseFloat(venda.valor || 0) - custo - comissao;

                totalLucroVendas += lucro;
                vendasEnriquecidas.push({ ...venda.toJSON(), custo, lucro, origem });
            }

            const gastos = await Entidade.Gasto.findAll({
                where: { data: { [Op.between]: [dtInicio, dtFim] } },
                include: [{ model: Entidade.Automovel, as: 'automovel', required: false }]
            });
            const totalGastos = gastos.reduce((acc, curr) => acc + parseFloat(curr.valor || 0), 0);

            const manutencoes = await Entidade.Manutencao.findAll({
                where: { data_envio: { [Op.between]: [dtInicio, dtFim] } },
                include: [{ model: Entidade.Automovel, as: 'automovel', required: false }]
            });
            const totalManutencoes = manutencoes.reduce((acc, curr) => acc + parseFloat(curr.valor || 0), 0);

            const totalDespesas = totalGastos + totalManutencoes;
            const saldoLiquido = totalLucroVendas - totalDespesas;

            const transacoes = [
                ...vendasEnriquecidas.map(v => ({ ...v, tipo_transacao: 'Venda', data_ordenacao: v.data })),
                ...gastos.map(g => ({ ...g.toJSON(), tipo_transacao: 'Gasto', data_ordenacao: g.data })),
                ...manutencoes.map(m => ({ ...m.toJSON(), tipo_transacao: 'Manutencao', data_ordenacao: m.data_envio }))
            ];

            transacoes.sort((a, b) => new Date(b.data_ordenacao) - new Date(a.data_ordenacao));

            return res.status(200).send(transacoes);

        } catch (error) {
            console.error("Erro detalhado ao gerar balanço geral:", error);
            return res.status(500).send({ mensagem: "Erro ao gerar balanço geral.", error: error.message });
        }
    }

    switch (tipo) {

        case 'Compra':
            EntidadeSelecionada = Entidade.Compra;
            dateColumnName = 'data';
            includeOptions.push(
                { model: Entidade.Automovel, as: "automovel" },
                { model: Entidade.Cliente, as: "cliente" }
            );
            break;
        case 'Troca':
            EntidadeSelecionada = Entidade.Troca;
            dateColumnName = 'data';
            includeOptions.push(
                { model: Entidade.Automovel, as: "automovel" },
                { model: Entidade.Cliente, as: "cliente" }
            );
            break;
        case 'Gasto':
            EntidadeSelecionada = Entidade.Gasto;
            dateColumnName = 'data';
            includeOptions.push({ model: Entidade.Automovel, as: "automovel" });
            break;
        case 'Consignacao':
            EntidadeSelecionada = Entidade.Consignacao;
            dateColumnName = 'data_inicio';
            includeOptions.push(
                { model: Entidade.Automovel, as: "automovel" },
                { model: Entidade.Cliente, as: "cliente" }
            );
            break;
        case 'Manutencao':
            EntidadeSelecionada = Entidade.Manutencao;
            dateColumnName = 'data_envio';
            includeOptions.push({ model: Entidade.Automovel, as: "automovel" });
            break;
        default:
            return res.status(400).send({ mensagem: "Tipo de relatório inválido." });
    }

    try {
        const dtInicio = dataInicio ? new Date(dataInicio) : new Date(0);
        const dtFim = dataFim ? new Date(dataFim) : new Date();

        const queryOptions = {
            where: {
                [dateColumnName]: {
                    [Op.between]: [dtInicio, dtFim]
                }
            },
            include: includeOptions.map(inc => ({ ...inc, required: false }))
        };

        const dados = await EntidadeSelecionada.findAll(queryOptions);
        res.status(200).send(dados);
    } catch (error) {
        console.error("Erro detalhado ao gerar relatório:", error);
        res.status(500).send({ mensagem: "Erro ao gerar relatório.", error: error.message });
    }
};