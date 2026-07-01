const Entidade = require('../models/index');
const { Op } = require("sequelize");


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllJuridica = async (req, res) => {
    Entidade.Juridica.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getJuridicaById = async (req, res) => {

    const id = req.params.id;

    try {
        const juridica = await Entidade.Juridica.findByPk(id);

        if (juridica) {
            return res.status(200).send(juridica);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Cliente não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.getJuridicaByCnpj = async (req, res) => {

    const identificacao = req.params.identificacao;

    try {
        const juridica = await Entidade.Juridica.findAll({
            where: {
                cnpj: identificacao
            },
        });

        if (juridica) {
            res.status(200).send(juridica);
        } else {
            return res.status(404).send({ erro: true, mensagemErro: 'Pessoa jurídica não encontrada' });;
        }
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.createJuridica = async (req, res) => {

    const {
        cnpj,
        nome_responsavel,
        razao_social,
        clienteId
    } = req.body;

    const razaoSocialParaSalvar = razao_social ? razao_social : null;

    try {

        const juridica = await Entidade.Juridica.create({
            cnpj: cnpj,
            nome_responsavel: nome_responsavel,
            razao_social: razaoSocialParaSalvar,
            clienteId: clienteId
        });

        return res.status(201).send(juridica);

    } catch (erro) {
        handleServerError(res, erro)
    }
};

exports.verificarDuplicidade = async (req, res) => {

    const { cnpj, razao_social, idClienteAtual } = req.body;

    try {
        const condicoes = [];
        if (cnpj) condicoes.push({ cnpj: cnpj });
        if (razao_social) condicoes.push({ razao_social: razao_social });

        if (condicoes.length === 0) {
            return res.status(200).send({ erro: false });
        }

        const whereClause = { [Op.or]: condicoes };

        if (idClienteAtual) {
            whereClause.clienteId = { [Op.ne]: idClienteAtual };
        }

        const existente = await Entidade.Juridica.findOne({
            where: whereClause
        });

        if (existente) {
            const campo = existente.cnpj === cnpj ? 'CNPJ' : 'Razão Social';
            return res.status(409).send({ erro: true, mensagemErro: `Já existe outro cliente com este registro de ${campo}.` });
        }

        return res.status(200).send({ erro: false });

    } catch (error) {
        handleServerError(res, error);
    }
};