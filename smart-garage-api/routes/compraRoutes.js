const express = require('express');
const router = express.Router();
const compraController = require('../controllers/compraController');
const authMiddleware = require('../middleware/authMiddleware');

// Rotas de compras exclusivas para gerentes
router.use(authMiddleware.verifyToken, authMiddleware.isGerente);

router.get('/', compraController.getAllCompras);
router.get('/data', compraController.getAllComprasOrderByData);
router.post('/', compraController.createCompra);
router.get('/detalhes/:id', compraController.getCompraDetalhesById);
router.get('/:id', compraController.getCompraById);
router.put('/:id', compraController.updateCompra);
router.delete('/:id', compraController.deleteCompra);

module.exports = router;