const modal = document.getElementById("modalSala");
const btnNova = document.getElementById("btnNovaSala");
const fechar = document.getElementById("fecharModal");
const salvar = document.getElementById("salvarSala");
const tabela = document.getElementById("tabelaSalas");

let editIndex = null;

let salas = [
  { nome: "Sala 1", servico: "Psicologia", prof: "Ana" }
];



function render() {
  tabela.innerHTML = "";

  salas.forEach((sala, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${sala.nome}</td>
        <td>${sala.servico}</td>
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



btnNova.addEventListener("click", () => {
  modal.style.display = "flex";
  editIndex = null;

  document.getElementById("nomeSala").value = "";
  document.getElementById("servicoSala").value = "";
  document.getElementById("profissionalSala").value = "";
});



fechar.addEventListener("click", () => {
  modal.style.display = "none";
});



salvar.addEventListener("click", () => {
  const nome = document.getElementById("nomeSala").value;
  const servico = document.getElementById("servicoSala").value;
  const prof = document.getElementById("profissionalSala").value;

  if (!nome || !servico || !prof) {
    alert("Preencha todos os campos!");
    return;
  }

  if (editIndex !== null) {
    salas[editIndex] = { nome, servico, prof };
  } else {
    salas.push({ nome, servico, prof });
  }

  modal.style.display = "none";
  render();
});


// ✅ AÇÕES (EDITAR / EXCLUIR)
tabela.addEventListener("click", (e) => {
  const id = e.target.dataset.id;

  if (e.target.classList.contains("editar")) {
    const sala = salas[id];

    document.getElementById("nomeSala").value = sala.nome;
    document.getElementById("servicoSala").value = sala.servico;
    document.getElementById("profissionalSala").value = sala.prof;

    editIndex = id;
    modal.style.display = "flex";
  }

  if (e.target.classList.contains("excluir")) {
    salas.splice(id, 1);
    render();
  }
});