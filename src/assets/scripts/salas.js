const modal = document.getElementById("modalSala");
const btnNova = document.getElementById("btnNovaSala");
const fechar = document.getElementById("fecharModal");
const salvar = document.getElementById("salvarSala");
const tabela = document.getElementById("tabelaSalas");

let editIndex = null;

// Nome sala
function salvarSalas() {
  localStorage.setItem("salas", JSON.stringify(salas));
}


let salas = JSON.parse(localStorage.getItem("salas")) || [
  { nome: "Sala 1" }
];
render();


// RENDER
function render() {
  tabela.innerHTML = "";

  salas.forEach((sala, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${sala.nome}</td>
        <td>
            <button class="editar" data-id="${index}">
              <img src="../src/assets/images/icon-pencil.svg" alt="editar" draggable="false">
            </button>

            <button class="excluir" data-id="${index}">
              <img src="../src/assets/images/icon-trash.svg" alt="excluir" draggable="false">
            </button>
        </td>
      </tr>
    `;
  });
}
render();

// ABRIR MODAL
btnNova.addEventListener("click", () => {
  modal.style.display = "flex";
  editIndex = null;

  document.getElementById("nomeSala").value = "";
});


// FECHAR MODAL
fechar.addEventListener("click", () => {
  modal.style.display = "none";
});


// SALVAR
salvar.addEventListener("click", () => {
  const nome = document.getElementById("nomeSala").value;

  if (!nome) {
    alert("Preencha o nome da sala!");
    return;
  }

  if (editIndex !== null) {
    salas[editIndex] = { nome };
  } else {
    salas.push({ nome });
  }

  salvarSalas()

  modal.style.display = "none";
  render();
});


// EDITAR / EXCLUIR
tabela.addEventListener("click", (e) => {
  const btn = e.target.closest("button");

  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("editar")) {
    const sala = salas[id];

    document.getElementById("nomeSala").value = sala.nome;

    editIndex = id;
    modal.style.display = "flex";
  }

  if (btn.classList.contains("excluir")) {
    if (confirm("Deseja excluir esta sala?")) {
      salas.splice(id, 1);

      salvarSalas();

      render();
    }
  }
});