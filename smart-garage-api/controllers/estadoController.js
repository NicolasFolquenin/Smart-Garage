const Entidade = require('../models/index');

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllEstados = async (req, res) => {
    Entidade.Estado.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createEstado = async (req, res) => {

    var uf = req.body.uf;

    const estado = await Entidade.Estado.create({

        uf: uf
    });

    return res.status(201).send(estado);
};