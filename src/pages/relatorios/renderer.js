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
    const relatorioVenda = await window.electron.getRelatorioVenda();

    const tabela = document.getElementById("tabela-relatorio");
    
    // Limpa antes de adicionar novas linhas, caso rode mais de uma vez
    tabela.innerHTML = "";
    
    relatorioVenda.forEach((venda) => {
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
    document.getElementById("valor").textContent = `Total do dia: R$ ${parseFloat(total).toFixed(2)}`;    
})