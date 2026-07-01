const Entidade = require("../models/index");
const { sequelize } = require("../db");


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllVendas = async (req, res) => {
    try {
        Entidade.Venda.findAll().then((values) => {
            res.status(200).send(values)
        })
    } catch (err) {
        handleServerError(res, err)
    }
};

exports.createVenda = async (req, res) => {

    const {
        data,
        forma_pagamento,
        valor,
        comissao,
        automovelId,
        clienteId,
        funcionarioId
    } = req.body;

    const t = await sequelize.transaction();

    try {

        const automovelVendido = await Entidade.Automovel.findByPk(automovelId, { transaction: t });
        if (!automovelVendido) {
            throw new Error("Automóvel não encontrado.");
        }

        const venda = await Entidade.Venda.create({

            data: data,
            forma_pagamento: forma_pagamento,
            comissao: comissao,
            valor: valor,
            funcionarioId: funcionarioId,
            automovelId: automovelId,
            clienteId: clienteId,
            origem_automovel: automovelVendido.origem
        }, { transaction: t });

        await t.commit();
        return res.status(201).send(venda);

    } catch (err) {
        handleServerError(res, err)
    }
};

exports.getAllVendasOrderByData = async (req, res) => {
    Entidade.Venda.findAll({
        order: [
            ["data", "DESC"]
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
        const venda = await Entidade.Venda.findByPk(id);

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

    const updateData = req.body;

    try {
        const update = await Entidade.Venda.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Venda não encontrada' });
        }

        return res.status(200).send(update);

    } catch (erro) {
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
