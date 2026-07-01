const express = require("express");
const router = express.Router();
const juridicaController = require("../controllers/juridicaController");

router.get('/', juridicaController.getAllJuridica);
router.post('/verificar', juridicaController.verificarDuplicidade);
router.get('/:identificacao', juridicaController.getJuridicaByCnpj);
router.get('/:id', juridicaController.getJuridicaById);
router.post('/', juridicaController.createJuridica);

module.exports = router;