const express = require("express");
const router = express.Router();
const consignacaoController = require("../controllers/consignacaoController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.verifyToken);

router.get("/", consignacaoController.getAllConsignacoes);
router.post("/", consignacaoController.createConsignacao);
router.get("/datainicio", consignacaoController.getAllConsignacoesOrderByData);
router.get('/ativo', consignacaoController.getAllConsignacoesAtivas);
router.get('/inativo', consignacaoController.getAllConsignacoesInativas);
router.get('/automovel/:automovelId', consignacaoController.getConsignacaoByAutomovel);
router.get('/detalhes/:id', consignacaoController.getConsignacaoDetalhesById);
router.get('/:id', consignacaoController.getConsignacaoById);
router.put('/encerrar/:id', authMiddleware.isGerente, consignacaoController.encerrarConsignacao);
router.put('/:id', authMiddleware.isGerente, consignacaoController.updateConsignacao);
router.delete('/:id', authMiddleware.isGerente, consignacaoController.deleteConsignacao);

module.exports = router;