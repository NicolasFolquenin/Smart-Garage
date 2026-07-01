const Entidade = require('../models/index');
const { sequelize } = require('../db');


exports.getAll = async (req, res) => {
    try {
        const faixas = await Entidade.Comissao.findAll({ order: [['valor_minimo', 'ASC']] });
        res.status(200).send(faixas);
    } catch (error) {
        res.status(500).send({ mensagem: "Erro ao buscar faixas de comissão." });
    }
};


exports.updateAll = async (req, res) => {
    const novasFaixas = req.body;
    const t = await sequelize.transaction();
    try {

        await Entidade.Comissao.destroy({ where: {}, transaction: t });

        await Entidade.Comissao.bulkCreate(novasFaixas, { transaction: t });

        await t.commit();
        res.status(200).send({ mensagem: "Regras de comissão atualizadas com sucesso!" });
    } catch (error) {
        await t.rollback();
        console.error("Erro detalhado ao atualizar comissões:", error);
        res.status(500).send({ mensagem: "Erro ao atualizar faixas de comissão." })
    }
};