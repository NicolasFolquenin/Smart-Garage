const Entidade = require('../models/index');
const { sequelize } = require('../db');

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllGastos = async (req, res) => {
    Entidade.Gasto.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createGasto = async (req, res) => {

    const {
        data,
        descricao,
        automovelId,
        gerenteId,
        valor
    } = req.body;

    const gasto = await Entidade.Gasto.create({

        data: data,
        descricao: descricao,
        gerenteId: gerenteId,
        automovelId: automovelId,
        valor: valor
    });

    return res.status(201).send(gasto);
};

exports.getGastoById = async (req, res) => {

    const id = req.params.id;

    try {
        const gasto = await Entidade.Gasto.findByPk(id);

        if (gasto) {
            return res.status(200).send(gasto);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Gasto não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateGasto = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Gasto.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Gasto não encontrado' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getGastoDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {

        const gasto = await Entidade.Gasto.findByPk(id, {
            include: [
                {
                    model: Entidade.Automovel,
                    as: 'automovel',
                    include: [
                        { model: Entidade.Marca, as: 'marca' },
                        { model: Entidade.Modelo, as: 'modelo' }
                    ]
                }

            ]
        });

        if (!gasto) {
            return res.status(404).send({ erro: true, mensagemErro: 'Gasto não encontrada' });
        }

        return res.status(200).send(gasto);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.deleteGasto = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {

        const gasto = await Entidade.Gasto.findByPk(id, { transaction: t });

        if (!gasto) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: "Gasto não encontrado." });
        }

        await Entidade.Gasto.destroy({
            where: { id: id },
            transaction: t
        });

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: "Compra e automóvel associado foram excluídos com sucesso." });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.getAllGastosOrderByData = async (req, res) => {
    Entidade.Gasto.findAll({
        order: [
            ["data", "DESC"]
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};