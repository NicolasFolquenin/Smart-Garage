const Entidade = require('../models/index');
const { sequelize } = require("../db");


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllCompras = async (req, res) => {
    Entidade.Compra.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createCompra = async (req, res) => {

    var data = req.body.data;
    var valor = req.body.valor;
    var gerenteId = req.body.gerenteId;
    var automovelId = req.body.automovelId;
    var clienteId = req.body.clienteId;

    const compra = await Entidade.Compra.create({

        data: data,
        valor: valor,
        gerenteId: gerenteId,
        automovelId: automovelId,
        clienteId: clienteId
    });

    return res.status(201).send(compra);
};

exports.getCompraById = async (req, res) => {

    const id = req.params.id;

    try {
        const compra = await Entidade.Compra.findByPk(id);

        if (compra) {
            return res.status(200).send(compra);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Consignação não encontrada' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateCompra = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Compra.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Compra não encontrada' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getCompraDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {

        const compra = await Entidade.Compra.findByPk(id, {
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

        if (!compra) {
            return res.status(404).send({ erro: true, mensagemErro: 'Compra não encontrada' });
        }

        return res.status(200).send(compra);

    } catch (erro) {
        handleServerError(res, erro);
    }
};


exports.deleteCompra = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {

        const compra = await Entidade.Compra.findByPk(id, { transaction: t });

        if (!compra) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: "Compra não encontrada." });
        }

        const automovelIdParaDeletar = compra.automovelId;


        await Entidade.Compra.destroy({
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

        return res.status(200).send({ sucesso: true, mensagem: "Compra e automóvel associado foram excluídos com sucesso." });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.getAllComprasOrderByData = async (req, res) => {
    Entidade.Compra.findAll({
        order: [
            ["data", "DESC"]
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};