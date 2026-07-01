const Entidade = require('../models/index');
const { Op } = require("sequelize");

exports.gerarRelatorio = async (req, res) => {
    const { tipo, dataInicio, dataFim } = req.query;

    if (tipo === 'Venda') {
        try {
            const vendas = await Entidade.Venda.findAll({
                where: { data: { [Op.between]: [new Date(dataInicio), new Date(dataFim)] } },
                include: [
                    { model: Entidade.Automovel, as: 'automovel' },
                    { model: Entidade.Cliente, as: 'cliente' }
                ],
                order: [['data', 'DESC']]
            });

            const relatorioEnriquecido = [];

            for (const venda of vendas) {
                let custo = 0;
                let lucro = 0;
                const origem = venda.automovel?.origem;

                if (origem === 'Compra') {
                    const compra = await Entidade.Compra.findOne({ where: { automovelId: venda.automovelId } });
                    custo = parseFloat(compra?.valor || 0);
                    comissao = parseFloat(venda.comissao);
                    lucro = parseFloat(venda.valor) - custo - comissao;

                } else if (origem === 'Troca') {
                    const troca = await Entidade.Troca.findOne({ where: { automovelId: venda.automovelId } });
                    custo = parseFloat(troca.valor_aquisicao || 0);
                    comissao = parseFloat(venda.comissao);
                    lucro = parseFloat(venda.valor) - custo - comissao;

                } else if (origem === 'Consignacao') {
                    const consignacao = await Entidade.Consignacao.findOne({ where: { automovelId: venda.automovelId } });
                    comissao = parseFloat(venda.comissao);
                    lucro = parseFloat(consignacao?.valor || 0) - comissao;
                }

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
        const queryOptions = {
            where: {
                [dateColumnName]: {
                    [Op.between]: [new Date(dataInicio), new Date(dataFim)]
                }
            },
            include: includeOptions
        };

        const dados = await EntidadeSelecionada.findAll(queryOptions);
        res.status(200).send(dados);
    } catch (error) {
        console.error("Erro detalhado ao gerar relatório:", error);
        res.status(500).send({ mensagem: "Erro ao gerar relatório.", error: error.message });
    }
};