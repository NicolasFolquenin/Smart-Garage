const express = require('express');
const router = express.Router();
const funcionarioController = require("../controllers/funcionarioController");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isGerente, funcionarioController.createFuncionario);
router.post('/alterar-senha', authMiddleware.verifyToken, funcionarioController.alterarSenhaLogado);
router.get('/', authMiddleware.verifyToken, authMiddleware.isGerente, funcionarioController.getAllFuncionarios);

module.exports = router;