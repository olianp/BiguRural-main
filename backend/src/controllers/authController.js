const getDbConnection = require('../config/database');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Configuração básica do Nodemailer (Para produção, use as credenciais de um e-mail do projeto)
const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email", // Exemplo com serviço de testes Ethereal
  port: 587,
  secure: false, 
  auth: process.env.EMAIL_USER && process.env.EMAIL_USER !== 'email_para_testes' ? {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  } : undefined, // Evita o erro se o email de teste não estiver configurado
  tls: {
    rejectUnauthorized: false // Permite certificados de teste/autoassinados
  }
});

const authController = {
  // Registrar um usuário e enviar token
  async registrar(req, res) {
    const { nome, matricula, email, senha } = req.body;

    if (!email.endsWith('@ufrpe.br')) {
      return res.status(400).json({ error: 'Apenas e-mails @ufrpe.br são permitidos.' });
    }

    try {
      // Criptografar senha (RNF02)
      const saltRounds = 10;
      const senha_hash = await bcrypt.hash(senha, saltRounds);
      
      // Gerar Token de verificação
      const verification_token = crypto.randomBytes(32).toString('hex');

      const db = await getDbConnection();
      
      // Insere o usuário no SQLite
      await db.run(
        `INSERT INTO usuarios (nome, matricula, email, senha_hash, verification_token) VALUES (?, ?, ?, ?, ?)`,
        [nome, matricula, email, senha_hash, verification_token]
      );

      // Enviar email com o token
      const linkVerificacao = `http://192.168.1.13:3000/api/auth/verificar/${verification_token}`;
      
      // Imprime o link no console para facilitar os testes locais
      console.log(`\n=== NOVO CADASTRO ===`);
      console.log(`Abra este link no navegador para verificar a conta:`);
      console.log(`${linkVerificacao}`);
      console.log(`=====================\n`);

      // Isolamento total do envio de e-mail para não quebrar a requisição principal
      setTimeout(async () => {
        try {
          if (process.env.EMAIL_USER && process.env.EMAIL_USER !== 'email_para_testes') {
            await transporter.sendMail({
              from: '"Bigu Rural" <noreply@bigurural.com>',
              to: email,
              subject: "Verifique seu E-mail Institucional 🚗",
              text: `Olá ${nome}, confirme seu e-mail clicando no link: ${linkVerificacao}`,
            });
          }
        } catch (mailErr) {
          console.log('Aviso (Background): E-mail não enviado - ' + mailErr.message);
        }
      }, 0);

      res.status(201).json({ message: 'Usuário criado! Verifique o terminal para pegar o link de ativação.', user: email });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao registrar usuário: ' + error.message });
    }
  },

  // Verificar a conta através do Token
  async verificarEmail(req, res) {
    const { token } = req.params;

    try {
      const db = await getDbConnection();
      
      // Buscar usuário pelo token
      const usuario = await db.get(`SELECT id FROM usuarios WHERE verification_token = ?`, [token]);

      if (!usuario) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      // Atualizar status de verificação
      await db.run(`UPDATE usuarios SET is_verified = 1, verification_token = NULL WHERE id = ?`, [usuario.id]);

      res.json({ message: 'Conta verificada com sucesso! Você já pode acessar o Bigu Rural.' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao verificar token.' });
    }
  },

  // Realizar o login do usuário
  async login(req, res) {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    try {
      const db = await getDbConnection();
      
      // Buscar usuário pelo email
      const usuario = await db.get(`SELECT * FROM usuarios WHERE email = ?`, [email]);

      if (!usuario) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
      }

      // Verificar se a senha enviada corresponde ao hash do banco
      const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

      if (!senhaValida) {
        return res.status(401).json({ error: 'Senha incorreta.' });
      }

      if (!usuario.is_verified) {
        return res.status(403).json({ error: 'Por favor, verifique seu e-mail antes de fazer login.' });
      }

      // Remover dados sensíveis antes de retornar
      delete usuario.senha_hash;
      delete usuario.verification_token;

      res.json({ message: 'Login realizado com sucesso!', user: usuario });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao realizar login: ' + error.message });
    }
  },

  // Atualizar perfil do usuário
  async editarPerfil(req, res) {
    const { id } = req.params;
    const { nome, matricula } = req.body;

    if (!nome || !matricula) {
      return res.status(400).json({ error: 'Nome e matrícula são obrigatórios.' });
    }

    try {
      const db = await getDbConnection();
      await db.run(
        `UPDATE usuarios SET nome = ?, matricula = ? WHERE id = ?`,
        [nome, matricula, id]
      );

      // Busca o usuário atualizado para retornar e atualizar o localStorage do Frontend
      const usuarioAtualizado = await db.get(`SELECT id, nome, email, matricula, is_verified FROM usuarios WHERE id = ?`, [id]);

      res.json({ message: 'Perfil atualizado com sucesso!', user: usuarioAtualizado });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao atualizar perfil: ' + error.message });
    }
  },

  // GET - Obter estatísticas do usuário (Média de Avaliação e Viagens Publicadas)
  async estatisticas(req, res) {
    const { id } = req.params;
    try {
      const db = await getDbConnection();
      const avaliacoes = await db.get('SELECT AVG(nota) as media, COUNT(id) as total FROM avaliacoes WHERE motorista_id = ?', [id]);
      const caronas = await db.get('SELECT COUNT(id) as total FROM caronas WHERE motorista_id = ?', [id]);
      
      // Cálculo simplificado de CO2 para o MVP:
      // Média de 10km por carona x 3 vagas x 0.15kg de CO2/km = 4.5kg por viagem
      const totalCaronas = caronas.total || 0;
      const co2Poupado = totalCaronas * 4.5;

      res.json({
        media: avaliacoes.media ? parseFloat(avaliacoes.media).toFixed(1) : "Novo",
        totalAvaliacoes: avaliacoes.total || 0,
        viagensPublicadas: totalCaronas,
        co2Poupado: co2Poupado.toFixed(1)
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao buscar estatísticas: ' + error.message });
    }
  },

  // GET - Relatório Geral do Sistema (Usuários e Confiabilidade)
  async relatorioGeral(req, res) {
    try {
      const db = await getDbConnection();
      const usuarios = await db.all('SELECT id, nome, email, matricula FROM usuarios');
      const avaliacoes = await db.all('SELECT motorista_id, AVG(nota) as media, COUNT(id) as total FROM avaliacoes GROUP BY motorista_id');
      const caronas = await db.all('SELECT motorista_id, COUNT(id) as total_viagens FROM caronas GROUP BY motorista_id');
      
      const dados = usuarios.map(u => {
        const aval = avaliacoes.find(a => a.motorista_id === u.id);
        const car = caronas.find(c => c.motorista_id === u.id);
        const totalCaronas = car ? car.total_viagens : 0;
        return {
          nome: u.nome,
          matricula: u.matricula,
          email: u.email,
          media_avaliacao: aval ? parseFloat(aval.media).toFixed(1) : 'Sem avaliações',
          total_avaliacoes: aval ? aval.total : 0,
          co2_poupado: (totalCaronas * 4.5).toFixed(1) + ' kg',
          valor_sugerido: 'R$ 5,00 / viagem'
        };
      });

      // Salvar os dados na tabela 'relatorio' para histórico
      for (const d of dados) {
        await db.run(
          `INSERT INTO relatorio (nome, matricula, email, media_avaliacao, total_avaliacoes, co2_poupado, valor_sugerido) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [d.nome, d.matricula, d.email, d.media_avaliacao, d.total_avaliacoes, d.co2_poupado, d.valor_sugerido]
        );
      }

      res.json(dados);
    } catch (error) {
      res.status(500).json({ error: 'Erro ao gerar relatório: ' + error.message });
    }
  },

  // Solicitar recuperação de senha (Esqueci minha senha)
  async esqueciSenha(req, res) {
    const { email } = req.body;

    if (!email) return res.status(400).json({ error: 'O e-mail é obrigatório.' });

    try {
      const db = await getDbConnection();
      const usuario = await db.get(`SELECT id, nome FROM usuarios WHERE email = ?`, [email]);

      if (!usuario) {
        return res.status(404).json({ error: 'E-mail não encontrado no sistema.' });
      }

      // Adicionar coluna reset_token caso ela não exista no banco ainda
      try {
        await db.run(`ALTER TABLE usuarios ADD COLUMN reset_token TEXT`);
      } catch (e) { /* Coluna já existe, segue em frente */ }

      // Gerar Token de recuperação
      const resetToken = crypto.randomBytes(32).toString('hex');
      await db.run(`UPDATE usuarios SET reset_token = ? WHERE email = ?`, [resetToken, email]);

      // Envia o token para o frontend para a simulação da apresentação
      res.json({ message: 'Instruções enviadas! Redirecionando...', token: resetToken });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao solicitar recuperação: ' + error.message });
    }
  },

  // Salvar a nova senha
  async redefinirSenha(req, res) {
    const { token, novaSenha } = req.body;

    if (!token || !novaSenha) return res.status(400).json({ error: 'Dados incompletos.' });

    try {
      const db = await getDbConnection();
      const usuario = await db.get(`SELECT id FROM usuarios WHERE reset_token = ?`, [token]);

      if (!usuario) {
        return res.status(400).json({ error: 'Token inválido ou expirado.' });
      }

      // Criptografar a nova senha
      const senha_hash = await bcrypt.hash(novaSenha, 10);
      
      // Atualizar no banco e invalidar o token
      await db.run(`UPDATE usuarios SET senha_hash = ?, reset_token = NULL WHERE id = ?`, [senha_hash, usuario.id]);

      res.json({ message: 'Sua senha foi redefinida com sucesso!' });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao redefinir senha: ' + error.message });
    }
  }
};

module.exports = authController;