const formCriarPasta = document.getElementById("formCriarPasta");
const nomePastaInput = document.getElementById("nomePasta");
const pastaSelect = document.getElementById("pastaExistente");
const filtro = document.getElementById("filtroPasta");
const arquivoInput = document.getElementById("arquivo");
const docForm = document.getElementById("docForm");
const docTable = document.getElementById("docTable").querySelector("tbody");
const fileNameSpan = document.getElementById("file-name");

function carregarPastasSalvas() {
  const pastas = JSON.parse(localStorage.getItem("pastas")) || [];
  filtro.innerHTML = '<option value="todas">Todas as pastas</option>';
  pastaSelect.innerHTML = '<option value="">Selecionar pasta existente</option>';

  pastas.forEach(pasta => {
    const opt1 = document.createElement("option");
    opt1.value = pasta;
    opt1.textContent = pasta;
    filtro.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = pasta;
    opt2.textContent = pasta;
    pastaSelect.appendChild(opt2);
  });

  document.getElementById("total-pastas").textContent = `📂 Pastas Cadastradas: ${pastas.length}`;
}

formCriarPasta?.addEventListener("submit", e => {
  e.preventDefault();
  const novaPasta = nomePastaInput.value.trim();
  if (!novaPasta) return;

  let pastas = JSON.parse(localStorage.getItem("pastas")) || [];
  if (!pastas.includes(novaPasta)) {
    pastas.push(novaPasta);
    localStorage.setItem("pastas", JSON.stringify(pastas));
  }
  nomePastaInput.value = "";
  carregarPastasSalvas();
});

arquivoInput?.addEventListener("change", () => {
  const nomes = Array.from(arquivoInput.files).map(f => f.name);
  fileNameSpan.textContent = nomes.join(", ") || "Nenhum arquivo selecionado";
});

docForm?.addEventListener("submit", e => {
  e.preventDefault();
  const pasta = pastaSelect.value;
  const arquivos = Array.from(arquivoInput.files);

  if (!pasta || arquivos.length === 0) return;

  let arquivosPorPasta = JSON.parse(localStorage.getItem("arquivosPorPasta")) || {};
  if (!arquivosPorPasta[pasta]) arquivosPorPasta[pasta] = [];

  let arquivosLidos = 0;
  arquivos.forEach(arquivo => {
    const reader = new FileReader();
    reader.onload = function () {
      arquivosPorPasta[pasta].push({
        nome: arquivo.name,
        tipo: arquivo.type,
        conteudo: reader.result,
        data: new Date().toLocaleString()
      });
      arquivosLidos++;
      if (arquivosLidos === arquivos.length) {
        localStorage.setItem("arquivosPorPasta", JSON.stringify(arquivosPorPasta));
        renderizarDocumentos();
      }
    };
    reader.readAsDataURL(arquivo);
  });

  arquivoInput.value = "";
  fileNameSpan.textContent = "Nenhum arquivo selecionado";
});

function renderizarDocumentos() {
  const filtroValor = filtro?.value;
  let totalDocs = 0;
  docTable.innerHTML = "";

  const dados = JSON.parse(localStorage.getItem("arquivosPorPasta")) || {};
  for (const pasta in dados) {
    if (filtroValor && filtroValor !== "todas" && filtroValor !== pasta) continue;

    dados[pasta].forEach((doc, index) => {
      totalDocs++;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${doc.nome}</td>
        <td>${pasta}</td>
        <td>
          <button onclick="visualizarArquivo('${pasta}', ${index})" class="download-link">Abrir</button>
          <a href="${doc.conteudo}" download="${doc.nome}" class="download-link">Baixar</a>
        </td>
        <td>
          <button class="action delete" onclick="excluirDocumento('${pasta}', ${index})">Excluir</button>
        </td>`;
      docTable.appendChild(tr);
    });
  }
  document.getElementById("total-docs").textContent = `📄 Total de Documentos: ${totalDocs}`;
}

function excluirDocumento(pasta, index) {
  const dados = JSON.parse(localStorage.getItem("arquivosPorPasta"));
  dados[pasta].splice(index, 1);
  if (dados[pasta].length === 0) delete dados[pasta];
  localStorage.setItem("arquivosPorPasta", JSON.stringify(dados));
  renderizarDocumentos();
}

function visualizarArquivo(pasta, index) {
  const arquivosPorPasta = JSON.parse(localStorage.getItem("arquivosPorPasta"));
  const arquivo = arquivosPorPasta[pasta][index];
  const url = arquivo.conteudo;

  if (url.startsWith("data:") || url.startsWith("blob:")) {
    const novaJanela = window.open();
    if (!novaJanela) {
      alert("Por favor, permita pop-ups para visualizar o arquivo.");
      return;
    }
    novaJanela.document.write(`
      <!DOCTYPE html>
      <html>
      <head><title>${arquivo.nome}</title></head>
      <body style="margin:0;">
        <iframe src="${url}" width="100%" height="100%" style="border:none;"></iframe>
      </body>
      </html>
    `);
  } else {
    const win = window.open(url, '_blank');
    if (!win) {
      alert("Por favor, permita pop-ups para visualizar o arquivo.");
    }
  }
}

filtro?.addEventListener("change", renderizarDocumentos);
window.addEventListener("DOMContentLoaded", () => {
  carregarPastasSalvas();
  renderizarDocumentos();
});
