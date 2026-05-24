const overlay = document.getElementById("overlay");
const openBtn = document.getElementById("openModal");
const closeBtn = document.getElementById("closeModal");

const lista = document.getElementById("lista");
const form = document.getElementById("form");

let editIndex = null;

// dados
let agendamentos = [];


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
          <p>${a.inicio} - ${a.fim}</p>
          <p>${a.profissional}</p>
          <p>${a.sala}</p>
        </div>

      </div>
    `;
  });
}


// abrir modal
openBtn.addEventListener("click", () => {
  overlay.style.display = "flex";
  form.reset();
  editIndex = null;
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
    inicio: inicio.value,
    fim: fim.value
  };

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
    agendamentos.splice(id, 1);
    render();
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
