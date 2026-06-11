const request = require('supertest');
const { app } = require('../index'); // Importa a aplicação Express

describe('Backend - Testes de Rota e Health Check', () => {
  test('[Sucesso] Deve retornar 200 OK na rota principal (Status do Servidor)', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.text).toContain('Bem-vindo à API do Bigu Rural');
  });

  test('[Falha] Deve retornar erro 404 ao acessar uma rota inexistente', async () => {
    const response = await request(app).get('/api/rota-fantasma-inexistente');
    
    expect(response.status).toBe(404);
  });
});