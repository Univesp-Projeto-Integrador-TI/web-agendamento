 -- 1. Tabela de Salas
CREATE TABLE IF NOT EXISTS sala (
    id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
    descricao_sala TEXT NOT NULL,
    capacidade INTEGER DEFAULT 1
);

-- 2. Tabela de Serviços
CREATE TABLE IF NOT EXISTS servicos (
    id_servico INTEGER PRIMARY KEY AUTOINCREMENT,
    nome_servico TEXT NOT NULL,
    preco REAL,
    duracao_minutos INTEGER
);

-- 3. Tabela de Funcionários / Profissionais
CREATE TABLE IF NOT EXISTS funcionarios (
    id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    email TEXT,
    telefone TEXT,
    ativo INTEGER DEFAULT 1
);

-- 4. Tabela de Atendimentos / Agendamentos
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
    )
