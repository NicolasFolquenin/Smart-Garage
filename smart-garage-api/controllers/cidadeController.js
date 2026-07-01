const Entidade = require('../models/index');


const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllCidades = async (req, res) => {
    Entidade.Cidade.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createCidade = async (req, res) => {

    var nome = req.body.nome;
    var estadoId = req.body.estadoId;

    const cidade = await Entidade.Cidade.create({

        nome: nome,
        estadoId: estadoId
    });

    return res.status(201).send(cidade);
};