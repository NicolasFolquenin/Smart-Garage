const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {

    // Pega o token do header da requisição
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {

        return res.status(401).send({ mensagem: "Acesso negado. Nenhum token fornecido." });
    }

    try {
        // Verifica se o token é válido usando o mesmo segredo do login
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'exemplo_de_string_longa');

        req.user = decoded;

        next();
    } catch (error) {
        console.error('Erro de verificação do token:', error.name, error.message);
        return res.status(400).send({ mensagem: "Token inválido." });
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