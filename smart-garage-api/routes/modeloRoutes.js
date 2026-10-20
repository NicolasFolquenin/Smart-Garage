const express = require('express');
const router = express.Router();
const modeloController = require("../controllers/modeloController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.verifyToken);

router.get("/", modeloController.getAllModelos);
router.post("/", authMiddleware.isGerente, modeloController.createModelo);
router.get('/por-marca/:marcaId', modeloController.getModelosByMarca);
router.get('/:id', modeloController.getModeloById);
router.put('/:id', authMiddleware.isGerente, modeloController.updateModelo);

module.exports = router;