const modal = document.getElementById("modalSala");
const btnNova = document.getElementById("btnNovaSala");
const fechar = document.getElementById("fecharModal");
const salvar = document.getElementById("salvarSala");
const tabela = document.getElementById("tabelaSalas");

let salas = [];
let editId = null;


// Carrega salas da API

async function carregarSalas() {
  try {
    const res = await fetch("https://web-agendamento-1.onrender.com/api/salas");
    salas = await res.json();

    render();
  } catch (err) {
    console.error("Erro ao carregar salas:", err);
  }
}

carregarSalas();


// Renderização de salas

function render() {
  let html = "";

  salas.forEach((s) => {
    html += `
      <tr>
        <td>${s.descricao_sala}</td>
        <td>
            <button class="editar" data-id="${s.id_sala}">
              <img src="/src/assets/images/icon-pencil.svg">
            </button>

            <button class="excluir" data-id="${s.id_sala}">
              <img src="/src/assets/images/icon-trash.svg">
            </button>
        </td>
      </tr>
    `;
  });

  tabela.innerHTML = html;
}

// Abrir modais

btnNova.addEventListener("click", () => {
  modal.style.display = "flex";
  editId = null; // reset modo edição

  nomeSala.value = "";
});

// Fechar modais

fechar.addEventListener("click", () => {
  modal.style.display = "none";
});

// Salvar sala (criar ou editar)

salvar.addEventListener("click", async () => {
  const nome = nomeSala.value.trim();

  if (!nome) {
    alert("Preencha o nome da sala!");
    return;
  }

  try {
    const url = editId
      ? `https://web-agendamento-1.onrender.com/api/salas/${editId}`
      : "https://web-agendamento-1.onrender.com/api/salas";

    const method = editId ? "PUT" : "POST";

    const res = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        descricao_sala: nome
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error);
      return;
    }

    modal.style.display = "none";
    editId = null;

    carregarSalas();

  } catch (err) {
    console.error("Erro ao salvar sala:", err);
  }
});


// Editar e Excluir

tabela.addEventListener("click", async (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  const id = btn.dataset.id;

  // EDITAR
  if (btn.classList.contains("editar")) {
    const sala = salas.find(s => s.id_sala == id);

    if (!sala) return;

    nomeSala.value = sala.descricao_sala;
    editId = id;

    modal.style.display = "flex";
  }

  // EXCLUIR
  if (btn.classList.contains("excluir")) {
    if (confirm("Deseja excluir esta sala?")) {
      try {
        const res = await fetch(`https://web-agendamento-1.onrender.com/api/salas/${id}`, {
          method: "DELETE"
        });

        const data = await res.json();

        if (!res.ok) {
          alert(data.error);
          return;
        }

        carregarSalas();

      } catch (err) {
        console.error("Erro ao excluir sala:", err);
      }
    }
  }
});
