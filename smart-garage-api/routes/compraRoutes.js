const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');

router.get('/', compraController.getAllCompras);
router.get('/data', compraController.getAllComprasOrderByData);
router.post('/', compraController.createCompra);
router.get('/detalhes/:id', compraController.getCompraDetalhesById);
router.get('/:id', compraController.getCompraById);
router.put('/:id', compraController.updateCompra);
router.delete('/:id', compraController.deleteCompra);


module.exports = router;