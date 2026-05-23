import express from 'express';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

const app = express();
app.use(express.json());

async function iniciarServidor() {
  try {
    console.log('Tentando conectar ao banco de dados...');
    
    const dbPromise = await open({
      filename: './database/banco.db', // conecta ao banco de dados
      driver: sqlite3.Database
    });

    console.log('Banco de dados conectado com sucesso!');

    await dbPromise.exec(`
    --tabela com registros dos funcionarios
       CREATE TABLE IF NOT EXISTS funcionarios (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especialidade TEXT NOT NULL);

    -- tabela com registros das salas
        CREATE TABLE IF NOT EXISTS sala (
    id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao_sala TEXT NOT NULL,
    especialidade TEXT NOT NULL); 

-- tabela com registros de atendimento
        CREATE TABLE IF NOT EXISTS atendimento (
    id_atendimento INTEGER PRIMARY KEY AUTOINCREMENT,
    data_hora_inicio TEXT NOT NULL,
    data_hora_fim TEXT NOT NULL,
    status TEXT DEFAULT 'Pendente',
    observacoes TEXT,
    id_funcionario INTEGER NOT NULL,
    id_sala INTEGER,
    FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
    FOREIGN KEY (id_sala) REFERENCES sala (id_sala));`);
    console.log('Estrutura da tabela agendamentos atualizada!');

    // SÓ LIGA O SERVIDOR SE O BANCO ABRIR
    app.listen(3000, () => {
      console.log('Servidor rodando em http://localhost:3000');
    });

    // Deixa o dbPromise global para as rotas usarem
    global.dbPromise = dbPromise; 

  } catch (erro) {
    console.error('ERRO AO INICIAR:', erro.message);
    process.exit(1); // Fecha o processo avisando que deu erro
  }
}

iniciarServidor();

// rota api para cadastrar agendamentos (evitando conflitos)
app.post('/api/atendimento', async (req, res) => {
  const { data_hora_inicio, data_hora_fim, observacoes, id_funcionario, id_sala } = req.body;
  const db = global.dbPromise;

  try {
    // verifica se a sala já está ocupada nessa data e horário
    const conflito = await db.get(`
      SELECT 1 FROM atendimento 
      WHERE id_sala = ? 
        AND (? < data_hora_fim AND ? > data_hora_inicio)
    `, [id_sala, data_hora_inicio, data_hora_fim]);

    // se retornar algum registro, significa que há um conflito
    if (conflito) {
        return res.status(400).json({ error: 'Esta sala já esta ocupada neste horário.' });
    }

    // se não há conflitos, segue com o cadastro

    const resultado = await db.run(`
      INSERT INTO atendimento (data_hora_inicio, data_hora_fim, status, observacoes, id_funcionario, id_sala)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [data_hora_inicio, data_hora_fim, 'Pendente', observacoes, id_funcionario, id_sala]);

    return res.status(201).json({ 
      mensagem: 'Atendimento criado com sucesso!', 
      id_atendimento: resultado.lastID 
    });

  } catch (error) {
    console.error("Erro detalhado no terminal:", error);
    return res.status(500).json({ error: 'Erro interno ao salvar o agendamento.' });
  }
});

  // rota para cadastrar uma nova sala
app.post('/api/salas', async (req, res) => {
  const { descricao_sala, especialidade } = req.body;
  const db = global.dbPromise;

  try {
    const resultado = await db.run(`
      INSERT INTO sala (descricao_sala, especialidade) 
      VALUES (?, ?)
    `, [descricao_sala, especialidade]);

    return res.status(201).json({ 
      mensagem: 'Sala cadastrada com sucesso!', 
      id_sala: resultado.lastID 
    });
  } catch (error) {
    console.error("Erro ao cadastrar sala:", error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar a sala.' });
  }
});

// rota para cadastrar um novo funcionário
app.post('/api/funcionarios', async (req, res) => {
  const { nome, especialidade } = req.body;
  const db = global.dbPromise;

  try {
    const resultado = await db.run(`
      INSERT INTO funcionarios (nome, especialidade) 
      VALUES (?, ?)
    `, [nome,especialidade]); 

    return res.status(201).json({ 
      mensagem: 'Funcionário cadastrado com sucesso!', 
      id_funcionario: resultado.lastID 
    });
  } catch (error) {
    console.error("Erro ao cadastrar funcionário:", error);
    return res.status(500).json({ error: 'Erro interno ao cadastrar o funcionário.' });
  }
});