const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    // Pega o token dos cookies
    const token = req.cookies?.token;

    if (!token) {
        return res.status(401).send({ mensagem: "Acesso negado. Nenhum token fornecido." });
    }

    try {
        // Verifica se o token é válido
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'seu_segredo_super_secreto');

        req.user = decoded;

        // Sliding Session: Gerar um novo token para estender o tempo
        const novoToken = jwt.sign(
            {
                id: decoded.id,
                nome: decoded.nome,
                role: decoded.role,
                precisa_alterar_senha: decoded.precisa_alterar_senha
            },
            process.env.JWT_SECRET || 'seu_segredo_super_secreto',
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
    if (req.user && req.user.role === 'gerente') {
        next();
    } else {
        return res.status(403).send({ mensagem: "Acesso negado. Rota exclusiva para gerentes." });
    }
};

module.exports = {
    verifyToken,
    isGerente
};