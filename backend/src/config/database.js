const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

async function getDbConnection() {
  // Abre a conexão com o banco de dados local (cria o arquivo se não existir)
  const db = await open({
    filename: process.env.DB_FILENAME || path.join(__dirname, '../../bigu_rural.sqlite'),
    driver: sqlite3.Database
  });

  // Criar as tabelas caso não existam
  await db.exec(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      matricula TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL CHECK (email LIKE '%@ufrpe.br'),
      senha_hash TEXT NOT NULL,
      is_verified BOOLEAN DEFAULT 0,
      verification_token TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS caronas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motorista_id INTEGER,
      origem TEXT NOT NULL,
      destino TEXT NOT NULL,
      vagas INTEGER NOT NULL CHECK (vagas >= 0),
      horario TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (motorista_id) REFERENCES usuarios(id) ON DELETE CASCADE
    );
  `);

  return db;
}

module.exports = getDbConnection;