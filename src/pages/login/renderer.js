document.getElementById('login-button').addEventListener('click', async () => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Limpar mensagens de erro anteriores
  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.style.display = 'none';  // Esconde a mensagem de erro

  // Verificar se os campos estão preenchidos
  if (!username || !password) {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha ambos os campos.';
    return;
  }

  try {
    console.log('Enviando dados para verificação:', username, password);

    const response = await window.electron.verifyLogin(username, password);

    console.log('Resposta do backend:', response);

    if (response.success) {
      console.log('Login bem-sucedido');
      window.location.href = '../estoque/index.html';  // Redireciona para outra página
    } else {
      console.log('Falha no login:', response.message);
      errorMessageDiv.style.display = 'block';  // Mostra a área de erro
      errorMessageDiv.textContent = response.message;
    }
  } catch (err) {
    console.error('Erro ao tentar fazer login:', err);
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Erro ao tentar fazer login. Tente novamente.';
  }
});

