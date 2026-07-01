const Entidade = require("../models/index");

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};


exports.getAllMarcas = async (req, res) => {
    Entidade.Marca.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
}

exports.createMarca = async (req, res) => {

    var nome = req.body.nome;

    Entidade.Marca.create({

        nome: nome

    }).then((marca) => {
        return res.status(201).send(marca);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getMarcaById = async (req, res) => {

    const id = req.params.id;

    try {
        const marca = await Entidade.Marca.findByPk(id);

        if (marca) {
            return res.status(200).send(marca);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Marca não encontrada' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateMarca = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Marca.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Marca não encontrada' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};