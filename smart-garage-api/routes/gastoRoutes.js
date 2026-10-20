const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', gastoController.getAllGastos);
router.get('/data', gastoController.getAllGastosOrderByData);
router.get('/detalhes/:id', gastoController.getGastoDetalhesById);
router.get('/:id', gastoController.getGastoById);
router.post('/', authMiddleware.isGerente, gastoController.createGasto);
router.put('/:id', authMiddleware.isGerente, gastoController.updateGasto);
router.delete('/:id', authMiddleware.isGerente, gastoController.deleteGasto);

module.exports = router;