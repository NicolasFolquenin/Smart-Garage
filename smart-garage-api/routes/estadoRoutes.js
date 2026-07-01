const express = require('express');
const router = express.Router();
const estadoController = require('../controllers/estadoController');

router.get('/', estadoController.getAllEstados);
router.post('/', estadoController.createEstado);

module.exports = router;