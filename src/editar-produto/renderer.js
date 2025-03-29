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
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id'); // Pega o ID do produto da URL

    if (!productId) {
      alert("Produto não encontrado.");
      return;
    }

    // Carrega os dados do produto a partir do ID (você precisará de uma função para pegar esses dados)
    const product = await window.electron.getProductById(productId); // Aqui você precisa implementar a função `getProductById` no main process

    // Preenche os campos do formulário com os dados do produto
    document.getElementById('codigo').value = product.codigo.trim();
    document.getElementById('produto').value = product.produto.trim();
    document.getElementById('preco').value = product.preco.trim();
    document.getElementById('quantidade').value = product.quantidade.trim();
    document.getElementById('desconto').value = product.desconto.trim();
    document.getElementById('id-registro').value = product.id.trim();

    // Preenche as categorias
    const selectCategoria = document.getElementById('filtro');
    const categorias = await window.electron.getCategorias(); // Pega as categorias

    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.categoria;
      if (categoria.id === product.idcat) {
        option.selected = true; // Marca a categoria do produto
      }
      selectCategoria.appendChild(option);
    });

  } catch (err) {
    console.error('Erro ao carregar os dados do produto:', err);
  }
});

document.getElementById('btn-voltar').addEventListener('click', async () => {
  window.location.href = '../estoque/index.html'
})

document.getElementById('botao-editar').addEventListener('click', async () => {
  const codigo = document.getElementById('codigo').value;
  const produto = document.getElementById('produto').value;
  let preco = document.getElementById('preco').value;
  const quantidade = document.getElementById('quantidade').value;
  let desconto = document.getElementById('desconto').value;
  const categoriaSelecionada = document.getElementById('filtro').value;
  const idRegistro = document.getElementById('id-registro').value;

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
  if (categoriaSelecionada === "") {
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

    preco = preco.replace(',', '.');

    errorMessageDiv.style.display = 'block';  // Mostra a área de erro
    errorMessageDiv.textContent = 'Alteração do produto '+ produto + ' foi bem sucedida.';

    const response = await window.electron.editProduto(codigo, produto, preco, quantidade, desconto, categoriaSelecionada, idRegistro);

    console.log('Resposta do backend:', response);

    if (response.success) {
      console.log('Insert bem-sucedido');
    } else {
      console.log('Falha no insert:', response.message);
    }
  } catch (err) {
    console.error('Erro ao tentar fazer o insert:');

  } 

})