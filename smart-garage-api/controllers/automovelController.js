const { where } = require("sequelize");
const Entidade = require("../models/index");
const { Op } = require("sequelize");
const { response } = require("express");

const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};


exports.getAllAutomoveis = async (req, res) => {
    Entidade.Automovel.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
}

exports.createAutomovel = async (req, res) => {

    const {
        ano_fabricacao,
        ano_modelo,
        cor,
        combustivel,
        km,
        origem,
        placa,
        renavam,
        valor,
        marcaId,
        modeloId
    } = req.body;

    const file = req.file;
    const imagemPath = file ? file.path : null;
    const placaUpperCase = placa ? placa.toUpperCase() : null;


    try {
        const automovel = await Entidade.Automovel.create({

            ano_fabricacao: ano_fabricacao,
            ano_modelo: ano_modelo,
            ativo: true,
            cor: cor,
            combustivel: combustivel,
            km: km,
            origem: origem,
            placa: placaUpperCase,
            renavam: renavam,
            valor: valor,
            marcaId: marcaId,
            imagem: imagemPath,
            modeloId: modeloId
        });

        return res.status(201).send(automovel);
    } catch (error) {
        console.error("Erro ao criar automóvel:", error);
        return res.status(500).send({ erro: true, mensagemErro: "Erro ao cadastrar automóvel" });
    }


}

exports.verificarDuplicidade = async (req, res) => {
    const { placa, renavam, idAutomovelAtual } = req.body;

    try {
        const condicoes = [];

        if (placa) condicoes.push({ placa: placa });
        if (renavam) condicoes.push({ renavam: renavam });

        if (condicoes.length === 0) {
            return res.status(200).send({ erro: false });
        }


        const whereClause = {
            [Op.or]: condicoes
        };


        if (idAutomovelAtual) {
            whereClause.id = { [Op.ne]: idAutomovelAtual }; // Op.ne = Not Equal (Não é igual a)
        }

        const existente = await Entidade.Automovel.findOne({
            where: whereClause
        });

        if (existente) {
            if (placa && existente.placa && existente.placa.trim().toUpperCase() === placa.trim().toUpperCase()) {
                return res.status(409).send({ erro: true, mensagemErro: 'Já existe outro automóvel com este registro de Placa.' });
            }
            if (renavam && existente.renavam === renavam) {
                return res.status(409).send({ erro: true, mensagemErro: 'Já existe outro automóvel com este registro de Renavam.' });
            }

            return res.status(409).send({ erro: true, mensagemErro: 'Já existe outro automóvel com este registro.' });
        }


        return res.status(200).send({ erro: false });

    } catch (error) {
        handleServerError(res, error);
    }
};

exports.getAutomovelById = async (req, res) => {

    const id = req.params.id;

    try {
        const automovel = await Entidade.Automovel.findByPk(id);

        if (automovel) {
            return res.status(200).send(automovel);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.getAutomovelByRenavam = async (req, res) => {

    const renavam = req.params.renavam;

    try {

        const automovel = await Entidade.Automovel.findOne({
            where: {
                renavam: renavam
            }
        });

        if (automovel) {
            return res.status(200).send(automovel);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel não encontrado' });
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.getAutomovelByPlaca = async (req, res) => {

    const placa = req.params.placa;

    try {

        const automovel = await Entidade.Automovel.findOne({
            where: {
                placa: placa
            }
        });

        if (automovel && automovel.ativo === false) {
            return res.status(400).send({ erro: true, mensagemErro: "Automóvel inativo" })
        }
        else if (automovel && automovel.ativo === true) {
            return res.status(200).send(automovel);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel não encontrado' });
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateAutomovel = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    if (req.file) {

        const file = req.file;

        updateData.imagem = file ? file.path : null;
        console.log(`Nova imagem recebida para o automóvel ${id}: ${req.file.path}`);
    }

    try {
        const update = await Entidade.Automovel.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel não encontrado' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getAllAutomoveisAtivos = async (req, res) => {
    try {
        const automovel = await Entidade.Automovel.findAll({
            where: {
                ativo: true
            },
        });
        res.status(200).send(automovel);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.getAllAutomoveisInativos = async (req, res) => {
    try {
        const automovel = await Entidade.Automovel.findAll({
            where: {
                ativo: false
            },
        });
        res.status(200).send(automovel);
    } catch (err) {
        handleServerError(res, err);
    }
};

exports.getAutomovelDetalhesById = async (req, res) => {
    const id = req.params.id;

    try {

        const automovel = await Entidade.Automovel.findByPk(id, {
            include: [
                {
                    model: Entidade.Marca,
                    as: 'marca'
                },
                {
                    model: Entidade.Modelo,
                    as: 'modelo'
                }

            ]
        });

        if (!automovel) {
            return res.status(404).send({ erro: true, mensagemErro: 'Automóvel não encontrado' });
        }

        return res.status(200).send(automovel);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.verificarStatus = async (req, res) => {
    const { placa, renavam } = req.body;

    if (!placa && !renavam) {
        return res.status(400).send({ mensagem: "Placa ou Renavam são obrigatórios." });
    }

    try {
        const automovel = await Entidade.Automovel.findOne({
            where: {
                [Op.or]: [
                    { placa: placa || null },
                    { renavam: renavam || null }
                ]
            }
        });

        if (!automovel) {
            return res.status(200).send({ status: 'nao_existe' });
        }

        if (automovel.ativo) {
            return res.status(409).send({ status: 'ativo', automovel, mensagem: "Este automóvel já está ativo no estoque." });
        } else {
            return res.status(200).send({ status: 'inativo', automovel });
        }

    } catch (error) {
        handleServerError(res, error);
    }
};