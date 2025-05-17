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

    const faturamentoDias = await window.electron.getFaturamento();
    const tagFaturamento = document.getElementById("total-faturamento");
    tagFaturamento.innerHTML = "R$"+faturamentoDias;

    const getQuantidadeVendas = await window.electron.getQuantidadeVendas();
    const tagQuantidadeVendas = document.getElementById("quantidade-vendas");
    tagQuantidadeVendas.innerHTML = getQuantidadeVendas+" Realizadas";

    const lucroDias = await window.electron.getLucro();
    const tagLucroDias = document.getElementById("total-vendas");
    tagLucroDias.innerHTML = "R$"+lucroDias;
    
    
})