const Entidade = require('../models/index');
const { sequelize } = require("../db");


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllTrocas = async (req, res) => {
    Entidade.Troca.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createTroca = async (req, res) => {

    const {
        comissao,
        data,
        forma_pagamento,
        valor,
        clienteId,
        funcionarioId,
        automovelId,
        automovel_fornecido,
        valor_aquisicao
    } = req.body;

    const troca = await Entidade.Troca.create({

        comissao: comissao,
        data: data,
        forma_pagamento: forma_pagamento,
        valor: valor,
        clienteId: clienteId,
        funcionarioId: funcionarioId,
        automovelId: automovelId,
        automovel_fornecido: automovel_fornecido,
        valor_aquisicao: valor_aquisicao
    });

    return res.status(201).send(troca);
};

exports.getTrocaById = async (req, res) => {

    const id = req.params.id;

    try {
        const troca = await Entidade.Troca.findByPk(id);

        if (troca) {
            return res.status(200).send(troca);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel Fornecido não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateTroca = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Troca.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Troca não encontrada' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getTrocaDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {
        const troca = await Entidade.Troca.findByPk(id, {
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

        if (!troca) {
            return res.status(404).send({ erro: true, mensagemErro: 'Troca não encontrada' });
        }

        return res.status(200).send(troca);

    } catch (erro) {
        handleServerError(res, erro);
    }
};


exports.deleteTroca = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {
        const troca = await Entidade.Troca.findByPk(id, { transaction: t });

        if (!troca) {
            await t.rollback();
            return res.status(44).send({ erro: true, mensagemErro: "Troca não encontrada." });
        }

        const automovelRecebidoId = troca.automovelId;
        const automovelFornecidoId = troca.automovel_fornecido;

        await Entidade.Troca.destroy({
            where: { id: id },
            transaction: t
        });

        if (automovelRecebidoId) {

            const auto = await Entidade.Automovel.findByPk(automovelRecebidoId);

            await Entidade.Automovel.destroy({
                where: { id: automovelRecebidoId },
                transaction: t
            });

        }

        if (automovelFornecidoId) {
            await Entidade.Automovel.update(
                { ativo: true },
                {
                    where: { id: automovelFornecidoId },
                    transaction: t
                }
            );
        }

        await t.commit();

        return res.status(200).send({
            sucesso: true,
            mensagem: "Troca excluída, automóvel recebido removido e automóvel fornecido retornado ao estoque."
        });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.getAllTrocasOrderByData = async (req, res) => {
    Entidade.Troca.findAll({
        order: [
            ["data", "DESC"]
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};