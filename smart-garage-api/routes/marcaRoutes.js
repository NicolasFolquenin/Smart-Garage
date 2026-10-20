const express = require('express');
const router = express.Router();
const marcaController = require("../controllers/marcaController");
const authMiddleware = require("../middleware/authMiddleware");

router.use(authMiddleware.verifyToken);

router.get("/", marcaController.getAllMarcas);
router.post("/", authMiddleware.isGerente, marcaController.createMarca);
router.get('/:id', marcaController.getMarcaById);
router.put('/:id', authMiddleware.isGerente, marcaController.updateMarca);

module.exports = router;
