const express = require("express");
const router = express.Router();
const vendaController = require("../controllers/vendaController");

router.get("/", vendaController.getAllVendas);
router.get("/data", vendaController.getAllVendasOrderByData);
router.get('/detalhes/:id', vendaController.getVendaDetalhesById);
router.get("/:id", vendaController.getVendaById);
router.post("/", vendaController.createVenda);
router.put('/:id', vendaController.updateVenda);
router.delete('/:id', vendaController.deleteVenda);


module.exports = router;