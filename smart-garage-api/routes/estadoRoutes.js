const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', estadoController.getAllEstados);
router.post('/', authMiddleware.isGerente, estadoController.createEstado);

module.exports = router;