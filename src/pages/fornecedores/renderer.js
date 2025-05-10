// Seleciona o ícone de menu e a área do menu lateral
const menuPng = document.getElementById('menu-png');
const menuLateral = document.querySelector('.menu-lateral');
const home = document.querySelector('.home');

// Adiciona um ouvinte de evento para o clique no ícone do menu
menuPng.addEventListener('click', () => {
    // Alterna a classe 'menu-lateral-exibido' para mostrar ou esconder o menu
    menuLateral.classList.toggle('menu-lateral-exibido');
    // Alterna a classe 'menu-lateral-aberto' para ajustar a margem do conteúdo
    home.classList.toggle('menu-lateral-aberto');
});

document.addEventListener('DOMContentLoaded', async () => {
  const nomeUsuarioLogado = await window.electron.getUsuario();
  const nomeUser = document.getElementById("nome-user");
  nomeUser.innerHTML = nomeUsuarioLogado;

  const fornecedor = await window.electron.getFornecedor();

  const tabela = document.getElementById("tabela-fornecedor");
  tabela.innerHTML = ""; // limpa a tabela

  fornecedor.forEach((venda) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${venda.contrato || "N/A"}</td>
      <td>${venda.nome || "Não Cadastrado"}</td>
      <td>${venda.cnpj || "Não Cadastrado"}</td>
      <td>${venda.telefone || "Não Cadastrado"}</td>
      <td>${venda.cep || "Não Cadastrado"}</td>
      <td>${venda.email || "Não Cadastrado"}</td>
      <td>${venda.ativo || "Não Cadastrado"}</td>
    `;

    tabela.appendChild(tr);
  });
});

document.getElementById('redirect-cliente').addEventListener('click', async function() { 
  window.location.href = `../cliente-fornecedor/index.html`; // Redireciona para a tela de edição passando o ID
})

document.getElementById('cad-fornecedor').addEventListener('click', async function() { 
  window.location.href = `../cadastrar-fornecedor/index.html`; // Redireciona para a tela de edição passando o ID
})