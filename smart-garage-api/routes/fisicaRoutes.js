const express = require("express");
const router = express.Router();
const fisicaController = require("../controllers/fisicaController");

router.get('/', fisicaController.getAllFisica);
router.post('/verificar', fisicaController.verificarDuplicidade);
router.get('/:identificacao', fisicaController.getFisicaByCpf);
router.get('/:id', fisicaController.getFisicaById);
router.post('/', fisicaController.createFisica);

module.exports = router;