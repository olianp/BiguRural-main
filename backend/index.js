require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const getDbConnection = require('./src/config/database');
const rideRoutes = require('./src/routes/rideRoutes');
const authRoutes = require('./src/routes/authRoutes');
const mapsRoutes = require('./src/routes/mapsRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// --- Configuração do Servidor HTTP e Socket.io ---
const server = http.createServer(app); 
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"]
  }
});

// Lógica de comunicação em tempo real
io.on('connection', (socket) => {
  console.log(`Usuário conectado no Chat: ${socket.id}`);

  socket.on('entrar_sala', (carona_id) => {
    socket.join(carona_id);
  });

  socket.on('enviar_mensagem', async (data) => {
    try {
      const db = await getDbConnection();
      // Salva a mensagem no banco de dados SQLite
      await db.run(
        `INSERT INTO mensagens (carona_id, remetente_id, remetente_nome, texto) VALUES (?, ?, ?, ?)`,
        [data.carona_id, data.remetente_id, data.remetente_nome, data.texto]
      );
      // Emite a mensagem para todos na sala (menos para quem enviou)
      socket.to(data.carona_id).emit('receber_mensagem', data);
    } catch (error) {
      console.error("Erro ao salvar mensagem no banco:", error);
    }
  });

  socket.on('disconnect', () => {
    console.log("Usuário saiu do chat");
  });
});

// --- Registro das Rotas ---
app.use('/api/auth', authRoutes);
app.use('/api', rideRoutes);
app.use('/api/maps', mapsRoutes);

// Rota para buscar o histórico de mensagens de uma carona
app.get('/api/mensagens/:carona_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const mensagens = await db.all('SELECT * FROM mensagens WHERE carona_id = ? ORDER BY created_at ASC', [req.params.carona_id]);
    res.json(mensagens);
  } catch (error) {
    console.error("Erro ao buscar histórico do chat:", error);
    res.status(500).json({ error: "Erro ao buscar mensagens" });
  }
});

// Rota para buscar as solicitações (reservas) feitas nas caronas do motorista
app.get('/api/solicitacoes/pendentes/:motorista_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const solicitacoes = await db.all(`
      SELECT r.id as reserva_id, u.id as passageiro_id, u.nome, u.matricula as curso, 
             c.id as carona_id, c.origem, c.destino, c.vagas
      FROM reservas r
      JOIN caronas c ON r.carona_id = c.id
      JOIN usuarios u ON r.passageiro_id = u.id
      WHERE c.motorista_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.motorista_id]);
    res.json(solicitacoes);
  } catch (error) {
    console.error("Erro ao buscar solicitações pendentes:", error);
    res.status(500).json({ error: "Erro ao buscar solicitações pendentes" });
  }
});

