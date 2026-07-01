const express = require('express');
const router = express.Router();
const gastoController = require('../controllers/gastoController');

router.get('/', gastoController.getAllGastos);
router.get('/data', gastoController.getAllGastosOrderByData);
router.get('/detalhes/:id', gastoController.getGastoDetalhesById);
router.get('/:id', gastoController.getGastoById);
router.post('/', gastoController.createGasto);
router.put('/:id', gastoController.updateGasto);
router.delete('/:id', gastoController.deleteGasto);

module.exports = router;