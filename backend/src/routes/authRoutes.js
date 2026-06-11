const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Rota para cadastro (Gera o Token)
router.post('/cadastro', authController.registrar);

// Rota para login
router.post('/login', authController.login);

// Rota para validação do Token
router.get('/verificar/:token', authController.verificarEmail);

// Rota para editar o perfil
router.put('/perfil/:id', authController.editarPerfil);

// Rota para obter estatísticas do usuário (Avaliação)
router.get('/estatisticas/:id', authController.estatisticas);

// Rota para relatório geral
router.get('/relatorio', authController.relatorioGeral);

// Rotas de recuperação de senha
router.post('/esqueci-senha', authController.esqueciSenha);
router.post('/redefinir-senha', authController.redefinirSenha);

module.exports = router;