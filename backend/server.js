import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());
app.use(cors());

// configuração do BD
async function iniciarBanco() {
  // Abre o arquivo do banco (ou cria se não existir)
  const db = await open({
    filename: './database/banco.db',
    driver: sqlite3.Database
  });

  // ativa o suporte a chaves estrangeiras (FOREIGN KEYS)
  await db.get('PRAGMA foreign_keys = ON');

  // cria a tabela de Salas
  await db.exec(`
    CREATE TABLE IF NOT EXISTS sala (
      id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao_sala TEXT NOT NULL
    );
  `);

  // cria a tabela de funcionários
  await db.exec(`
    CREATE TABLE IF NOT EXISTS funcionarios (
      id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      servico TEXT NOT NULL
    );
  `);

  // cria a tabela de atendimentos
  await db.exec(`
    CREATE TABLE IF NOT EXISTS atendimento (
      id_atendimento INTEGER PRIMARY KEY AUTOINCREMENT,
      nome_cliente TEXT NOT NULL,
      servico_prestado TEXT NOT NULL,
      data_hora_inicio TEXT NOT NULL,
      data_hora_fim TEXT NOT NULL,
      id_funcionario INTEGER,
      id_sala INTEGER,
      FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
      FOREIGN KEY (id_sala) REFERENCES sala (id_sala)
    );
  `);

  console.log("Banco de dados e tabelas configurados com sucesso!");
  return db;
}

global.dbPromise = iniciarBanco();


// =========================================================================
// 1. rotas para salas
// =========================================================================

app.post('/api/salas', async (req, res) => {
  const { descricao_sala } = req.body;
  const db = await global.dbPromise;

  if (!descricao_sala || descricao_sala.trim() === '') {
    return res.status(400).json({ error: 'A descrição da sala é obrigatória.' });
  }
  try {
    const resultado = await db.run('INSERT INTO sala (descricao_sala) VALUES (?)', [descricao_sala.trim()]);
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
  const { descricao_sala } = req.body;
  const db = await global.dbPromise;

  if (!descricao_sala || descricao_sala.trim() === '') {
    return res.status(400).json({ error: 'A nova descrição é obrigatória.' });
  }
  try {
    const resultado = await db.run('UPDATE sala SET descricao_sala = ? WHERE id_sala = ?', [descricao_sala.trim(), id]);
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
    return res.status(500).json({ error: 'Não é possível excluir uma sala que possui agendamentos vinculados.' });
  }
});

// =========================================================================
// rotas para gerenciar os profissionais
// =========================================================================

app.post('/api/funcionarios', async (req, res) => {
  const { nome, servico } = req.body;
  const db = await global.dbPromise;

  if (!nome || !servico || nome.trim() === '' || servico.trim() === '') {
    return res.status(400).json({ error: 'Nome e serviço são obrigatórios.' });
  }
  try {
    const resultado = await db.run('INSERT INTO funcionarios (nome, servico) VALUES (?, ?)', [nome.trim(), servico.trim()]);
    return res.status(201).json({ mensagem: 'Profissional cadastrado!', id_funcionario: resultado.lastID });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao cadastrar profissional.' });
  }
});

app.get('/api/funcionarios', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const profissionais = await db.all('SELECT * FROM funcionarios');
    return res.json(profissionais);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar profissionais.' });
  }
});

app.put('/api/funcionarios/:id', async (req, res) => {
  const { id } = req.params;
  const { nome, servico } = req.body;
  const db = await global.dbPromise;

  if (!nome || !servico || nome.trim() === '' || servico.trim() === '') {
    return res.status(400).json({ error: 'Nome e serviço não podem ficar vazios.' });
  }
  try {
    const resultado = await db.run('UPDATE funcionarios SET nome = ?, servico = ? WHERE id_funcionario = ?', [nome.trim(), servico.trim(), id]);
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
    const resultado = await db.run('DELETE FROM funcionarios WHERE id_funcionario = ?', [id]);
    if (resultado.changes === 0) return res.status(404).json({ error: 'Profissional não encontrado.' });
    return res.json({ message: 'Profissional excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Não é possível excluir um profissional com agendamentos ativos.' });
  }
});

