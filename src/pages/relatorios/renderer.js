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

  const relatorioVenda = await window.electron.getRelatorioVenda();

  // Extrai os dados corretamente do objeto retornado
  const vendas = relatorioVenda.vendas;
  const total = relatorioVenda.total;

  const tabela = document.getElementById("tabela-relatorio");
  tabela.innerHTML = ""; // limpa a tabela

  vendas.forEach((venda) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${venda.nome || "N/A"}</td>
      <td>R$ ${parseFloat(venda.total).toFixed(2)}</td>
      <td>${venda.forma_pagamento}</td>
      <td>${new Date(venda.data_venda).toLocaleString()}</td>
      <td>${venda.usuario}</td>
    `;

    tabela.appendChild(tr);
  });

  // Exibe o total geral
  document.getElementById("valor").textContent = `[ +R$ ${parseFloat(total).toFixed(2)} ]`;
});