-- tabelas basicas do projeto

CREATE TABLE IF NOT EXISTS funcionarios (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    especialidade TEXT NOT NULL);


/* não será mais utilizada  
CREATE TABLE IF NOT EXISTS clientes (
id_cliente INTEGER PRIMARY KEY AUTOINCREMENT,
nome TEXT NOT NULL,
contato TEXT NOT NULL);
*/

CREATE TABLE IF NOT EXISTS sala (
id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
descricao_sala TEXT NOT NULL,
especialidade TEXT NOT NULL); 

CREATE TABLE IF NOT EXISTS atendimento (
id_atendimento INTEGER PRIMARY KEY AUTOINCREMENT,
data_hora_inicio TEXT NOT NULL,
data_hora_fim TEXT NOT NULL,
status TEXT DEFAULT 'Pendente',
observacoes TEXT,
id_funcionario INTEGER NOT NULL,
id_sala INTEGER,
FOREIGN KEY (id_funcionario) REFERENCES funcionarios (id_funcionario),
FOREIGN KEY (id_sala) REFERENCES sala (id_sala));