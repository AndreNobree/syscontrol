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
document.getElementById('btn-voltar').addEventListener('click', async () => {
    window.location.href = '../fornecedores/index.html'
})

document.querySelectorAll('.cnpj').forEach(input => {
  input.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 14) value = value.slice(0, 14);
    value = value.replace(/(\d{2})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1.$2');
    value = value.replace(/(\d{3})(\d)/, '$1/$2');
    value = value.replace(/(\d{4})(\d{1,2})$/, '$1-$2');
    this.value = value;
  });
});
document.querySelectorAll('.telefone').forEach(input => {
  input.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    this.value = value;
  });
});

document.querySelectorAll('.cep').forEach(input => {
  input.addEventListener('input', function () {
    let value = this.value.replace(/\D/g, '');
    if (value.length > 8) value = value.slice(0, 8);
    value = value.replace(/(\d{5})(\d)/, '$1-$2');
    this.value = value;
  });
});


document.addEventListener('DOMContentLoaded', async () => { 
  
    const nomeUsuarioLogado = await window.electron.getUsuario();
    const nomeUser = document.getElementById("nome-user");
    nomeUser.innerHTML = nomeUsuarioLogado;
})
document.getElementById('botao-cadastro').addEventListener('click', async () => {
    const nome = document.getElementById('nome').value.trim();
    const telefone = document.getElementById('telefone').value;
    const cnpj = document.getElementById('cnpj').value;
    const email = document.getElementById('email').value;
    const cep = document.getElementById('cep').value;
    const endereco = document.getElementById('endereco').value;
    // 
  
    const errorMessageDiv = document.getElementById('error-message');
    errorMessageDiv.style.display = 'none';  // Esconde a mensagem de erro
  
    const sucessMessageDiv = document.getElementById('sucess-message');
    sucessMessageDiv.style.display = 'none';  // Esconde a mensagem de erro
  
    // Verificar se os campos estão preenchidos
    if (nome === "") {
      errorMessageDiv.style.display = 'block';  // Mostra a área de erro
      errorMessageDiv.textContent = 'Por favor, preencha o nome do cliente.';
      return;
    }
    if (telefone === "") {
      errorMessageDiv.style.display = 'block';  // Mostra a área de erro
      errorMessageDiv.textContent = 'Por favor, preencha o número do celular do cliente.';
      return;
    }
    // if (cpf_cnpj === "") {
    //   errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    //   errorMessageDiv.textContent = 'Por favor, preencha o CPF ou CNPJ do cliente.';
    //   return;
    // }
    // if (email === "") {
    //   errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    //   errorMessageDiv.textContent = 'Por favor, preencha o email do cliente.';
    //   return;
    // }
    // if (cep === "") {
    //   errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    //   errorMessageDiv.textContent = 'Por favor, preencha o CEP do cliente.';
    //   return;
    // }
    // if (endereco === "") {
    //     errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    //     errorMessageDiv.textContent = 'Por favor, preencha o endereco do cliente.';
    //     return;
    // }
    // if (complemento === "") {
    //     errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    //     errorMessageDiv.textContent = 'Por favor, preencha a quantidade do cliente.';
    //     return;
    // }

  
    try {      
      sucessMessageDiv.style.display = 'block';  // Mostra a área de sucesso
      sucessMessageDiv.textContent = 'Fornecedor ' +nome+ ' inserido com sucesso';
      
      const response = await window.electron.addFornecedor(nome, telefone, cnpj, email, cep, endereco);
  
      
      window.location.reload();
  
  
      if (response.success) {
        console.log('sucesso')
      } else {
        console.log('Falha no insert:', response.message);
      }
    } catch (err) {
      console.error('Erro ao tentar fazer o insert:');
  
    } 
  
  })