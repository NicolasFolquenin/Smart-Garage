const express = require("express");
const router = express.Router();
const consignacaoController = require("../controllers/consignacaoController");

router.get("/", consignacaoController.getAllConsignacoes);
router.post("/", consignacaoController.createConsignacao);
router.get("/datainicio", consignacaoController.getAllConsignacoesOrderByData);
router.get('/ativo', consignacaoController.getAllConsignacoesAtivas);
router.get('/inativo', consignacaoController.getAllConsignacoesInativas);
router.get('/automovel/:automovelId', consignacaoController.getConsignacaoByAutomovel);
router.get('/detalhes/:id', consignacaoController.getConsignacaoDetalhesById);
router.get('/:id', consignacaoController.getConsignacaoById);
router.put('/encerrar/:id', consignacaoController.encerrarConsignacao);
router.put('/:id', consignacaoController.updateConsignacao);
router.delete('/:id', consignacaoController.deleteConsignacao);


module.exports = router;