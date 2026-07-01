const { where } = require('sequelize');
const Entidade = require('../models/index');
const bcrypt = require('bcryptjs');

const isPasswordStrong = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
};


exports.findByFuncionarioid = async (req, res) => {

    const { id } = req.params;

    try {
        const vendedor = await Entidade.Vendedor.findOne({
            where: {
                funcionarioId: id
            }
        });

        if (!vendedor) {
            return res.status(404).send({ erro: true, mensagemErro: 'Vendedor não encontrado' });
        }

        return res.status(200).send(vendedor);

    } catch (error) {
        // Adicionado um try-catch para lidar com possíveis erros
        console.error("Erro ao buscar vendedor por ID de funcionário:", error);
        return res.status(500).send({ mensagem: "Erro interno ao buscar vendedor." });
    }
}

exports.create = async (req, res) => {
    const { nome, usuario, senha, email, telefone } = req.body;

    if (!nome || !usuario || !senha || !email || !telefone) {
        return res.status(400).send({ mensagem: "Todos os campos são obrigatórios." });
    }

    if (!isPasswordStrong(senha)) {
        return res.status(400).send({ mensagem: "A senha não cumpre os requisitos de segurança." });
    }

    try {

        const emailExistente = await Entidade.Funcionario.findOne({ where: { email } });
        if (emailExistente) {
            return res.status(409).send({ mensagem: "Este e-mail já está em uso." });
        }

        const usuarioExistente = await Entidade.Funcionario.findOne({ where: { usuario } });
        if (usuarioExistente) {
            return res.status(409).send({ mensagem: "Este nome de usuário já está em uso." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);

        const funcionario = await Entidade.Funcionario.create({
            nome,
            usuario,
            email,
            telefone,
            data_cadastro: new Date(),
            senha: senhaHash,
            ativo: true
        });

        await Entidade.Vendedor.create({
            funcionarioId: funcionario.id
        });

        res.status(201).send({ mensagem: "Vendedor cadastrado com sucesso!" });
    } catch (error) {
        res.status(500).send({ mensagem: "Erro ao cadastrar vendedor.", error });
        console.log(error)
    }
};

exports.getAll = async (req, res) => {
    try {
        const vendedores = await Entidade.Vendedor.findAll({
            include: [{
                model: Entidade.Funcionario,
                as: 'funcionario',
                attributes: ['id', 'nome', 'usuario', 'ativo']
            }]
        });
        res.status(200).send(vendedores);
    } catch (error) {
        res.status(500).send({ mensagem: "Erro ao buscar vendedores.", error });
    }
};


exports.updateStatus = async (req, res) => {
    const { id } = req.params;
    const { ativo } = req.body;

    try {
        const vendedor = await Entidade.Vendedor.findByPk(id);
        if (!vendedor) {
            return res.status(404).send({ mensagem: "Vendedor não encontrado." });
        }

        await Entidade.Funcionario.update(
            { ativo: ativo },
            { where: { id: vendedor.funcionarioId } }
        );

        const mensagem = ativo ? "Vendedor reativado com sucesso." : "Vendedor inativado com sucesso.";
        res.status(200).send({ mensagem });
    } catch (error) {
        res.status(500).send({ mensagem: "Erro ao atualizar status do vendedor.", error });
    }
};