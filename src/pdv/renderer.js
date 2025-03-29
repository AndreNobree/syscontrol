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

//tecla f10
window.addEventListener('keydown', (event) => {
    if (event.key === 'F1') {
      const finalizaBotao = document.getElementById('finalizar-compra');
      if (finalizaBotao) {
        finalizaBotao.click();  // Simula o clique do botão
      }
    }
});

//foco no input codigo
document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('codigo');
    if (input) {
      input.focus();
    }
});

//retornar produtos no dropdown search
document.addEventListener('DOMContentLoaded', async () => { 
  try {
    const prod = await window.electron.getProdutosSelect();

    const select = document.getElementById('search');
    

    prod.forEach(produto => {
      const option = document.createElement('option');
      option.value = produto.id;
      option.textContent = produto.produto;
      select.appendChild(option);
  });

  } catch (err) {
      console.error('Erro ao carregar os produtos:', err);
  }
});


//finaliza compra
document.getElementById('finalizar-compra').addEventListener('click', async () => {
    console.log("apertou aqui babaca")
})