-- tabelas basicas do projeto

CREATE TABLE IF NOT EXISTS funcionarios (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especialidade TEXT NOT NULL);
    
CREATE TABLE IF NOT EXISTS clientes (
id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
contato TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS sala (
id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
descricao_sala TEXT NOT NULL,
especialidade TEXT NOT NULL);

CREATE TABLE IF NOT EXISTS atendimento (
id_atendimento INTEGER PRIMARY KEY AUTOINCREMENT,
data_hora TEXT NOT NULL,
status TEXT,
observacoes TEXT,
id_cliente INTEGER,
id_funcionario INTEGER,
id_sala INTEGER,
FOREIGN KEY (id_cliente) REFERENCES clientes (id_cliente),
FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
FOREIGN KEY (id_sala) REFERENCES sala (id_sala));