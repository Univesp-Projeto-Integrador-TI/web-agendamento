 CREATE TABLE IF NOT EXISTS sala (
      id_sala INTEGER PRIMARY KEY AUTOINCREMENT,
      descricao_sala TEXT NOT NULL
    )

    CREATE TABLE IF NOT EXISTS funcionarios (
      id_funcionario INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT NOT NULL,
      servico TEXT NOT NULL
    )
 

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
    )