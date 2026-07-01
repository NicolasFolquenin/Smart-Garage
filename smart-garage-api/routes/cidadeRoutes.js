const express = require('express');
const router = express.Router();
const cidadeController = require('../controllers/cidadeController');

router.get('/', cidadeController.getAllCidades);
router.post('/', cidadeController.createCidade);

module.exports = router;