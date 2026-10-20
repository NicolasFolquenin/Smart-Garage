const express = require('express');
const router = express.Router();
const trocaController = require('../controllers/trocaController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', trocaController.getAllTrocas);
router.get('/data', trocaController.getAllTrocasOrderByData);
router.post('/', trocaController.createTroca);
router.get('/detalhes/:id', trocaController.getTrocaDetalhesById);
router.get('/:id', trocaController.getTrocaById);
router.put('/:id', authMiddleware.isGerente, trocaController.updateTroca);
router.delete('/:id', authMiddleware.isGerente, trocaController.deleteTroca);

module.exports = router;