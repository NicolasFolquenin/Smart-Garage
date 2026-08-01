const Entidade = require("../models/index");
const { sequelize } = require("../db");


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllVendas = async (req, res) => {
    try {
        Entidade.Venda.findAll({
            include: [
                { model: Entidade.PagamentoVenda, as: 'pagamento_vendas' }
            ]
        }).then((values) => {
            res.status(200).send(values)
        })
    } catch (err) {
        handleServerError(res, err)
    }
};

exports.createVenda = async (req, res) => {

    const {
        data,
        valor,
        comissao,
        automovelId,
        clienteId,
        funcionarioId,
        pagamentos
    } = req.body;

    const t = await sequelize.transaction();

    try {

        // Validação dos pagamentos
        if (!pagamentos || !Array.isArray(pagamentos) || pagamentos.length === 0) {
            await t.rollback();
            return res.status(400).send({ erro: true, mensagemErro: "Informe ao menos uma forma de pagamento." });
        }

        if (pagamentos.length > 3) {
            await t.rollback();
            return res.status(400).send({ erro: true, mensagemErro: "O máximo de formas de pagamento é 3." });
        }

        // Validar que a soma dos pagamentos é igual ao valor da venda
        const somaPagamentos = pagamentos.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);
        const valorVenda = parseFloat(valor);

        if (Math.abs(somaPagamentos - valorVenda) > 0.01) {
            await t.rollback();
            return res.status(400).send({
                erro: true,
                mensagemErro: `A soma dos pagamentos (R$ ${somaPagamentos.toFixed(2)}) deve ser igual ao valor da venda (R$ ${valorVenda.toFixed(2)}).`
            });
        }

        const automovelVendido = await Entidade.Automovel.findByPk(automovelId, { transaction: t });
        if (!automovelVendido) {
            throw new Error("Automóvel não encontrado.");
        }

        const venda = await Entidade.Venda.create({
            data: data,
            comissao: comissao,
            valor: valor,
            funcionarioId: funcionarioId,
            automovelId: automovelId,
            clienteId: clienteId,
            origem_automovel: automovelVendido.origem
        }, { transaction: t });

        // Criar os registros de pagamento
        const pagamentosData = pagamentos.map(p => ({
            forma_pagamento: p.forma_pagamento,
            valor: p.valor,
            observacao: p.observacao || null,
            vendaId: venda.id
        }));

        await Entidade.PagamentoVenda.bulkCreate(pagamentosData, { transaction: t });

        await t.commit();

        // Buscar a venda com os pagamentos para retornar
        const vendaCompleta = await Entidade.Venda.findByPk(venda.id, {
            include: [
                { model: Entidade.PagamentoVenda, as: 'pagamento_vendas' }
            ]
        });

        return res.status(201).send(vendaCompleta);

    } catch (err) {
        await t.rollback();
        handleServerError(res, err)
    }
};

exports.getAllVendasOrderByData = async (req, res) => {
    Entidade.Venda.findAll({
        order: [
            ["data", "DESC"]
        ],
        include: [
            { model: Entidade.PagamentoVenda, as: 'pagamento_vendas' }
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getVendaById = async (req, res) => {

    const id = req.params.id;

    try {
        const venda = await Entidade.Venda.findByPk(id, {
            include: [
                { model: Entidade.PagamentoVenda, as: 'pagamento_vendas' }
            ]
        });

        if (venda) {
            return res.status(200).send(venda);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Venda não encontrada' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};


exports.updateVenda = async (req, res) => {

    const id = req.params.id;
    const { pagamentos, ...updateData } = req.body;

    const t = await sequelize.transaction();

    try {
        const vendaExistente = await Entidade.Venda.findByPk(id, { transaction: t });

        if (!vendaExistente) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: 'Venda não encontrada' });
        }

        // Atualizar dados da venda (sem forma_pagamento)
        const { forma_pagamento, ...dadosLimpos } = updateData;
        await Entidade.Venda.update(dadosLimpos, {
            where: { id: id },
            transaction: t
        });

        // Se pagamentos foram enviados, atualizar
        if (pagamentos && Array.isArray(pagamentos)) {

            if (pagamentos.length === 0) {
                await t.rollback();
                return res.status(400).send({ erro: true, mensagemErro: "Informe ao menos uma forma de pagamento." });
            }

            if (pagamentos.length > 3) {
                await t.rollback();
                return res.status(400).send({ erro: true, mensagemErro: "O máximo de formas de pagamento é 3." });
            }

            // Validar soma dos pagamentos
            const valorVenda = parseFloat(updateData.valor || vendaExistente.valor);
            const somaPagamentos = pagamentos.reduce((acc, p) => acc + parseFloat(p.valor || 0), 0);

            if (Math.abs(somaPagamentos - valorVenda) > 0.01) {
                await t.rollback();
                return res.status(400).send({
                    erro: true,
                    mensagemErro: `A soma dos pagamentos (R$ ${somaPagamentos.toFixed(2)}) deve ser igual ao valor da venda (R$ ${valorVenda.toFixed(2)}).`
                });
            }

            // Deletar pagamentos antigos e criar novos
            await Entidade.PagamentoVenda.destroy({
                where: { vendaId: id },
                transaction: t
            });

            const pagamentosData = pagamentos.map(p => ({
                forma_pagamento: p.forma_pagamento,
                valor: p.valor,
                observacao: p.observacao || null,
                vendaId: id
            }));

            await Entidade.PagamentoVenda.bulkCreate(pagamentosData, { transaction: t });
        }

        await t.commit();

        // Buscar a venda atualizada com pagamentos
        const vendaAtualizada = await Entidade.Venda.findByPk(id, {
            include: [
                { model: Entidade.PagamentoVenda, as: 'pagamento_vendas' }
            ]
        });

        return res.status(200).send(vendaAtualizada);

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.getVendaDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {

        const venda = await Entidade.Venda.findByPk(id, {
            include: [
                {
                    model: Entidade.Automovel,
                    as: 'automovel',
                    include: [
                        { model: Entidade.Marca, as: 'marca' },
                        { model: Entidade.Modelo, as: "modelo" }

                    ]
                },
                {
                    model: Entidade.Cliente,
                    as: 'cliente',
                    include: [
                        { model: Entidade.Fisica, as: 'fisica' },
                        { model: Entidade.Juridica, as: 'juridica' }
                    ]
                },
                {
                    model: Entidade.PagamentoVenda,
                    as: 'pagamento_vendas'
                }

            ]
        });

        if (!venda) {
            return res.status(404).send({ erro: true, mensagemErro: 'venda não encontrada' });
        }

        return res.status(200).send(venda);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.deleteVenda = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {

        const venda = await Entidade.Venda.findByPk(id, { transaction: t });

        if (!venda) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: "Venda não encontrada." });
        }

        const automovelIdParaReativar = venda.automovelId;

        // Deletar pagamentos associados antes de deletar a venda
        await Entidade.PagamentoVenda.destroy({
            where: { vendaId: id },
            transaction: t
        });

        await Entidade.Venda.destroy({
            where: { id: id },
            transaction: t
        });

        if (automovelIdParaReativar) {
            await Entidade.Automovel.update(
                { ativo: true },
                {
                    where: { id: automovelIdParaReativar },
                    transaction: t
                }
            );
        }

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: "Venda excluída e automóvel retornado ao estoque." });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};