// Rota para buscar as caronas que o usuário solicitou (reservas)
app.get('/api/reservas/minhas/:passageiro_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const reservas = await db.all(`
      SELECT r.id as reserva_id, r.carona_id, r.passageiro_id, r.created_at,
             c.origem, c.destino, c.data, c.horario, c.vagas, c.motorista_id, u.nome as motorista_nome
      FROM reservas r
      JOIN caronas c ON r.carona_id = c.id
      JOIN usuarios u ON c.motorista_id = u.id
      WHERE r.passageiro_id = ?
      ORDER BY r.created_at DESC
    `, [req.params.passageiro_id]);
    res.json(reservas);
  } catch (error) {
    console.error("Erro ao buscar reservas do passageiro:", error);
    res.status(500).json({ error: "Erro ao buscar reservas" });
  }
});

// Rota para salvar a avaliação com comentário
app.post('/api/avaliacoes/nova', async (req, res) => {
  try {
    const { motorista_id, passageiro_id, nota, comentario } = req.body;
    const db = await getDbConnection();
    await db.run(
      `INSERT INTO avaliacoes (motorista_id, passageiro_id, nota, comentario) VALUES (?, ?, ?, ?)`,
      [motorista_id, passageiro_id, nota, comentario]
    );
    res.json({ message: "Avaliação salva com sucesso!" });
  } catch (error) {
    console.error("Erro ao salvar avaliação:", error);
    res.status(500).json({ error: "Erro ao salvar avaliação" });
  }
});

// Rota para buscar as avaliações que o motorista recebeu
app.get('/api/avaliacoes/minhas/:motorista_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const avaliacoes = await db.all(`
      SELECT a.*, u.nome as passageiro_nome 
      FROM avaliacoes a
      JOIN usuarios u ON a.passageiro_id = u.id
      WHERE a.motorista_id = ?
      ORDER BY a.created_at DESC
    `, [req.params.motorista_id]);
    res.json(avaliacoes);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    res.status(500).json({ error: "Erro ao buscar avaliações" });
  }
});

// Rota para listar os motivos de denúncia predefinidos no banco
app.get('/api/denuncias/motivos', async (req, res) => {
  try {
    const db = await getDbConnection();
    const motivos = await db.all('SELECT * FROM motivos_denuncia');
    res.json(motivos);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar motivos" });
  }
});

// Rota para listar apenas os motoristas com quem este passageiro já viajou
app.get('/api/denuncias/motoristas/:passageiro_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const motoristas = await db.all(`
      SELECT DISTINCT u.id, u.nome
      FROM reservas r
      JOIN caronas c ON r.carona_id = c.id
      JOIN usuarios u ON c.motorista_id = u.id
      WHERE r.passageiro_id = ?
    `, [req.params.passageiro_id]);
    res.json(motoristas);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar motoristas" });
  }
});

// Rota para registrar e salvar a denúncia oficial
app.post('/api/denuncias', async (req, res) => {
  try {
    const { denunciante_id, denunciado_id, motivo_id, texto } = req.body;
    const db = await getDbConnection();
    await db.run(
      `INSERT INTO denuncias (denunciante_id, denunciado_id, motivo_id, texto) VALUES (?, ?, ?, ?)`,
      [denunciante_id, denunciado_id, motivo_id, texto]
    );
    res.json({ message: "Denúncia registrada com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao registrar denúncia" });
  }
});

// Rota para listar todas as denúncias para o Administrador
app.get('/api/admin/denuncias', async (req, res) => {
  try {
    const db = await getDbConnection();
    const denuncias = await db.all(`
      SELECT d.id, u1.nome as denunciante, u2.id as denunciado_id, u2.nome as denunciado,
             m.descricao as motivo, d.texto, d.created_at
      FROM denuncias d
      JOIN usuarios u1 ON d.denunciante_id = u1.id
      JOIN usuarios u2 ON d.denunciado_id = u2.id
      JOIN motivos_denuncia m ON d.motivo_id = m.id
      ORDER BY d.created_at DESC
    `);
    res.json(denuncias);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar denúncias" });
  }
});

// Rota para banir um usuário
app.delete('/api/admin/banir/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM usuarios WHERE id = ?', [req.params.id]); // Deleta o usuário
    await db.run('DELETE FROM caronas WHERE motorista_id = ?', [req.params.id]); // Remove as caronas dele
    await db.run('DELETE FROM denuncias WHERE denunciado_id = ?', [req.params.id]); // Limpa da lista de denúncias
    res.json({ message: "Usuário banido e removido do sistema com sucesso." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao banir usuário" });
  }
});

// Rota para ignorar/excluir denúncia sem banir
app.delete('/api/admin/denuncias/:id', async (req, res) => {
  try {
    const db = await getDbConnection();
    await db.run('DELETE FROM denuncias WHERE id = ?', [req.params.id]);
    res.json({ message: "Denúncia arquivada." });
  } catch (error) {
    res.status(500).json({ error: "Erro ao excluir denúncia" });
  }
});

// Rota para cadastrar veículo
app.post('/api/veiculos', async (req, res) => {
  try {
    const { motorista_id, modelo, placa, cor, vagas } = req.body;
    const db = await getDbConnection();
    await db.run(
      `INSERT INTO veiculos (motorista_id, modelo, placa, cor, vagas) VALUES (?, ?, ?, ?, ?)`,
      [motorista_id, modelo, placa, cor, vagas]
    );
    res.json({ message: "Veículo cadastrado com sucesso!" });
  } catch (error) {
    console.error("Erro ao cadastrar veículo:", error);
    res.status(500).json({ error: "Erro ao cadastrar veículo" });
  }
});

// Rota para buscar veículos do motorista
app.get('/api/veiculos/meus/:motorista_id', async (req, res) => {
  try {
    const db = await getDbConnection();
    const veiculos = await db.all('SELECT * FROM veiculos WHERE motorista_id = ?', [req.params.motorista_id]);
    res.json(veiculos);
  } catch (error) {
    console.error("Erro ao buscar veículos:", error);
    res.status(500).json({ error: "Erro ao buscar veículos" });
  }
});

// Rota principal para evitar o erro "Cannot GET /" no navegador
app.get('/', (req, res) => {
  res.send('🚗 Bem-vindo à API do Bigu Rural! O servidor backend está funcionando perfeitamente.');
});

async function inicializarBanco() {
  const db = await getDbConnection();

  // Garante que a tabela de reservas exista no banco de dados
  await db.run(`
    CREATE TABLE IF NOT EXISTS reservas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carona_id INTEGER,
      passageiro_id INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante que a tabela de avaliações exista no banco de dados
  await db.run(`
    CREATE TABLE IF NOT EXISTS avaliacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motorista_id INTEGER,
      passageiro_id INTEGER,
      nota INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Adiciona a coluna comentario se não existir (evita erro caso a tabela já exista)
  try {
    await db.run(`ALTER TABLE avaliacoes ADD COLUMN comentario TEXT`);
  } catch (e) {
    // Ignora silenciosamente se a coluna já existir no SQLite
  }

  // Garante que a tabela caronas possua as colunas de data e horário (para ambientes novos ou atualizados)
  try {
    await db.run(`ALTER TABLE caronas ADD COLUMN data TEXT`);
  } catch (e) {}
  try {
    await db.run(`ALTER TABLE caronas ADD COLUMN horario TEXT`);
  } catch (e) {}

  // Garante que a tabela de mensagens do chat exista no banco de dados
  await db.run(`
    CREATE TABLE IF NOT EXISTS mensagens (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      carona_id INTEGER,
      remetente_id INTEGER,
      remetente_nome TEXT,
      texto TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante a criação da Tabela de Motivos de Denúncia
  await db.run(`
    CREATE TABLE IF NOT EXISTS motivos_denuncia (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao TEXT
    )
  `);

  // Popula os motivos predefinidos se a tabela estiver vazia
  const motivosCount = await db.get(`SELECT COUNT(*) as count FROM motivos_denuncia`);
  if (motivosCount.count === 0) {
    const motivos = ['Atraso excessivo', 'Comportamento inadequado', 'Informações falsas', 'Problemas com o veículo', 'Outro'];
    for (const motivo of motivos) {
      await db.run(`INSERT INTO motivos_denuncia (descricao) VALUES (?)`, [motivo]);
    }
  }

  // Garante a criação da Tabela de Denúncias real
  await db.run(`
    CREATE TABLE IF NOT EXISTS denuncias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      denunciante_id INTEGER,
      denunciado_id INTEGER,
      motivo_id INTEGER,
      texto TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante a criação da Tabela de Relatórios
  await db.run(`
    CREATE TABLE IF NOT EXISTS relatorio (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      matricula TEXT,
      email TEXT,
      media_avaliacao TEXT,
      total_avaliacoes INTEGER,
      co2_poupado TEXT,
      valor_sugerido TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Garante a criação da Tabela de Veículos
  await db.run(`
    CREATE TABLE IF NOT EXISTS veiculos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      motorista_id INTEGER,
      modelo TEXT,
      placa TEXT,
      cor TEXT,
      vagas INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return db;
}

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  server.listen(PORT, async () => {
    console.log(`Servidor do Bigu Rural rodando na porta ${PORT} com Socket.io ativado! 🚀`);
    try {
      await inicializarBanco();
      console.log('Banco de dados SQLite inicializado e arquivo criado com sucesso!');
    } catch (error) {
      console.error('Erro ao inicializar o banco de dados:', error);
    }
  });
}

module.exports = { app, inicializarBanco };