const express = require("express");
const router = express.Router();
const vendaController = require("../controllers/vendaController");
const authMiddleware = require("../middleware/authMiddleware");

// Todas as rotas de vendas exigem autenticação
router.use(authMiddleware.verifyToken);

router.get("/", vendaController.getAllVendas);
router.get("/data", vendaController.getAllVendasOrderByData);
router.get('/detalhes/:id', vendaController.getVendaDetalhesById);
router.get("/:id", vendaController.getVendaById);
router.post("/", vendaController.createVenda);
router.put('/:id', authMiddleware.isGerente, vendaController.updateVenda);
router.delete('/:id', authMiddleware.isGerente, vendaController.deleteVenda);

module.exports = router;