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
  
    const allUsers = await window.electron.getAllUsers(); // <- array direto
  
    const tabela = document.getElementById("tabela-users");
    tabela.innerHTML = "";
  
    allUsers.forEach((user) => {
      const tr = document.createElement("tr");
  
      tr.innerHTML = `
        <td><img src="../../../media/edit.png" class="edit" data-id="${user.id}" ></td>
        <td>${user.usuario || "N/A"}</td>
        <td>${user.idnivel}</td>
        <td>${user.nomenivel}</td>
      `;
  
      tabela.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('edit')) {
          const userId = e.target.getAttribute('data-id'); // Pega o ID do produto
          window.location.href = `../editar-usuario/index.html?id=${userId}`; // Redireciona para a tela de edição passando o ID
        }
      });

      tabela.appendChild(tr);
    });
  });

document.getElementById('cad-user').addEventListener('click', async () => {
  window.location.href = '../cadastrar-usuario/index.html'
})
  