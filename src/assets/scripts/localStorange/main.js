const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

const lista = document.getElementById("lista");
const form = document.getElementById("form");

let editIndex = null;

// dados
const salas = JSON.parse(localStorage.getItem("salas")) || [];
const profissionais = JSON.parse(localStorage.getItem("profissionais")) || [];

let agendamentos = JSON.parse(localStorage.getItem("agendamentos")) || [];
render();

function carregarSelects() {
  const selectServico = document.getElementById("servico");
  const selectSala = document.getElementById("sala");

  selectServico.innerHTML = "";
  selectSala.innerHTML = "";

  // SERVIÇOS 
  const servicosUnicos = [...new Set(profissionais.map(p => p.servico))];

  servicosUnicos.forEach(s => {
    selectServico.innerHTML += `
      <option value="${s}">${s}</option>
    `;
  });

  // SALAS
  salas.forEach(s => {
    selectSala.innerHTML += `
      <option value="${s.nome}">${s.nome}</option>
    `;
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
    select.innerHTML += `
      <option value="${p.nome}">${p.nome}</option>
    `;
  });
}

document.getElementById("servico").addEventListener("change", () => {
  atualizarProfissionais();
});


// render
function render() {
  lista.innerHTML = "";

  agendamentos.forEach((a, index) => {
    lista.innerHTML += `
      <div class="card">

        <div class="card-header">
          <strong>${a.cliente}</strong>

          <span class="acoes">
            <button class="editar" data-id="${index}">
              <img src="./src/assets/images/icon-pencil.svg" alt="editar" draggable="false">
            </button>

            <button class="excluir" data-id="${index}">
              <img src="./src/assets/images/icon-trash.svg" alt="excluir" draggable="false">
            </button>
          </span>
        </div>

        <div class="card-body">
          <p>${a.servico}</p>
          <p><img src="./src/assets/images/icon-calendar.svg" alt="data" draggable="false">${formatarData(a.data)}</p>
          <p><img src="./src/assets/images/icon-clock.svg" alt="horário" draggable="false">${a.inicio} - ${a.fim}</p>
          <p><img src="./src/assets/images/icon-group-people.svg" alt="profissional" draggable="false">${a.profissional}</p>
          <p><img src="./src/assets/images/icon-door-room.svg" alt="sala" draggable="false">${a.sala}</p>
        </div>

      </div>
    `;
  });
  localStorage.setItem("agendamentos", JSON.stringify(agendamentos));
}


// abrir modal
openBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
  form.reset();
  editIndex = null;

  carregarSelects();
  setarDataAtual();
});


// fechar
function fechar() {
  overlay.style.display = "none";
}

closeBtn.addEventListener("click", fechar);

overlay.addEventListener("click", (e) => {
  if (e.target === overlay) fechar();
});


// salvar
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const novo = {
    cliente: cliente.value,
    servico: servico.value,
    profissional: profissional.value,
    sala: sala.value,
    data: data.value,
    inicio: inicio.value,
    fim: fim.value
  };

  const conflito = agendamentos.some((a, index) =>
    index !== editIndex &&
    a.data === novo.data &&
    a.sala === novo.sala &&
    (
      (novo.inicio >= a.inicio && novo.inicio < a.fim) ||
      (novo.fim > a.inicio && novo.fim <= a.fim)
    )
  );

  if (conflito) {
    alert("Essa sala já está ocupada nesse horário!");
    return;
  }

  if (editIndex !== null) {
    agendamentos[editIndex] = novo;
  } else {
    agendamentos.push(novo);
  }

  render();
  fechar();
});


// editar e excluir
lista.addEventListener("click", (e) => {
  const btn = e.target.closest("button");

  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("editar")) {
    const a = agendamentos[id];

    cliente.value = a.cliente;
    servico.value = a.servico;
    profissional.value = a.profissional;
    sala.value = a.sala;
    inicio.value = a.inicio;
    fim.value = a.fim;

    editIndex = id;
    overlay.style.display = "flex";
  }

    if (btn.classList.contains("excluir")) {
    const confirmar = confirm("Tem certeza que deseja excluir este agendamento?");

    if (confirmar) {
        agendamentos.splice(id, 1);
        render();
    }
    }
});

document.getElementById("dataAtual").textContent = formatarDataAtual();
function formatarDataAtual() {
  const data = new Date();

  const dias = [
    "Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira",
    "Quinta-feira", "Sexta-feira", "Sábado"
  ];

  const meses = [
    "janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
  ];

  const diaSemana = dias[data.getDay()];
  const dia = data.getDate();
  const mes = meses[data.getMonth()];
  const ano = data.getFullYear();

  return `${diaSemana}, ${dia} de ${mes} de ${ano}`;
}

function formatarData(dataString) {
  const data = new Date(dataString + "T00:00:00");

  const dia = data.getDate();
  const mes = data.getMonth() + 1;
  const ano = data.getFullYear();

  return `${dia}/${mes}/${ano}`;
}


function setarDataAtual() {
  const hoje = new Date().toISOString().split("T")[0];
  document.getElementById("data").value = hoje;
}
