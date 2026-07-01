// src/controllers/loginController.js
const { Op } = require("sequelize");
const { Sequelize } = require("../db");
const Entidade = require("../models/index");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const emailService = require('../services/emailService');

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

exports.login = async (req, res) => {
    const { usuario, senha } = req.body;

    if (!usuario || !senha) {
        return res.status(400).send({ mensagem: "Usuário e senha são obrigatórios." });
    }

    try {

        const funcionario = await Entidade.Funcionario.findOne({ where: { usuario } });
        if (!funcionario) {
            return res.status(404).send({ mensagem: "Usuário ou senha inválidos." });
        }

        if (!funcionario.ativo) {
            return res.status(403).send({ mensagem: "Este usuário está inativo." });
        }

        // Comparar a senha enviada com a senha hasheada no banco
        const senhaValida = await bcrypt.compare(senha, funcionario?.senha);

        if (!senhaValida) {
            return res.status(401).send({ mensagem: "Usuário ou senha inválidos." });
        }

        // Descobrir o papel (role) do funcionário
        let role = null;

        const gerente = await Entidade.Gerente.findOne({
            where: { funcionarioId: funcionario.id }
        });

        if (gerente) {
            role = 'gerente';
        } else {

            const vendedor = await Entidade.Vendedor.findOne({
                where: { funcionarioId: funcionario.id }
            });

            if (vendedor) {
                role = 'vendedor';
            }
        }

        if (!role) {
            return res.status(403).send({ mensagem: "Funcionário sem cargo definido." });
        }

        // Gera o Token JWT
        const token = jwt.sign(
            {
                id: funcionario?.id,
                nome: funcionario?.nome,
                role: role,
                precisa_alterar_senha: funcionario.precisa_alterar_senha
            },
            process.env.JWT_SECRET || 'seu_segredo_super_secreto',
            { expiresIn: '8h' }
        );

        // 5. Enviar o token para o cliente
        res.status(200).send({
            mensagem: "Login bem-sucedido!",
            token: token
        });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).send({ erro: 'Um erro ocorreu no servidor.' });
    }
};

exports.solicitarResetSenha = async (req, res) => {
    const { usuario } = req.body;

    try {
        const funcionario = await Entidade.Funcionario.findOne({ where: { usuario } });

        if (!funcionario) {
            return res.status(200).send({ mensagem: "Se um usuário com este nome existir, um e-mail de redefinição foi enviado." });
        }

        // Gera um token aleatório e seguro
        const token = crypto.randomBytes(20).toString('hex');

        // Define a data de expiração para 1 hora a partir de agora
        const expires = new Date(Date.now() + 3600000);

        // Salva o token e a data de expiração no registro do funcionário
        funcionario.resetPasswordToken = token;
        funcionario.resetPasswordExpires = expires;
        await funcionario.save();

        // Envia o e-mail
        await emailService.enviarEmailResetSenha(funcionario.email, token);

        res.status(200).send({ mensagem: "Se um usuário com este nome existir, um e-mail de redefinição foi enviado." });

    } catch (error) {
        handleServerError(res, error);
    }
};

exports.resetarSenha = async (req, res) => {
    const { token } = req.params;
    const { senha } = req.body;

    if (!isPasswordStrong(senha)) {
        return res.status(400).send({ mensagem: "A senha não cumpre os requisitos de segurança." });
    }

    try {
        const funcionario = await Entidade.Funcionario.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Sequelize.Op.gt]: Date.now() } // Verifica se o token não expirou
            }
        });

        if (!funcionario) {
            return res.status(400).send({ mensagem: "Token de redefinição inválido ou expirado." });
        }

        const senhaHash = await bcrypt.hash(senha, 10);
        funcionario.senha = senhaHash;
        funcionario.resetPasswordToken = null;
        funcionario.resetPasswordExpires = null;
        await funcionario.save();

        res.status(200).send({ mensagem: "Senha redefinida com sucesso!" });

    } catch (error) {
        handleServerError(res, error);
    }
};