const Entidade = require('../models/index');
const { Op, where } = require('sequelize');
const { sequelize } = require("../db");

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllConsignacoes = async (req, res) => {
    Entidade.Consignacao.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createConsignacao = async (req, res) => {

    const {
        data_inicio,
        data_fim,
        ativo,
        valor,
        funcionarioId,
        automovelId,
        clienteId
    } = req.body;

    const consignacao = await Entidade.Consignacao.create({

        data_inicio: data_inicio,
        data_fim: data_fim,
        ativo: ativo,
        valor: valor,
        funcionarioId: funcionarioId,
        automovelId: automovelId,
        clienteId: clienteId
    });

    return res.status(201).send(consignacao);
}

exports.getAllConsignacoesOrderByData = async (req, res) => {
    Entidade.Consignacao.findAll({
        where: {
            ativo: true,
        },
        order: [
            ["data_inicio", "DESC"]
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getConsignacaoById = async (req, res) => {

    const id = req.params.id;

    try {
        const consignacao = await Entidade.Consignacao.findByPk(id);

        if (consignacao) {
            return res.status(200).send(consignacao);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.getConsignacaoByAutomovel = async (req, res) => {

    const automovelId = req.params.automovelId;

    try {

        const consignacao = await Entidade.Consignacao.findOne({
            where: {
                ativo: true,
                automovelId: automovelId
            }
        });

        if (consignacao) {
            return res.status(200).send(consignacao);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada' })
        }

    } catch (erro) {
        handleServerError(res, erro)
    }
};

exports.updateConsignacao = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Consignacao.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getAllConsignacoesAtivas = async (req, res) => {
    try {
        const consignacoes = await Entidade.Consignacao.findAll({
            where: {
                ativo: true
            },
        });
        res.status(200).send(consignacoes);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.getAllConsignacoesInativas = async (req, res) => {
    try {
        const consignacoes = await Entidade.Consignacao.findAll({
            where: {
                ativo: false
            },
        });
        res.status(200).send(consignacoes);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.getConsignacaoDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {

        const consignacao = await Entidade.Consignacao.findByPk(id, {
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

        if (!consignacao) {
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada' });
        }

        return res.status(200).send(consignacao);

    } catch (erro) {
        handleServerError(res, erro);
    }
};


exports.encerrarConsignacao = async (req, res) => {
    const id = req.params.id;
    const { data_termino, motivo_encerramento } = req.body;

    if (!data_termino) {
        return res.status(400).send({ erro: true, mensagemErro: "A data de término é obrigatória." });
    }


    const dataTerminoObj = new Date(data_termino);

    const hoje = new Date();

    dataTerminoObj.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    if (dataTerminoObj > hoje) {
        return res.status(400).send({ erro: true, mensagemErro: "A data de término não pode ser uma data futura." });
    }

    const t = await sequelize.transaction();

    try {

        const consignacao = await Entidade.Consignacao.findByPk(id, { transaction: t });

        if (!consignacao) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada.' });
        }

        const automovelIdParaInativar = consignacao?.automovelId;

        await Entidade.Consignacao.update(
            {
                ativo: false,
                data_fim: data_termino,
                motivo_encerramento: motivo_encerramento || null
            },
            {
                where: { id: id },
                transaction: t
            }
        );

        if (automovelIdParaInativar) {
            await Entidade.Automovel.update(
                { ativo: false },
                {
                    where: { id: automovelIdParaInativar },
                    transaction: t
                }
            );
        }

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: 'Consignação encerrada com sucesso!' });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.deleteConsignacao = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {

        const consignacao = await Entidade.Consignacao.findByPk(id, { transaction: t });

        if (!consignacao) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: "Consignação não encontrada." });
        }

        const automovelIdParaDeletar = consignacao.automovelId;

        await Entidade.Consignacao.destroy({
            where: { id: id },
            transaction: t
        });

        if (automovelIdParaDeletar) {

            const auto = await Entidade.Automovel.findByPk(automovelIdParaDeletar);


            await Entidade.Automovel.destroy({
                where: { id: automovelIdParaDeletar },
                transaction: t
            });

        }

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: "Consignação e automóvel associado foram excluídos com sucesso." });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};