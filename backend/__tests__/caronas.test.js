const fs = require('fs');
const path = require('path');
const request = require('supertest');
const bcrypt = require('bcrypt');

process.env.DB_FILENAME = path.join(__dirname, 'bigu_rural_caronas_test.sqlite');
process.env.EMAIL_USER = 'email_para_testes';

const { app, inicializarBanco } = require('../index');

let db;
let motoristaId;
let passageiroId;

async function criarUsuario(nome, matricula, email) {
  const senhaHash = await bcrypt.hash('123456', 10);
  const resultado = await db.run(
    `INSERT INTO usuarios (nome, matricula, email, senha_hash, is_verified) VALUES (?, ?, ?, ?, 1)`,
    [nome, matricula, email, senhaHash]
  );
  return resultado.lastID;
}

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
  motoristaId = await criarUsuario('Motorista Teste', 'MOT001', 'motorista@ufrpe.br');
  passageiroId = await criarUsuario('Passageiro Teste', 'PAS001', 'passageiro@ufrpe.br');
});

afterAll(async () => {
  if (db) await db.close();
  try {
    if (fs.existsSync(process.env.DB_FILENAME)) {
      fs.unlinkSync(process.env.DB_FILENAME);
    }
  } catch (e) {}
});

describe('Backend - Caronas Bigu Rural', () => {
  test('deve criar uma carona com dados válidos em POST /api/oferecer', async () => {
    const resposta = await request(app).post('/api/oferecer').send({
      motorista_id: motoristaId,
      origem: 'Recife',
      destino: 'UFRPE',
      data: '2025-10-10',
      horario: '07:00',
      vagas: 3
    });

    expect(resposta.status).toBe(201);
    expect(resposta.body.origem).toBe('Recife');
    expect(resposta.body.destino).toBe('UFRPE');
    expect(resposta.body.vagas).toBe(3);
  });

  test('não deve criar carona sem campos obrigatórios', async () => {
    const resposta = await request(app).post('/api/oferecer').send({
      motorista_id: motoristaId,
      origem: '',
      destino: 'UFRPE',
      data: '2025-10-10',
      horario: '07:00',
      vagas: ''
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain('Campos obrigatórios');
  });

  test('deve listar caronas cadastradas em GET /api/caronas', async () => {
    await request(app).post('/api/oferecer').send({
      motorista_id: motoristaId,
      origem: 'Dois Irmãos',
      destino: 'UFRPE',
      data: '2025-10-10',
      horario: '08:00',
      vagas: 2
    });

    const resposta = await request(app).get('/api/caronas');

    expect(resposta.status).toBe(200);
    expect(Array.isArray(resposta.body)).toBe(true);
    expect(resposta.body[0].motorista_nome).toBe('Motorista Teste');
  });

  test('deve reservar vaga e diminuir a quantidade disponível', async () => {
    const caronaCriada = await request(app).post('/api/oferecer').send({
      motorista_id: motoristaId,
      origem: 'Casa Forte',
      destino: 'UFRPE',
      data: '2025-10-10',
      horario: '09:00',
      vagas: 2
    });

    const resposta = await request(app)
      .patch(`/api/caronas/${caronaCriada.body.id}/reservar`)
      .send({ passageiro_id: passageiroId });

    expect(resposta.status).toBe(200);
    expect(resposta.body.vagas).toBe(1);
  });

  test('não deve reservar vaga quando a carona está esgotada', async () => {
    const resultado = await db.run(
      `INSERT INTO caronas (motorista_id, origem, destino, data, horario, vagas) VALUES (?, ?, ?, ?, ?, ?)`,
      [motoristaId, 'Boa Vista', 'UFRPE', '2025-10-10', '10:00', 0]
    );

    const resposta = await request(app)
      .patch(`/api/caronas/${resultado.lastID}/reservar`)
      .send({ passageiro_id: passageiroId });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toBe('Esgotado!');
  });

  test('deve registrar avaliação válida do motorista', async () => {
    const resposta = await request(app).post('/api/avaliar').send({
      motorista_id: motoristaId,
      passageiro_id: passageiroId,
      nota: 5
    });

    expect(resposta.status).toBe(200);
    expect(resposta.body.message).toContain('Avaliação registrada');
  });

  test('não deve aceitar avaliação fora de 1 a 5', async () => {
    const resposta = await request(app).post('/api/avaliar').send({
      motorista_id: motoristaId,
      passageiro_id: passageiroId,
      nota: 6
    });

    expect(resposta.status).toBe(400);
    expect(resposta.body.error).toContain('1 e 5');
  });
});
