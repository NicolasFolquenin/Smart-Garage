const bcrypt = require('bcryptjs');
const Entidade = require('../models/index');
const { sequelize } = require("../db");

// Função auxiliar para lidar com erros
const handleServerError = (res, error) => {
    console.error(error);
    res.status(500).send({ erro: 'Um erro ocorreu' });
};

const isPasswordStrong = (password) => {
    if (password.length < 8) return false;
    if (!/[A-Z]/.test(password)) return false;
    if (!/[a-z]/.test(password)) return false;
    if (!/[0-9]/.test(password)) return false;
    if (!/[^A-Za-z0-9]/.test(password)) return false;
    return true;
};

exports.createFuncionario = async (req, res) => {
    const { nome, telefone, usuario, senha, role, email } = req.body;

    if (!isPasswordStrong(senha)) {
        return res.status(400).send({ mensagem: "A senha não cumpre os requisitos de segurança (mín. 8 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial)." });
    }

    if (!['gerente', 'vendedor'].includes(role)) {
        return res.status(400).send({ erro: true, mensagemErro: "O cargo deve ser 'gerente' ou 'vendedor'." });
    }

    const t = await sequelize.transaction();

    try {
        // Gera um "sal" e cria o hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);

        const novoFuncionario = await Entidade.Funcionario.create({
            nome,
            telefone,
            usuario,
            senha: senhaHash, // Salva a senha hasheada
            data_cadastro: new Date(),
            email
        }, { transaction: t });


        if (role === 'gerente') {
            await Entidade.Gerente.create({ funcionarioId: novoFuncionario?.dataValues.id }, { transaction: t });
        } else {
            await Entidade.Vendedor.create({ funcionarioId: novoFuncionario?.dataValues.id }, { transaction: t });
        }

        await t.commit();

        const { senha: _, ...funcionarioSemSenha } = novoFuncionario.get({ plain: true });

        res.status(201).send(funcionarioSemSenha);
    } catch (error) {
        await t.rollback();
        handleServerError(res, error);
    }
};

exports.getAllFuncionarios = async (req, res) => {
    Entidade.Funcionario.findAll().then((values) => {
        res.status(200).send(values);
    }).catch((err) => {
        handleServerError(res, err);
    })
};

exports.alterarSenhaLogado = async (req, res) => {
    // O ID vem do token, garantindo que o utilizador só pode alterar a própria senha
    const { id } = req.user;
    const { senha } = req.body;

    if (!senha) {
        return res.status(400).send({ mensagem: "A nova senha é obrigatória." });
    }

    if (!isPasswordStrong(senha)) {
        return res.status(400).send({ mensagem: "A nova senha não cumpre os requisitos de segurança." });
    }

    try {
        const senhaHash = await bcrypt.hash(senha, 10);

        await Entidade.Funcionario.update(
            {
                senha: senhaHash,
                precisa_alterar_senha: false
            },
            { where: { id: id } }
        );

        res.status(200).send({ mensagem: "Senha alterada com sucesso!" });
    } catch (error) {
        handleServerError(res, error);
    }
};