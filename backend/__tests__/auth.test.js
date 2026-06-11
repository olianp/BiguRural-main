const fs = require('fs');
const path = require('path');
const request = require('supertest');
const bcrypt = require('bcrypt');

process.env.DB_FILENAME = path.join(__dirname, 'bigu_rural_auth_test.sqlite');
process.env.EMAIL_USER = 'email_para_testes';

const { app, inicializarBanco } = require('../index');

let db;

beforeAll(async () => {
  try {
    if (fs.existsSync(process.env.DB_FILENAME)) {
      fs.unlinkSync(process.env.DB_FILENAME);
    }
  } catch (e) {}
  db = await inicializarBanco();
});

beforeEach(async () => {
  await db.exec('DELETE FROM avaliacoes; DELETE FROM reservas; DELETE FROM caronas; DELETE FROM usuarios;');
});

afterAll(async () => {
  if (db) await db.close();
  try {
    if (fs.existsSync(process.env.DB_FILENAME)) {
      fs.unlinkSync(process.env.DB_FILENAME);
    }
  } catch (e) {}
});

describe('Backend - Autenticação Bigu Rural', () => {
  test('GET / deve informar que a API está funcionando', async () => {
    const resposta = await request(app).get('/');

    expect(resposta.status).toBe(200);
    expect(resposta.text).toContain('Bigu Rural');
  });

  test('deve cadastrar usuário com e-mail institucional @ufrpe.br', async () => {
    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Mariene Santos',
      matricula: '20260001',
      email: 'mariene@ufrpe.br',
      senha: '123456'
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.message).toContain('Usuário criado');
    expect(resposta.body.user).toBe('mariene@ufrpe.br');
  });

  test('não deve cadastrar usuário com e-mail pessoal', async () => {
    const resposta = await request(app).post('/api/auth/cadastro').send({
      nome: 'Usuário Teste',
      matricula: '20260002',
      email: 'usuario@gmail.com',
      senha: '123456'
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain('@ufrpe.br');
  });

  test('não deve fazer login com senha incorreta', async () => {
    const senhaHash = await bcrypt.hash('senha-correta', 10);
    await db.run(
      `INSERT INTO usuarios (nome, matricula, email, senha_hash, is_verified) VALUES (?, ?, ?, ?, 1)`,
      ['Usuário Login', '20260003', 'login@ufrpe.br', senhaHash]
    );

    const resposta = await request(app).post('/api/auth/login').send({
      email: 'login@ufrpe.br',
      senha: 'senha-errada'
    });

    expect(resposta.status).toBe(401);
    expect(resposta.body.error).toBe('Senha incorreta.');
  });

  test('deve fazer login com usuário verificado e senha correta', async () => {
    const senhaHash = await bcrypt.hash('123456', 10);
    await db.run(
      `INSERT INTO usuarios (nome, matricula, email, senha_hash, is_verified) VALUES (?, ?, ?, ?, 1)`,
      ['Usuário Verificado', '20260004', 'verificado@ufrpe.br', senhaHash]
    );

    const resposta = await request(app).post('/api/auth/login').send({
      email: 'verificado@ufrpe.br',
      senha: '123456'
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.message).toBe('Login realizado com sucesso!');
    expect(resposta.body.user.email).toBe('verificado@ufrpe.br');
    expect(resposta.body.user.senha_hash).toBeUndefined();
  });
});
