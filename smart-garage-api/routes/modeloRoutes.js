const express = require('express');
const router = express.Router();
const modeloController = require("../controllers/modeloController");

router.get("/", modeloController.getAllModelos);
router.post("/", modeloController.createModelo);
router.get('/por-marca/:marcaId', modeloController.getModelosByMarca);
router.get('/:id', modeloController.getModeloById)
router.put('/:id', modeloController.updateModelo);

module.exports = router;