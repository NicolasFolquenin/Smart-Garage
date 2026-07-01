const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');


router.post('/verificar', clienteController.verificarDuplicidade);
router.get('/', clienteController.getAllDetalhado);
router.post('/', clienteController.createCliente);
router.get("/detalhado/:id", clienteController.getByIdDetalhado)
router.get('/:id', clienteController.getClienteById);
router.put("/:id", clienteController.update)





module.exports = router;