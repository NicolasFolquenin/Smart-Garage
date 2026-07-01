const express = require('express');
const router = express.Router();
const enderecoController = require('../controllers/enderecoController');

router.get('/', enderecoController.getAllEnderecos);
router.post('/', enderecoController.createEndereco);

module.exports = router;