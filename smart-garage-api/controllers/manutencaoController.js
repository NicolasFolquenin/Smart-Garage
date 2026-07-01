const Entidade = require('../models/index');
const { sequelize } = require('../db');


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllManutencoes = async (req, res) => {
    Entidade.Manutencao.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createManutencao = async (req, res) => {

    const {
        ativo,
        data_envio,
        data_retorno,
        previsao_retorno,
        descricao,
        automovelId,
        gerenteId,
        valor
    } = req.body;

    const manutencao = await Entidade.Manutencao.create({

        ativo: ativo,
        data_envio: data_envio,
        data_retorno: data_retorno,
        previsao_retorno: previsao_retorno,
        descricao: descricao,
        gerenteId: gerenteId,
        automovelId: automovelId,
        valor: valor
    });

    return res.status(201).send(manutencao);
};

exports.getManutencaoById = async (req, res) => {

    const id = req.params.id;

    try {
        const manutencao = await Entidade.Manutencao.findByPk(id);

        if (manutencao) {
            return res.status(200).send(manutencao);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Manutenção não encontrada' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateManutencao = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Manutencao.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Manutenção não encontrado' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getManutencaoDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {
        const manutencao = await Entidade.Manutencao.findByPk(id, {
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

        if (!manutencao) {
            return res.status(404).send({ erro: true, mensagemErro: 'Manutencao não encontrada' });
        }

        return res.status(200).send(manutencao);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.deleteManutencao = async (req, res) => {
    const id = req.params.id;

    const t = await sequelize.transaction();

    try {

        const manutencao = await Entidade.Manutencao.findByPk(id, { transaction: t });

        if (!manutencao) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: "Manutenção não encontrada." });
        }

        await Entidade.Manutencao.destroy({
            where: { id: id },
            transaction: t
        });

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: "Manutenção excluída com sucesso." });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};

exports.getAllManutencoesOrderByData = async (req, res) => {
    Entidade.Manutencao.findAll({
        where: {
            ativo: true,
        },
        order: [
            ["data_envio", "DESC"]
        ]
    }).then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getAllManutencoesAtivas = async (req, res) => {
    try {
        const manutencoes = await Entidade.Manutencao.findAll({
            where: {
                ativo: true
            },
        });
        res.status(200).send(manutencoes);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.getAllManutencoesInativas = async (req, res) => {
    try {
        const manutencoes = await Entidade.Manutencao.findAll({
            where: {
                ativo: false
            },
        });
        res.status(200).send(manutencoes);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.finalizarManutencao = async (req, res) => {
    const id = req.params.id;
    const { data_retorno } = req.body;

    if (!data_retorno) {
        return res.status(400).send({ erro: true, mensagemErro: "A data de retorno é obrigatória." });
    }

    const dataRetornoObj = new Date(data_retorno);
    const hoje = new Date();
    dataRetornoObj.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);

    if (dataRetornoObj > hoje) {
        return res.status(400).send({ erro: true, mensagemErro: "A data de retorno não pode ser uma data futura." });
    }

    const t = await sequelize.transaction();

    try {

        const manutencao = await Entidade.Manutencao.findByPk(id, { transaction: t });

        if (!manutencao) {
            await t.rollback();
            return res.status(404).send({ erro: true, mensagemErro: 'Manutenção não encontrada.' });
        }

        await Entidade.Manutencao.update(
            {
                ativo: false,
                data_retorno: data_retorno
            },
            {
                where: { id: id },
                transaction: t
            }
        );

        await t.commit();

        return res.status(200).send({ sucesso: true, mensagem: 'Manutenção finalizada!' });

    } catch (erro) {
        await t.rollback();
        handleServerError(res, erro);
    }
};