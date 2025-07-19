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
    window.location.href = '../estoque/index.html'
})

document.addEventListener('DOMContentLoaded', async () => { 
    try {
      const nomeUsuarioLogado = await window.electron.getUsuario();
      const nomeUser = document.getElementById("nome-user");
      nomeUser.innerHTML = nomeUsuarioLogado;
    
      const categorias = await window.electron.getCategorias();
      

      const select = document.getElementById('filtro');
      categorias.forEach(categoria => {
        const option = document.createElement('option');
        option.value = categoria.id;
        option.textContent = categoria.categoria;
        select.appendChild(option);
      }); 

    } catch (err) {
        console.error('Erro ao carregar os produtos:', err);
    }
});

document.addEventListener('DOMContentLoaded', async () => { 
    try {
      const fornecedores = await window.electron.getFornecedorCadastro()
      const select = document.getElementById('fornecedor');
        fornecedores.forEach(fornecedor => {
          const option = document.createElement('option');
          option.value = fornecedor.nome;
          option.textContent = fornecedor.nome;
          select.appendChild(option);
      }); 
} catch (err) {
        console.error('Erro ao carregar os produtos:', err);
    }
});

document.getElementById('botao-adicionar').addEventListener('click', async () => {
  const codigo = document.getElementById('codigo').value.trim();
  const produto = document.getElementById('produto').value;
  let preco = document.getElementById('preco-venda').value;
  const quantidade = document.getElementById('quantidade').value;
  let desconto = document.getElementById('desconto').value;
  const idcat = document.getElementById('filtro').value;
  let idfornecedor  = document.getElementById('fornecedor').value;
  let precocompra = document.getElementById('preco-compra').value;
  let precoprazo = document.getElementById('preco-prazo').value;
  // let garantia = document.getElementById('garantia').value;
  // let comissao = document.getElementById('comissao').value;

  const errorMessageDiv = document.getElementById('error-message');
  errorMessageDiv.style.display = 'none';  // Esconde a mensagem de erro

  const sucessMessageDiv = document.getElementById('sucess-message');
  sucessMessageDiv.style.display = 'none';  // Esconde a mensagem de erro

  // Verificar se os campos estão preenchidos
  if (codigo === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha o código do produto.';
    return;
  }
  if (idcat === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha a categoria.';
    return;
  }
  if (produto === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha o nome do produto.';
    return;
  }
  if (preco === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha o preço do produto.';
    return;
  }
  if (quantidade === "") {
    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Por favor, preencha a quantidade do produto.';
    return;
  }
  preco = preco?.toString() || "0";
  precocompra = precocompra?.toString() || "0";
  precoprazo = precoprazo?.toString() || "0";
  
  preco = preco.replace(',', '.');
  precocompra = precocompra.replace(',', '.');
  precoprazo = precoprazo.replace(',', '.');

  try {

    if (desconto.trim() === "") {
      desconto = 0
    } else {
      desconto = desconto.replace(',', '.');

      // Verificar se o desconto contém a porcentagem e converter para decimal
      if (desconto.includes('%')) {
        desconto = parseFloat(desconto.replace('%', '').trim()) / 100;
      } else {
        desconto = parseFloat(desconto);
      }
    }
    // if (garantia.trim() ===""){
    //   garantia = 0
    // }

    preco = preco.replace(',', '.');

    
    sucessMessageDiv.style.display = 'block';  // Mostra a área de sucesso
    sucessMessageDiv.textContent = 'Produto ' +produto+ ' inserido com sucesso';
    
    const response = await window.electron.addProduto(codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor);

    
    window.location.reload();


    if (response.success) {
      console.log('sucesso')
    } else {
      console.log('Falha no insert:', response.message);
    }
  } catch (err) {
    console.error('Erro ao tentar fazer o insert: '+ err);

  } 

})