// =========================================================================
// rotas para criar agendamentos
// =========================================================================

// 3.1. Criar Agendamento
app.post('/api/atendimento', async (req, res) => {
  const { nome_cliente, servico_prestado, data_hora_inicio, data_hora_fim, id_funcionario, id_sala } = req.body;
  const db = await global.dbPromise;

  if (!nome_cliente || !servico_prestado || !data_hora_inicio || !data_hora_fim || !id_funcionario || !id_sala) {
    return res.status(400).json({ error: 'Todos os campos são obrigatórios (Cliente, Serviço, Datas, Sala e Profissional).' });
  }

  if (new Date(data_hora_inicio) >= new Date(data_hora_fim)) {
    return res.status(400).json({ error: 'A hora de término deve ser maior que a hora de início.' });
  }

  try {
    const conflito = await db.get(`
      SELECT 1 FROM atendimento 
      WHERE id_sala = ? 
        AND (? < data_hora_fim AND ? > data_hora_inicio)
    `, [id_sala, data_hora_inicio, data_hora_fim]);

    if (conflito) {
      return res.status(400).json({ error: 'Esta sala já está ocupada neste horário.' });
    }

    const resultado = await db.run(`
      INSERT INTO atendimento (nome_cliente, servico_prestado, data_hora_inicio, data_hora_fim, id_funcionario, id_sala)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [nome_cliente.trim(), servico_prestado.trim(), data_hora_inicio, data_hora_fim, id_funcionario, id_sala]);

    return res.status(201).json({ mensagem: 'Agendamento criado com sucesso!', id_atendimento: resultado.lastID });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Erro interno ao salvar agendamento.' });
  }
});

//rota que lista os agendamentos existentes
app.get('/api/atendimentos', async (req, res) => {
  const db = await global.dbPromise;
  try {
    const lista = await db.all(`
      SELECT 
        a.id_atendimento,
        a.nome_cliente,
        a.servico_prestado,
        a.data_hora_inicio,
        a.data_hora_fim,
        a.id_funcionario,
        a.id_sala,
        f.nome AS nome_funcionario,
        s.descricao_sala AS nome_sala
      FROM atendimento a
      INNER JOIN funcionarios f ON a.id_funcionario = f.id_funcionario
      INNER JOIN sala s ON a.id_sala = s.id_sala
      ORDER BY a.data_hora_inicio ASC
    `);
    return res.json(lista);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao listar agendamentos.' });
  }
});

// rota que permite editar os agendamentos
app.put('/api/atendimento/:id', async (req, res) => {
  const { id } = req.params;
  const { nome_cliente, servico_prestado, data_hora_inicio, data_hora_fim, id_funcionario, id_sala } = req.body;
  const db = await global.dbPromise;

  try {
    const conflito = await db.get(`
      SELECT 1 FROM atendimento 
      WHERE id_sala = ? 
        AND (? < data_hora_fim AND ? > data_hora_inicio)
        AND id_atendimento != ?
    `, [id_sala, data_hora_inicio, data_hora_fim, id]);

    if (conflito) {
      return res.status(400).json({ error: 'Esta sala já está ocupada neste horário.' });
    }

    const resultado = await db.run(`
      UPDATE atendimento SET 
        nome_cliente = ?, servico_prestado = ?, data_hora_inicio = ?, 
        data_hora_fim = ?, id_funcionario = ?, id_sala = ?
      WHERE id_atendimento = ?
    `, [nome_cliente.trim(), servico_prestado.trim(), data_hora_inicio, data_hora_fim, id_funcionario, id_sala, id]);

    if (resultado.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    return res.json({ mensagem: 'Agendamento atualizado com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
});

// rota que permite deletar o agendamento
app.delete('/api/atendimento/:id', async (req, res) => {
  const { id } = req.params;
  const db = await global.dbPromise;
  try {
    const resultado = await db.run('DELETE FROM atendimento WHERE id_atendimento = ?', [id]);
    if (resultado.changes === 0) return res.status(404).json({ error: 'Agendamento não encontrado.' });
    return res.json({ mensagem: 'Agendamento excluído com sucesso!' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao excluir agendamento.' });
  }
});

// =========================================================================
// inicialização do servidor
// =========================================================================
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});