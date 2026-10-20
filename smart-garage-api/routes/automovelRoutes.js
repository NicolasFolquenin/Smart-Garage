const express = require('express');
const router = express.Router();
const automovelController = require("../controllers/automovelController");
const authMiddleware = require('../middleware/authMiddleware');
const upload = require("../config/multer");

// Todas as rotas de automóveis exigem autenticação
router.use(authMiddleware.verifyToken);

router.get('/', automovelController.getAllAutomoveis);
router.post('/', upload.single("file"), automovelController.createAutomovel);
router.post('/verificar', automovelController.verificarDuplicidade);
router.post('/verificar-status', automovelController.verificarStatus);
router.get('/ativo', automovelController.getAllAutomoveisAtivos);
router.get('/inativo', automovelController.getAllAutomoveisInativos);
router.get('/renavam/:renavam', automovelController.getAutomovelByRenavam);
router.get('/placa/:placa', automovelController.getAutomovelByPlaca);
router.get('/detalhes/:id', automovelController.getAutomovelDetalhesById);
router.get('/:id', automovelController.getAutomovelById);
router.put('/:id', upload.single("file"), automovelController.updateAutomovel);
router.delete('/:id', authMiddleware.isGerente, automovelController.deleteAutomovel);

module.exports = router;