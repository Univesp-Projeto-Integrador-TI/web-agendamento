const modal = document.getElementById("modal");
const btnNovo = document.getElementById("btnNovo");
const fechar = document.getElementById("fechar");
const cancelar = document.getElementById("cancelar");
const salvar = document.getElementById("salvar");
const tabela = document.getElementById("tabela");

let editIndex = null;


function salvarProfissionais() {
  localStorage.setItem("profissionais", JSON.stringify(profissionais));
}


let profissionais = JSON.parse(localStorage.getItem("profissionais")) || [
  { nome: "Padrão", servico: "Serviço Padrão" }
];

render();



// RENDER
function render() {
  tabela.innerHTML = "";

  profissionais.forEach((p, index) => {
    tabela.innerHTML += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.servico}</td>
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
btnNovo.addEventListener("click", () => {
  modal.style.display = "flex";
  editIndex = null;

  document.getElementById("nome").value = "";
  document.getElementById("servico").value = "Psicologia";
});


// FECHAR
function fecharModal() {
  modal.style.display = "none";
}

fechar.addEventListener("click", fecharModal);
cancelar.addEventListener("click", fecharModal);


// SALVAR
salvar.addEventListener("click", () => {
  const nome = document.getElementById("nome").value;
  const servico = document.getElementById("servico").value;

  if (!nome || !servico) {
    alert("Preencha todos os campos!");
    return;
  }

  if (editIndex !== null) {
    profissionais[editIndex] = { nome, servico };
  } else {
    profissionais.push({ nome, servico });
  }

  salvarProfissionais();

  fecharModal();
  render();
});


// EDITAR / EXCLUIR
tabela.addEventListener("click", (e) => {
  const btn = e.target.closest("button");

  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("editar")) {
    const p = profissionais[id];

    document.getElementById("nome").value = p.nome;
    document.getElementById("servico").value = p.servico;

    editIndex = id;
    modal.style.display = "flex";
  }

  if (btn.classList.contains("excluir")) {
    if (confirm("Deseja excluir este profissional?")) {
      profissionais.splice(id, 1);

      salvarProfissionais();

      render();
    }
  }
});