const express = require('express');
const router = express.Router();
const relatorioController = require('../controllers/relatorioController');
const authMiddleware = require('../middleware/authMiddleware');

// Relatórios financeiros exclusivos para gerentes
router.use(authMiddleware.verifyToken, authMiddleware.isGerente);

router.get('/', relatorioController.gerarRelatorio);

module.exports = router;