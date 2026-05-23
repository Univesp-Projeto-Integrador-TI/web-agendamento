const modal = document.getElementById("modalSala");
const btnNova = document.getElementById("btnNovaSala");
const fechar = document.getElementById("fecharModal");
const salvar = document.getElementById("salvarSala");
const tabela = document.getElementById("tabelaSalas");

let editIndex = null;

let salas = [
  { nome: "Sala 1", servico: "Psicologia", cor: "#6C63FF", prof: "Ana" }
];


// RENDER
function render() {
  tabela.innerHTML = "";

  salas.forEach((sala, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${sala.nome}</td>
        <td>${sala.servico}</td>
        <td><div class="cor-box" style="background:${sala.cor}"></div></td>
        <td>${sala.prof}</td>
        <td>
          <button class="editar" data-id="${index}">✏️</button>
          <button class="excluir" data-id="${index}">🗑️</button>
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
});

fechar.addEventListener("click", () => {
  modal.style.display = "none";
});


// SALVAR
salvar.addEventListener("click", () => {
  const nome = document.getElementById("nomeSala").value;
  const servico = document.getElementById("servicoSala").value;
  const cor = document.getElementById("corSala").value;
  const prof = document.getElementById("profissionalSala").value;

  if (editIndex !== null) {
    salas[editIndex] = { nome, servico, cor, prof };
  } else {
    salas.push({ nome, servico, cor, prof });
  }

  modal.style.display = "none";
  render();
});


// AÇÕES (delegação)
tabela.addEventListener("click", (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("editar")) {
    const sala = salas[id];

    document.getElementById("nomeSala").value = sala.nome;
    document.getElementById("servicoSala").value = sala.servico;
    document.getElementById("corSala").value = sala.cor;
    document.getElementById("profissionalSala").value = sala.prof;

    editIndex = id;
    modal.style.display = "flex";
  }

  if (e.target.classList.contains("excluir")) {
    salas.splice(id, 1);
    render();
  }
});
