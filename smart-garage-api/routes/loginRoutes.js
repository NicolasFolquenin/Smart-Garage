const express = require('express');
const router = express.Router();
const loginController = require("../controllers/loginController");
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');

// Limite de 5 tentativas de login a cada 15 minutos por IP
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 5,
    message: { mensagem: "Muitas tentativas de login a partir deste IP, por favor tente novamente após 15 minutos." }
});

// Limite de 3 tentativas de recuperar senha a cada 60 minutos por IP
const resetPasswordLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 3,
    message: { mensagem: "Muitas solicitações de redefinição de senha, por favor tente novamente após uma hora." }
});

router.post('/', loginLimiter, loginController.login);

router.post('/logout', loginController.logout);

router.get('/me', authMiddleware.verifyToken, loginController.me);

router.post('/esqueci-senha', resetPasswordLimiter, loginController.solicitarResetSenha);

router.post('/resetar-senha/:token', loginController.resetarSenha);

module.exports = router;