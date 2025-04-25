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

    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id'); // Pega o ID do produto da URL
    
    console.log(userId)

    if (!userId) {
      alert("Usuário não encontrado.");
      return;
    }
    
    try {
      // Carrega os dados do produto a partir do ID
      const user = await window.electron.getUserById(userId);
    
      if (!user) {
        alert("Usuario não encontrado.");
        return;
      }
    
      // Preenche os campos do formulário com os dados do produto
      document.getElementById('nome').value = user.usuario
      document.getElementById('filtro').value = user.nomenivel
    
      
    } catch (error) {
      console.error('Erro ao carregar o produto:', error);
    }
})

document.getElementById('btn-voltar').addEventListener('click', async () => {
    window.location.href = '../usuarios/index.html'
  })