const express = require("express");
const router = express.Router();
const comissaoController = require("../controllers/comissaoController");
const authMiddleware = require('../middleware/authMiddleware');


router.get('/', authMiddleware.verifyToken, comissaoController.getAll);
router.put('/', authMiddleware.verifyToken, authMiddleware.isGerente, comissaoController.updateAll);

module.exports = router;