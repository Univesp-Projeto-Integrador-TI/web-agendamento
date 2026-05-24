const modal = document.getElementById("modal");
const btnNovo = document.getElementById("btnNovo");
const fechar = document.getElementById("fechar");
const cancelar = document.getElementById("cancelar");
const salvar = document.getElementById("salvar");
const tabela = document.getElementById("tabela");

let profissionais = [];
let editId = null;


// Carrega profissionais da API

async function carregarProfissionais() {
  try {
    const res = await fetch("https://web-agendamento-1.onrender.com/api/funcionarios");
    profissionais = await res.json();

    render();
  } catch (err) {
    console.error("Erro ao carregar profissionais:", err);
  }
}

carregarProfissionais();


// Renderização de profissionais

function render() {
  let html = "";

  profissionais.forEach((p) => {
    html += `
      <tr>
        <td>${p.nome}</td>
        <td>${p.servico}</td>
        <td>
          <button class="editar" data-id="${p.id_funcionario}">
            <img src="../images/icon-pencil.svg">
          </button>

          <button class="excluir" data-id="${p.id_funcionario}">
            <img src="../images/icon-trash.svg">
          </button>
        </td>
      </tr>
    `;
  });

  tabela.innerHTML = html;
}


// Abre o Modal

btnNovo.addEventListener("click", () => {
  modal.style.display = "flex";
  editId = null;

  nome.value = "";
  servico.selectedIndex = 0;
});


// Fecha o Modal

function fecharModal() {
  modal.style.display = "none";
}

fechar.addEventListener("click", fecharModal);
cancelar.addEventListener("click", fecharModal);


// Salva os dados na API

salvar.addEventListener("click", async () => {
  const nomeValue = nome.value;
  const servicoValue = servico.value;

  if (!nomeValue || !servicoValue) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    if (editId) {
      // Editar
      await fetch(`https://web-agendamento-1.onrender.com/api/funcionarios/${editId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nome.value,
          servico: servicoValue
        })
      });
    } else {
      // Criar
      await fetch("https://web-agendamento-1.onrender.com/api/funcionarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: nome.value,
          servico: servicoValue
        })
      });
    }

    fecharModal();
    carregarProfissionais();

  } catch (err) {
    console.error("Erro ao salvar:", err);
  }
});


// Editar e Excluir

tabela.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");

  if (!btn) return;

  const id = btn.dataset.id;

  if (btn.classList.contains("editar")) {
    const p = profissionais.find(p => p.id_funcionario == id);

    nome.value = p.nome;
    servico.value = p.servico;

    editId = id;
    modal.style.display = "flex";
  }

  if (btn.classList.contains("excluir")) {
    if (confirm("Deseja excluir este profissional?")) {
      try {
        await fetch(`https://web-agendamento-1.onrender.com/api/funcionarios/${id}`, {
          method: "DELETE"
        });

        carregarProfissionais();

      } catch (err) {
        console.error("Erro ao excluir:", err);
      }
    }
  }
});