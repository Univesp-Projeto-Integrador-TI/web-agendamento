import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());
app.use(cors());

// Configuração do Banco de Dados
async function iniciarBanco() {
  const db = await open({
    filename: './database/banco.db',
    driver: sqlite3.Database
  });

  await db.get('PRAGMA foreign_keys = ON');

  // Criação das tabelas atualizadas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sala (
      id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao_sala TEXT NOT NULL,
      capacidade INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS servicos (
      id_servico INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_servico TEXT NOT NULL,
      preco REAL,
      duracao_minutos INTEGER
    );

    CREATE TABLE IF NOT EXISTS funcionarios (
      id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      email TEXT,
      telefone TEXT,
      ativo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS atendimento (
      id_atendimento INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_cliente TEXT NOT NULL,
      telefone_cliente TEXT,
      data_hora_inicio TEXT NOT NULL,
      data_hora_fim TEXT NOT NULL,
      status TEXT DEFAULT 'agendado',
      id_funcionario INTEGER,
      id_sala INTEGER,
      id_servico INTEGER,
      FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
      FOREIGN KEY (id_sala) REFERENCES sala (id_sala),
      FOREIGN KEY (id_servico) REFERENCES servicos (id_servico)
    );
  `);

  console.log("Banco de dados e tabelas configurados com sucesso!");
  return db;
}

global.dbPromise = iniciarBanco();

// =========================================================================
// 1. ROTAS PARA SALAS
// =========================================================================

app.post('/api/salas', async (req, res) => {
  const { descricao_sala, capacidade } = req.body;
  const db = await global.dbPromise;

  if (!descricao_sala || descricao_sala.trim() === '') {
    return res.status(400).json({ error: 'A descrição da sala é obrigatória.' });
  }
  try {
    const resultado = await db.run(
      'INSERT INTO sala (descricao_sala, capacidade) VALUES (?, ?)',
      [descricao_sala.trim(), capacidade || 1]
    );
    return res.status(201).json({ mensagem: 'Sala criada com sucesso!', id_sala: resultado.lastID });
  } catch (error) {
    return res.status(500).json({ error: 'Erro interno ao criar sala.' });
  }
});

app.get('/api/salas', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const salas = await db.all('SELECT * FROM sala');
    return res.json(salas);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar salas.' });
  }
});

app.put('/api/salas/:id', async (req, res) => {
  const { id } = req.params;
  const { descricao_sala, capacidade } = req.body;
  const db = await global.dbPromise;

  if (!descricao_sala || descricao_sala.trim() === '') {
    return res.status(400).json({ error: 'A descrição é obrigatória.' });
  }
  try {
    const resultado = await db.run(
      'UPDATE sala SET descricao_sala = ?, capacidade = ? WHERE id_sala = ?',
      [descricao_sala.trim(), capacidade || 1, id]
    );
    if (resultado.changes === 0) return res.status(404).json({ error: 'Sala não encontrada.' });
    return res.json({ mensagem: 'Sala atualizada com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar sala.' });
  }
});

app.delete('/api/salas/:id', async (req, res) => {
  const { id } = req.params;
  const db = await global.dbPromise;
  try {
    const resultado = await db.run('DELETE FROM sala WHERE id_sala = ?', [id]);
    if (resultado.changes === 0) return res.status(404).json({ error: 'Sala não encontrada.' });
    return res.json({ mensagem: 'Sala excluída com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Não é possível excluir uma sala com agendamentos vinculados.' });
  }
});

// =========================================================================
// 2. ROTAS PARA SERVIÇOS
// =========================================================================

app.post('/api/servicos', async (req, res) => {
  const { nome_servico, preco, duracao_minutos } = req.body;
  const db = await global.dbPromise;

  if (!nome_servico || nome_servico.trim() === '') {
    return res.status(400).json({ error: 'O nome do serviço é obrigatório.' });
  }
  try {
    const resultado = await db.run(
      'INSERT INTO servicos (nome_servico, preco, duracao_minutos) VALUES (?, ?, ?)',
      [nome_servico.trim(), preco || 0, duracao_minutos || 30]
    );
    return res.status(201).json({ mensagem: 'Serviço cadastrado!', id_servico: resultado.lastID });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar serviço.' });
  }
});

app.get('/api/servicos', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const servicos = await db.all('SELECT * FROM servicos');
    return res.json(servicos);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar serviços.' });
  }
});

// =========================================================================
// 3. ROTAS PARA FUNCIONÁRIOS
// =========================================================================

app.post('/api/funcionarios', async (req, res) => {
  const { nome, email, telefone } = req.body;
  const db = await global.dbPromise;

  if (!nome || nome.trim() === '') {
    return res.status(400).json({ error: 'O nome é obrigatório.' });
  }
  try {
    const resultado = await db.run(
      'INSERT INTO funcionarios (nome, email, telefone, ativo) VALUES (?, ?, ?, 1)',
      [nome.trim(), email || '', telefone || '']
    );
    return res.status(201).json({ mensagem: 'Profissional cadastrado!', id_funcionario: resultado.lastID });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar profissional.' });
  }
});

app.get('/api/funcionarios', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const profissionais = await db.all('SELECT * FROM funcionarios WHERE ativo = 1');
    return res.json(profissionais);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar profissionais.' });
  }
});

app.put('/api/funcionarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, email, telefone, ativo } = req.body;
  const db = await global.dbPromise;

  try {
    const resultado = await db.run(
      'UPDATE funcionarios SET nome = ?, email = ?, telefone = ?, ativo = ? WHERE id_funcionario = ?',
      [nome.trim(), email, telefone, ativo ?? 1, id]
    );
    if (resultado.changes === 0) return res.status(404).json({ error: 'Profissional não encontrado.' });
    return res.json({ mensagem: 'Profissional atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar profissional.' });
  }
});

app.delete('/api/funcionarios/:id', async (req, res) => {
  const { id } = req.params;
  const db = await global.dbPromise;
  try {
    const resultado = await db.run('UPDATE funcionarios SET ativo = 0 WHERE id_funcionario = ?', [id]);
    if (resultado.changes === 0) return res.status(404).json({ error: 'Profissional não encontrado.' });
    return res.json({ mensagem: 'Profissional desativado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao desativar profissional.' });
  }
});

// =========================================================================
// 4. ROTAS PARA AGENDAMENTOS (ATENDIMENTO)
// =========================================================================

app.post('/api/atendimento', async (req, res) => {
  const { nome_cliente, telefone_cliente, data_hora_inicio, data_hora_fim, id_funcionario, id_sala, id_servico } = req.body;
  const db = await global.dbPromise;

  if (!nome_cliente || !data_hora_inicio || !data_hora_fim || !id_funcionario || !id_sala || !id_servico) {
    return res.status(400).json({ error: 'Campos obrigatórios em falta (Cliente, Datas, Profissional, Sala ou Serviço).' });
  }

  if (new Date(data_hora_inicio) >= new Date(data_hora_fim)) {
    return res.status(400).json({ error: 'A hora de término deve ser maior que a hora de início.' });
  }

  try {
    const conflito = await db.get(`
      SELECT 1 FROM atendimento 
      WHERE id_sala = ? 
        AND status != 'cancelado'
        AND (? < data_hora_fim AND ? > data_hora_inicio)
    `, [id_sala, data_hora_inicio, data_hora_fim]);

    if (conflito) {
      return res.status(400).json({ error: 'Esta sala já está ocupada neste horário.' });
    }

    const resultado = await db.run(`
      INSERT INTO atendimento (nome_cliente, telefone_cliente, data_hora_inicio, data_hora_fim, status, id_funcionario, id_sala, id_servico)
      VALUES (?, ?, ?, ?, 'agendado', ?, ?, ?)
    `, [nome_cliente.trim(), telefone_cliente || '', data_hora_inicio, data_hora_fim, id_funcionario, id_sala, id_servico]);

    return res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', id_atendimento: resultado.lastID });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao salvar agendamento.' });
  }
});

app.get('/api/atendimentos', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const lista = await db.all(`
      SELECT 
        a.id_atendimento,
        a.nome_cliente,
        a.telefone_cliente,
        a.data_hora_inicio,
        a.data_hora_fim,
        a.status,
        a.id_funcionario,
        a.id_sala,
        a.id_servico,
        f.nome AS nome_funcionario,
        s.descricao_sala AS nome_sala,
        srv.nome_servico,
        srv.preco
      FROM atendimento a
      LEFT JOIN funcionarios f ON a.id_funcionario = f.id_funcionario
      LEFT JOIN sala s ON a.id_sala = s.id_sala
      LEFT JOIN servicos srv ON a.id_servico = srv.id_servico
      ORDER BY a.data_hora_inicio ASC
    `);
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
});

app.put('/api/atendimento/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_cliente, telefone_cliente, data_hora_inicio, data_hora_fim, status, id_funcionario, id_sala, id_servico } = req.body;
  const db = await global.dbPromise;

  try {
    const resultado = await db.run(`
      UPDATE atendimento SET 
        nome_cliente = ?, telefone_cliente = ?, data_hora_inicio = ?, 
        data_hora_fim = ?, status = ?, id_funcionario = ?, id_sala = ?, id_servico = ?
      WHERE id_atendimento = ?
    `, [nome_cliente.trim(), telefone_cliente, data_hora_inicio, data_hora_fim, status || 'agendado', id_funcionario, id_sala, id_servico, id]);

    if (resultado.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    return res.json({ mensagem: 'Agendamento atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

app.delete('/api/atendimento/:id', async (req, res) => {
  const { id } = req.params;
  const db = await global.dbPromise;
  try {
    const resultado = await db.run("UPDATE atendimento SET status = 'cancelado' WHERE id_atendimento = ?", [id]);
    if (resultado.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    return res.json({ mensagem: 'Agendamento cancelado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cancelar agendamento.' });
  }
});

// Inicialização do Servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
