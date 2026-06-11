const express = require('express');
const router = express.Router();
const mapsController = require('../controllers/mapsController');

// Rota POST pois estamos enviando dados complexos do trajeto no body
router.post('/rota', mapsController.calcularRotaSustentavel);

module.exports = router;