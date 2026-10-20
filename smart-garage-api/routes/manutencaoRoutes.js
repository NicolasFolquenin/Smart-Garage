const express = require('express');
const router = express.Router();
const manutencaoController = require('../controllers/manutencaoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', manutencaoController.getAllManutencoes);
router.get("/dataenvio", manutencaoController.getAllManutencoesOrderByData);
router.get('/ativo', manutencaoController.getAllManutencoesAtivas);
router.get('/inativo', manutencaoController.getAllManutencoesInativas);
router.get('/detalhes/:id', manutencaoController.getManutencaoDetalhesById);
router.get('/:id', manutencaoController.getManutencaoById);
router.post('/', manutencaoController.createManutencao);
router.put('/finalizar/:id', authMiddleware.isGerente, manutencaoController.finalizarManutencao);
router.put('/:id', authMiddleware.isGerente, manutencaoController.updateManutencao);
router.delete('/:id', authMiddleware.isGerente, manutencaoController.deleteManutencao);

module.exports = router;