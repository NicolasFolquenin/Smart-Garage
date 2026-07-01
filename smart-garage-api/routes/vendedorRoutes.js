const express = require("express");
const router = express.Router();
const vendedorController = require("../controllers/vendedorController");
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware.verifyToken, authMiddleware.isGerente, vendedorController.create);

router.get('/', authMiddleware.verifyToken, authMiddleware.isGerente, vendedorController.getAll);

router.get("/:id", authMiddleware.verifyToken, authMiddleware.isGerente, vendedorController.findByFuncionarioid);

router.patch('/:id/status', authMiddleware.verifyToken, authMiddleware.isGerente, vendedorController.updateStatus);

// Rota para atualizar os dados de um vendedor.
// router.put('/:id', authMiddleware.verifyToken, authMiddleware.isGerente, vendedorController.update);


module.exports = router;