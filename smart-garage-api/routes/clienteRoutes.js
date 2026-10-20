const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const authMiddleware = require('../middleware/authMiddleware');

// Todas as rotas de clientes exigem autenticação
router.use(authMiddleware.verifyToken);

router.post('/verificar', clienteController.verificarDuplicidade);
router.get('/', clienteController.getAllDetalhado);
router.post('/', clienteController.createCliente);
router.get("/detalhado/:id", clienteController.getByIdDetalhado);
router.get('/:id', clienteController.getClienteById);
router.put("/:id", clienteController.update);

module.exports = router;