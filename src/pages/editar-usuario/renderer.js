// Seleciona o ícone de menu e a área do menu lateral
const menuPng = document.getElementById('menu-png');
const menuLateral = document.querySelector('.menu-lateral');
const home = document.querySelector('.home');

const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get('id'); // Pega o ID do produto da URL

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

    

    if (!userId) {
      alert("Usuário não encontrado.");
      return;
    }
    
    try {

      const niveis = await window.electron.getNiveis();

      const select = document.querySelector('select');
      niveis.forEach(nivel => {
        const option = document.createElement('option');
        option.value = nivel.id;
        option.textContent = nivel.nomenivel;
        select.appendChild(option);
      })

      // Carrega os dados do produto a partir do ID
      const user = await window.electron.getUserById(userId);
    
      if (!user) {
        alert("Usuario não encontrado.");
        return;
      }
    
      // Preenche os campos do formulário com os dados do produto
      document.getElementById('nome').value = user.usuario
    
      
    } catch (error) {
      console.error('Erro ao carregar o produto:', error);
    }
})

document.getElementById('btn-voltar').addEventListener('click', async () => {
    window.location.href = '../usuarios/index.html'
})

document.getElementById('botao-editar').addEventListener('click', async () => {
  const nome = document.getElementById('nome').value;
  const cargo = document.getElementById('filtro').value;
  const senha = document.getElementById('senha').value;

  if (nome === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha o usuario.';
    return;
  }
  if(senha === ""){
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha a senha.';
    return;
  }
  if(cargo === ""){
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha o cargo.';
    return;
  }

  try {


    const response = await window.electron.updateEditUser(nome, senha, cargo, userId);

    console.log('Resposta do backend:', response);

    window.location.href = '../usuarios/index.html'

    if (response.success) {
      console.log('Insert bem-sucedido');
    } else {
      console.log('Falha no insert:', response.message);
    }
  } catch (err) {
    console.error('Erro ao tentar fazer o insert: '+ err);

  } 
})
