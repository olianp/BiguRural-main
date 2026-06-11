const getDbConnection = require('../config/database');

const rideController = {
  // GET - Listar todas as caronas
  async listar(req, res) {
    try {
      const db = await getDbConnection();
      // Agora a busca já traz o nome do motorista junto!
      const caronas = await db.all(`
        SELECT 
          c.*, 
          u.nome as motorista_nome 
        FROM caronas c
        JOIN usuarios u ON c.motorista_id = u.id
        ORDER BY c.created_at DESC
      `);
      res.json(caronas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // GET - Detalhes de uma carona específica
  async detalhes(req, res) {
    const { id } = req.params;
    try {
      const db = await getDbConnection();
      const carona = await db.get(`
        SELECT c.*, u.nome as motorista_nome FROM caronas c
        JOIN usuarios u ON c.motorista_id = u.id
        WHERE c.id = ?
      `, [id]);

      if (carona) res.json(carona);
      else res.status(404).json({ error: 'Carona não encontrada.' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST - Criar nova carona
  async oferecer(req, res) {
    const { motorista_id, origem, destino, data, vagas, horario } = req.body;
    
    if (!origem || !destino || !data || !vagas) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando.' });
    }

    try {
      const db = await getDbConnection();
      const result = await db.run(
        `INSERT INTO caronas (motorista_id, origem, destino, data, horario, vagas) VALUES (?, ?, ?, ?, ?, ?)`,
        [motorista_id, origem, destino, data, horario, parseInt(vagas)]
      );

      const novaCarona = await db.get(`SELECT * FROM caronas WHERE id = ?`, [result.lastID]);
      res.status(201).json(novaCarona);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // PUT - Editar carona (Apenas vagas e horário)
  async editar(req, res) {
    const { id } = req.params;
    const { vagas, horario } = req.body; // Proteção: ignoramos origem/destino aqui

    try {
      const db = await getDbConnection();
      await db.run(
        `UPDATE caronas SET vagas = ?, horario = ? WHERE id = ?`,
        [parseInt(vagas), horario, id]
      );

      const caronaAtualizada = await db.get(`SELECT * FROM caronas WHERE id = ?`, [id]);
      res.json(caronaAtualizada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // DELETE - Remover carona
  async deletar(req, res) {
    const { id } = req.params;
    try {
      const db = await getDbConnection();
      await db.run(`DELETE FROM caronas WHERE id = ?`, [id]);
      
      res.json({ message: "Carona removida!" });
    } catch (error) {
      res.status(400).json({ error: "Erro ao excluir carona." });
    }
  },

  // PATCH - Reservar vaga (Lógica de Negócio)
  async reservar(req, res) {
    const { id } = req.params;
    const { passageiro_id } = req.body; // Pega o ID de quem solicitou a vaga

    try {
      const db = await getDbConnection();
      const carona = await db.get(`SELECT vagas FROM caronas WHERE id = ?`, [id]);

      if (!carona) return res.status(404).json({ error: "Não encontrada" });
      if (carona.vagas <= 0) return res.status(400).json({ error: "Esgotado!" });

      await db.run(`UPDATE caronas SET vagas = vagas - 1 WHERE id = ?`, [id]);
      
      // Registra a pessoa que pegou a vaga
      if (passageiro_id) {
        await db.run(`INSERT INTO reservas (carona_id, passageiro_id) VALUES (?, ?)`, [id, passageiro_id]);
      }

      const caronaAtualizada = await db.get(`SELECT * FROM caronas WHERE id = ?`, [id]);

      res.json(caronaAtualizada);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },

  // GET - Buscar reservas de um passageiro
  async buscarReservas(req, res) {
    const { passageiro_id } = req.params;
    try {
      const db = await getDbConnection();
      const reservas = await db.all(`
        SELECT c.*, u.nome as motorista_nome, r.id as reserva_id 
        FROM reservas r
        JOIN caronas c ON r.carona_id = c.id
        JOIN usuarios u ON c.motorista_id = u.id
        WHERE r.passageiro_id = ?
        ORDER BY r.created_at DESC
      `, [passageiro_id]);
      res.json(reservas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // DELETE - Cancelar reserva
  async cancelarReserva(req, res) {
    const { id } = req.params; // ID da reserva (r.id)
    try {
      const db = await getDbConnection();
      const reserva = await db.get('SELECT carona_id FROM reservas WHERE id = ?', [id]);
      
      if (!reserva) return res.status(404).json({ error: "Reserva não encontrada." });

      // Remove a reserva
      await db.run('DELETE FROM reservas WHERE id = ?', [id]);
      
      // Devolve a vaga para a carona (+1)
      await db.run('UPDATE caronas SET vagas = vagas + 1 WHERE id = ?', [reserva.carona_id]);

      res.json({ message: "Reserva cancelada com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // PATCH - Finalizar carona e calcular CO2 (REQ12 e REQ13)
  async finalizar(req, res) {
    const { id } = req.params;
    try {
      const db = await getDbConnection();
      const carona = await db.get('SELECT * FROM caronas WHERE id = ?', [id]);
      
      if (!carona) return res.status(404).json({ error: "Carona não encontrada." });

      // Conta quantos passageiros reservaram vaga nesta carona
      const reservas = await db.all('SELECT id FROM reservas WHERE carona_id = ?', [id]);
      const passageiros = reservas.length;

      // "Arquiva" a carona apagando-a das tabelas ativas (Cumpre o REQ13)
      await db.run('DELETE FROM reservas WHERE carona_id = ?', [id]);
      await db.run('DELETE FROM caronas WHERE id = ?', [id]);

      if (passageiros === 0) {
        return res.json({ message: "Carona finalizada. Como não houve passageiros, não houve redução extra de CO2 desta vez.", co2: 0 });
      }

      // Cálculo Simulado de CO2: 15km de distância * 0.12kg (120g) de CO2 * número de passageiros
      const distanciaKm = 15;
      const co2Poupado = distanciaKm * 0.12 * passageiros;

      res.json({ 
        message: `🏁 Carona finalizada com sucesso!\n\n🌱 Juntos, vocês evitaram a emissão de ${co2Poupado.toFixed(2)} kg de CO2 na atmosfera!` 
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // POST - Avaliar motorista
  async avaliarMotorista(req, res) {
    const { motorista_id, passageiro_id, nota } = req.body;
    
    if (!nota || nota < 1 || nota > 5) return res.status(400).json({ error: "A nota deve ser um número entre 1 e 5." });
    
    try {
      const db = await getDbConnection();
      await db.run(
        'INSERT INTO avaliacoes (motorista_id, passageiro_id, nota) VALUES (?, ?, ?)',
        [motorista_id, passageiro_id, nota]
      );
      res.json({ message: "Avaliação registrada com sucesso!" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = rideController;