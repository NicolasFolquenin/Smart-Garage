const express = require('express');
const router = express.Router();
const marcaController = require("../controllers/marcaController");

router.get("/", marcaController.getAllMarcas);
router.post("/", marcaController.createMarca);
router.get('/:id', marcaController.getMarcaById);
router.put('/:id', marcaController.updateMarca);


module.exports = router;
