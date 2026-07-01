const { where } = require('sequelize');
const Entidade = require('../models/index');

exports.findByFuncionarioid = async (req, res) => {

    const { funcionarioId } = req.body;

    const gerente = await Entidade.Gerente.findOne({
        where: {
            funcionarioId: funcionarioId
        }
    });

    if (!gerente) {
        return res.status(404).send({ erro: true, mensagemErro: 'Gerente não encontrado' });
    }

    return res.status(201).send(gerente);
}
