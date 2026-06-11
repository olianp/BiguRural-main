const express = require('express');
const router = express.Router();
const rideController = require('../controllers/rideController');

// --- Definição das Rotas do Sistema UFRPE-Ride ---

// Rota para listar todas as caronas (Read)
router.get('/caronas', rideController.listar);

// Rota para buscar detalhes de UMA carona (Read)
router.get('/caronas/:id', rideController.detalhes);

// Rota para cadastrar nova carona (Create)
router.post('/oferecer', rideController.oferecer);

// Rota para editar informações de uma carona (Update)
router.put('/caronas/:id', rideController.editar);

// Rota para remover uma carona do sistema (Delete)
router.delete('/caronas/:id', rideController.deletar);

// Rota específica para o requisito de reserva (Partial Update)
router.patch('/caronas/:id/reservar', rideController.reservar);

// Rota para buscar as caronas que um usuário reservou
router.get('/reservas/:passageiro_id', rideController.buscarReservas);

// Rota para cancelar uma reserva
router.delete('/reservas/:id', rideController.cancelarReserva);

// Rota para finalizar a carona e calcular CO2
router.patch('/caronas/:id/finalizar', rideController.finalizar);

// Rota para registrar avaliação do motorista
router.post('/avaliar', rideController.avaliarMotorista);

module.exports = router;