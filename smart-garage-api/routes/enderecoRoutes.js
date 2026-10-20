const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', enderecoController.getAllEnderecos);
router.post('/', enderecoController.createEndereco);

module.exports = router;