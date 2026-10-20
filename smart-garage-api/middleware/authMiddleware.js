const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'seu_segredo_super_secreto' || secret.includes('sua_chave_mestra')) {
        if (process.env.NODE_ENV === 'production') {
            console.error('⚠️ [ALERTA DE SEGURANÇA]: JWT_SECRET fraco ou não definido no .env em ambiente de produção!');
        }
    }
    return secret || 'smart_garage_fallback_secret_do_not_use_in_prod';
};

const verifyToken = (req, res, next) => {
    // Pega o token dos cookies
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).send({ mensagem: "Acesso negado. Nenhum token fornecido." });
    }

    try {
        const secret = getJwtSecret();
        const decoded = jwt.verify(token, secret);

        req.user = decoded;

        // Sliding Session: Renovar o token para manter a sessão ativa enquanto navega
        const novoToken = jwt.sign(
            {
                id: decoded.id,
                nome: decoded.nome,
                role: decoded.role,
                super_admin: decoded.super_admin || false,
                precisa_alterar_senha: decoded.precisa_alterar_senha
            },
            secret,
            { expiresIn: '15m' }
        );

        // Atualizar o cookie com o novo token
        res.cookie('token', novoToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // +15 minutos
        });

        next();
    } catch (error) {
        console.error('Erro de verificação do token:', error.name, error.message);
        return res.status(401).send({ mensagem: "Sessão expirada. Faça login novamente." });
    }
};

const isGerente = (req, res, next) => {
    if (req.user && (req.user.role === 'gerente' || req.user.role === 'super_admin' || req.user.super_admin === true)) {
        next();
    } else {
        return res.status(403).send({ mensagem: "Acesso negado. Rota exclusiva para gerentes." });
    }
};

const isSuperAdmin = (req, res, next) => {
    if (req.user && (req.user.role === 'super_admin' || req.user.super_admin === true)) {
        next();
    } else {
        return res.status(403).send({ mensagem: "Acesso negado. Rota exclusiva para o Super Administrador." });
    }
};

module.exports = {
    verifyToken,
    isGerente,
    isSuperAdmin,
    getJwtSecret
};