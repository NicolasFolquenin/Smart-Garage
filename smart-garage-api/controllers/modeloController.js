const Entidade = require("../models/index");

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};


exports.getAllModelos = async (req, res) => {
    Entidade.Modelo.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
}

exports.createModelo = async (req, res) => {

    var nome = req.body.nome;
    var marcaId = req.body.marcaId;

    Entidade.Modelo.create({

        nome: nome,
        marcaId: marcaId

    }).then((modelo) => {
        return res.status(201).send(modelo);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getModeloById = async (req, res) => {

    const id = req.params.id;

    try {
        const modelo = await Entidade.Modelo.findByPk(id);

        if (modelo) {
            return res.status(200).send(modelo);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Modelo não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};

exports.updateModelo = async (req, res) => {

    const id = req.params.id;

    const updateData = req.body;

    try {
        const update = await Entidade.Modelo.update(updateData, {
            where: { id: id }
        });

        if (!update) {
            return res.status(404).send({ erro: true, mensagemErro: 'Modelo não encontrado' });
        }

        return res.status(200).send(update);

    } catch (erro) {
        handleServerError(res, erro);
    }
};

exports.getModelosByMarca = async (req, res) => {
    const marcaId = req.params.marcaId;
    try {
        const modelos = await Entidade.Modelo.findAll({
            where: { marcaId: marcaId },
            order: [['nome', 'ASC']]
        });
        res.status(200).send(modelos);
    } catch (error) {
        handleServerError(res, error);
    }
};