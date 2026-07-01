const express = require('express');
const router = express.Router();
const loginController = require("../controllers/loginController");

router.post('/', loginController.login);

router.post('/esqueci-senha', loginController.solicitarResetSenha);

router.post('/resetar-senha/:token', loginController.resetarSenha);

module.exports = router;