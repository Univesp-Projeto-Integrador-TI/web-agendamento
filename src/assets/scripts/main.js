const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

const lista = document.getElementById("lista");
const form = document.getElementById("form");

let profissionais = [];
let salas = [];
let agendamentos = [];

let editId = null; // Controle - gamb- edição


// Carrega dados da API

async function carregarDados() {
  try {
    const [resSalas, resProf, resAg] = await Promise.all([
      fetch("https://web-agendamento-1.onrender.com/api/salas"),
      fetch("https://web-agendamento-1.onrender.com/api/funcionarios"),
      fetch("https://web-agendamento-1.onrender.com/api/atendimentos")
    ]);

    salas = await resSalas.json();
    profissionais = await resProf.json();
    agendamentos = await resAg.json();

    render();
  } catch (err) {
    console.error("Erro ao carregar dados:", err);
  }
}

carregarDados();

// Atualiza selects de Profissionais e Salas no Modal

function carregarSelects() {
  const selectServico = document.getElementById("servico");
  const selectSala = document.getElementById("sala");

  selectServico.innerHTML = "";
  selectSala.innerHTML = "";

  const servicosUnicos = [...new Set(profissionais.map(p => p.servico))];

  servicosUnicos.forEach(s => {
    selectServico.innerHTML += `<option value="${s}">${s}</option>`;
  });

  salas.forEach(s => {
    selectSala.innerHTML += `<option value="${s.id_sala}">${s.descricao_sala}</option>`;
  });

  atualizarProfissionais();
}

function atualizarProfissionais() {
  const select = document.getElementById("profissional");
  const servicoSelecionado = document.getElementById("servico").value;

  select.innerHTML = "";

  const filtrados = profissionais.filter(p =>
    p.servico === servicoSelecionado
  );

  filtrados.forEach(p => {
    select.innerHTML += `<option value="${p.id_funcionario}">${p.nome}</option>`;
  });
}

document.getElementById("servico").addEventListener("change", atualizarProfissionais);

//Renderização de agendamentos

function render() {
  lista.innerHTML = "";

  agendamentos.forEach((a) => {
    lista.innerHTML += `
      <div class="card">

        <div class="card-header">
          <strong>${a.nome_cliente}</strong>

          <span class="acoes">
            <button class="editar" data-id="${a.id_atendimento}">
              <img src="/src/assets/images/icon-pencil.svg">
            </button>

            <button class="excluir" data-id="${a.id_atendimento}">
              <img src="/src/assets/images/icon-trash.svg">
            </button>
          </span>
        </div>

        <div class="card-body">
          <p><b>Serviço:</b> ${a.servico_prestado}</p>
          <p><b>Profissional:</b> ${a.nome_funcionario}</p>
          <p><b>Sala:</b> ${a.nome_sala}</p>
          <p><b>Data:</b> ${formatarData(a.data_hora_inicio)}</p>
          <p><b>Horário:</b> ${formatarHora(a.data_hora_inicio)} - ${formatarHora(a.data_hora_fim)}</p>
        </div>

      </div>
    `;
  });
}

// Modal

openBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
  form.reset();
  editId = null; // Resete do Modal

  carregarSelects();
  setarDataAtual();
});

function fechar() {
  overlay.style.display = "none";
}

closeBtn.addEventListener("click", fechar);


// Salvar (criar ou editar)

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const cliente = document.getElementById("cliente").value.trim();
  const servico = document.getElementById("servico").value;
  const data = document.getElementById("data").value;
  const inicio = document.getElementById("inicio").value;
  const fim = document.getElementById("fim").value;
  const profissional = document.getElementById("profissional").value;
  const sala = document.getElementById("sala").value;

  if (!cliente || !servico || !data || !inicio || !fim || !profissional || !sala) {
    alert("Preencha todos os campos!");
    return;
  }

  const dataInicio = `${data}T${inicio}:00`;
  const dataFim = `${data}T${fim}:00`;

  try {
    const url = editId
      ? `https://web-agendamento-1.onrender.com/api/atendimento/${editId}`
      : "https://web-agendamento-1.onrender.com/api/atendimento";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        nome_cliente: cliente,
        servico_prestado: servico,
        data_hora_inicio: dataInicio,
        data_hora_fim: dataFim,
        id_funcionario: profissional,
        id_sala: sala
      })
    });

    const dataRes = await res.json();

    if (!res.ok) {
      alert(dataRes.error);
      return;
    }

    await carregarDados();
    fechar();
    editId = null;

  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
});

//Excluir e Editar

lista.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;

  // Editar
  if (btn.classList.contains("editar")) {
    const a = agendamentos.find(a => a.id_atendimento == id);

    editId = a.id_atendimento;

    overlay.style.display = "flex";

    carregarSelects();

    setTimeout(() => {
      document.getElementById("cliente").value = a.nome_cliente;
      document.getElementById("servico").value = a.servico_prestado;

      atualizarProfissionais();

      document.getElementById("profissional").value = a.id_funcionario;
      document.getElementById("sala").value = a.id_sala;

      document.getElementById("data").value = a.data_hora_inicio.split("T")[0];
      document.getElementById("inicio").value = a.data_hora_inicio.split("T")[1].slice(0, 5);
      document.getElementById("fim").value = a.data_hora_fim.split("T")[1].slice(0, 5);
    }, 0);
  }

  // Excluir
  if (btn.classList.contains("excluir")) {
    if (confirm("Deseja excluir este agendamento?")) {
      await fetch(`https://web-agendamento-1.onrender.com/api/atendimento/${id}`, {
        method: "DELETE"
      });

      await carregarDados();
    }
  }
});


// Utilidades

function setarDataAtual() {
  document.getElementById("data").value =
    new Date().toISOString().split("T")[0];
}

function formatarData(dataString) {
  return new Date(dataString).toLocaleDateString("pt-BR");
}

function formatarHora(dataString) {
  return new Date(dataString).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit"
  });
}