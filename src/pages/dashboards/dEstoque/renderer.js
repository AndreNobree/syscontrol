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
    //usuario logado
    const nomeUsuarioLogado = await window.electron.getUsuario();
    const nomeUser = document.getElementById("nome-user");
    nomeUser.innerHTML = nomeUsuarioLogado;

    //total em estoque
    const getTotalEstoque = await window.electron.getTotalEstoque();
    const tagTotalEstoque = document.getElementById("total-estoque");
    tagTotalEstoque.innerHTML = `[ R$ ${parseFloat(getTotalEstoque).toFixed(2).replace('.', ',')} ]`;

    //total em saida
    const getQuantidadeSaida = await window.electron.getQuantidadeSaida();
    const tagQuantidadeSaida = document.getElementById("total-saida");
    tagQuantidadeSaida.innerHTML = "[ "+getQuantidadeSaida+" produtos ]";
})




document.getElementById('vendas').addEventListener('click', async function() { 
  window.location.href = `../dVendas/index.html`; 
})

document.getElementById('geral').addEventListener('click', async function() { 
  window.location.href = `../index.html`; 
})

