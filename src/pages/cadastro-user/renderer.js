document.addEventListener('DOMContentLoaded', async () => {
    
  try {

    const niveis = await window.electron.getNiveis();

    const select = document.querySelector('select');
    niveis.forEach(nivel => {
      const option = document.createElement('option');
      option.value = nivel.id;
      option.textContent = nivel.nomenivel;
      select.appendChild(option);
    })
 
    
  } catch (error) {
    console.error('Erro ao carregar o usuario:', error);
  }
})

document.getElementById('login-button').addEventListener('click', async () => {
  const nome = document.getElementById('username').value;
  const senha = document.getElementById('password').value;
  const telefone = document.getElementById('telefone').value;
  const email = document.getElementById('email').value;

  if (nome === "" || senha === "" || telefone === "", email === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha todos os campos.';
    return;
  }

  try {


    const response = await window.electron.addUser2(nome, senha);

    console.log('Resposta do backend:', response);

    window.location.href = '../login/index.html'

    if (response.success) {
      console.log('Insert bem-sucedido');
    } else {
      console.log('Falha no insert:', response.message);
    }
  } catch (err) {
    console.error('Erro ao tentar fazer o insert: '+ err);

  } 
})  