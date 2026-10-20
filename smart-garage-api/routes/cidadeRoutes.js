const express = require('express');
const router = express.Router();
const cidadeController = require('../controllers/cidadeController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', cidadeController.getAllCidades);
router.post('/', authMiddleware.isGerente, cidadeController.createCidade);

module.exports = router;