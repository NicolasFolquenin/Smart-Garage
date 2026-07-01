const express = require('express');
const router = express.Router();
const funcionarioController = require("../controllers/funcionarioController");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', funcionarioController.createFuncionario);
router.post('/alterar-senha', authMiddleware.verifyToken, funcionarioController.alterarSenhaLogado);
router.get('/', funcionarioController.getAllFuncionarios);

module.exports = router;