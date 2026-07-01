const Entidade = require('../models/index');

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllEnderecos = async (req, res) => {
    Entidade.Endereco.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};


exports.createEndereco = async (req, res) => {

    var bairro = req.body.bairro;
    var cep = req.body.cep;
    var logradouro = req.body.logradouro;
    var numero = req.body.numero;
    var clienteId = req.body.clienteId;
    var cidadeId = req.body.cidadeId;

    const endereco = await Entidade.Endereco.create({

        bairro: bairro,
        cep: cep,
        logradouro: logradouro,
        numero: numero,
        clienteId: clienteId,
        cidadeId: cidadeId
    });

    return res.status(201).send(endereco);
};