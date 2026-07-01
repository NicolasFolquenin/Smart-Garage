const Entidade = require('../models/index');
const { Op } = require("sequelize");
const { sequelize } = require('../db')


// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

exports.getAllClientes = async (req, res) => {
    Entidade.Cliente.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.getClienteById = async (req, res) => {

    const id = req.params.id;

    try {
        const cliente = await Entidade.Cliente.findByPk(id);

        if (cliente) {
            return res.status(200).send(cliente);
        }
        else {
            return res.status(404).send({ erro: true, mensagemErro: 'Cliente não encontrado' });;
        }
    } catch (erro) {
        handleServerError(res, erro);
    }

};


exports.createCliente = async (req, res) => {


    const {
        data_cadastro,
        email,
        nome,
        telefone
    } = req.body

    try {

        const cliente = await Entidade.Cliente.create({

            data_cadastro: data_cadastro,
            email: email,
            ativo: true,
            nome: nome,
            telefone: telefone
        });

        return res.status(201).send(cliente);
    } catch (erro) {
        handleServerError(res, erro)
    }
};

exports.verificarDuplicidade = async (req, res) => {

    const { email } = req.body;

    const emailExistente = await Entidade.Cliente.findOne({
        where: {
            [Op.or]: [{ email }]
        }
    });

    if (emailExistente) {
        return res.status(409).send({ erro: true, mensagemErro: 'Já existe um cliente com esse email.' });
    }



    return res.status(200).send({ erro: false });
};


exports.getAllDetalhado = async (req, res) => {
    try {
        const clientes = await Entidade.Cliente.findAll({ order: [['nome', 'ASC']] });

        const clientesDetalhado = await Promise.all(
            clientes.map(async (cliente) => {

                const fisica = await Entidade.Fisica.findOne({ where: { clienteId: cliente.id } });
                if (fisica) {
                    return {
                        ...cliente.toJSON(),
                        tipo: 'Pessoa Física',
                        documento: fisica.cpf,
                        detalhes: fisica
                    };
                }

                const juridica = await Entidade.Juridica.findOne({ where: { clienteId: cliente.id } });
                if (juridica) {
                    return {
                        ...cliente.toJSON(),
                        tipo: 'Pessoa Jurídica',
                        documento: juridica.cnpj,
                        detalhes: juridica
                    };
                }

                return {
                    ...cliente.toJSON(),
                    tipo: 'Não definido',
                    documento: 'N/A'
                };
            })
        );

        res.status(200).send(clientesDetalhado);

    } catch (error) {
        handleServerError(res, error);
    }
};

exports.update = async (req, res) => {
    const { id } = req.params;
    const { cliente, fisica, juridica, endereco, cidade, estado } = req.body;

    const t = await sequelize.transaction();

    try {

        await Entidade.Cliente.update(cliente, { where: { id }, transaction: t });


        if (fisica) {
            await Entidade.Fisica.update(fisica, { where: { clienteId: id }, transaction: t });
        } else if (juridica) {
            await Entidade.Juridica.update(juridica, { where: { clienteId: id }, transaction: t });
        }

        if (endereco && cidade && estado) {

            if (estado && estado.id) {
                await Entidade.Estado.update({ uf: estado.uf }, { where: { id: estado.id }, transaction: t });
            }
            if (cidade && cidade.id) {
                await Entidade.Cidade.update({ nome: cidade.nome }, { where: { id: cidade.id }, transaction: t });
            }

            if (endereco) {
                await Entidade.Endereco.update(
                    {
                        cep: endereco.cep,
                        logradouro: endereco.logradouro,
                        bairro: endereco.bairro,
                        numero: endereco.numero,
                        cidadeId: cidade.id
                    },
                    {
                        where: { clienteId: id },
                        transaction: t
                    }
                );
            }
        }

        await t.commit();
        res.status(200).send({ mensagem: "Cliente atualizado com sucesso!" });

    } catch (error) {
        await t.rollback();
        handleServerError(res, error);
    }
};

exports.getByIdDetalhado = async (req, res) => {
    const { id } = req.params;
    try {
        const cliente = await Entidade.Cliente.findByPk(id);
        if (!cliente) return res.status(404).send({ mensagem: "Cliente não encontrado." });

        const fisica = await Entidade.Fisica.findOne({ where: { clienteId: id } });
        const juridica = await Entidade.Juridica.findOne({ where: { clienteId: id } });
        const endereco = await Entidade.Endereco.findOne({
            where: { clienteId: id },
            include: [{ model: Entidade.Cidade, as: 'cidade', include: ['estado'] }]
        });

        const clienteCompleto = {
            cliente: cliente.toJSON(),
            fisica: fisica ? fisica.toJSON() : null,
            juridica: juridica ? juridica.toJSON() : null,
            endereco: endereco ? endereco.toJSON() : null,
        };

        res.status(200).send(clienteCompleto);
    } catch (error) {
        handleServerError(res, error);
    }
};