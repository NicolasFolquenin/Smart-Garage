const express = require('express');
const router = express.Router();
const manutencaoController = require('../controllers/manutencaoController');

router.get('/', manutencaoController.getAllManutencoes);
router.get("/dataenvio", manutencaoController.getAllManutencoesOrderByData);
router.get('/ativo', manutencaoController.getAllManutencoesAtivas);
router.get('/inativo', manutencaoController.getAllManutencoesInativas);
router.get('/detalhes/:id', manutencaoController.getManutencaoDetalhesById);
router.get('/:id', manutencaoController.getManutencaoById);
router.post('/', manutencaoController.createManutencao);
router.put('/finalizar/:id', manutencaoController.finalizarManutencao);
router.put('/:id', manutencaoController.updateManutencao);
router.delete('/:id', manutencaoController.deleteManutencao);

module.exports = router;