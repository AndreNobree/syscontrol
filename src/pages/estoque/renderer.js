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
    const nomeUsuarioLogado = await window.electron.getUsuario();
    const nomeUser = document.getElementById("nome-user");
    nomeUser.innerHTML = nomeUsuarioLogado;
  
    const products = await window.electron.getProducts();
    const categorias = await window.electron.getCategorias();

    const tbody = document.querySelector('table tbody');
    const filtroNomeInput = document.querySelector('#filtro-nome');  
    const removerBtn = document.querySelector('#remover');  // Referência ao botão de remoção

    // Função para exibir os produtos na tabela
    function exibirProdutos(products) {
      tbody.innerHTML = '';  
      products.forEach(product => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td><input type="checkbox" class="product-checkbox" data-id="${product.id}"></td>  
          <td><img src="../../../media/edit.png" class="edit" data-id="${product.id}" ></td>
          <td>${product.codigo}</td>
          <td>${product.produto}</td>
          <td>${product.categoria}</td>
          <td>R$${parseFloat(product.preco).toFixed(2)}</td>
          <td>${product.quantidade}</td>
        `;
        tbody.appendChild(row);
      });
    }

    tbody.addEventListener('click', (e) => {
      if (e.target && e.target.classList.contains('edit')) {
        const productId = e.target.getAttribute('data-id'); // Pega o ID do produto
        window.location.href = `../editar-produto/index.html?id=${productId}`; // Redireciona para a tela de edição passando o ID
      }
    });
    
    // Exibe os produtos ao carregar a página
    exibirProdutos(products);

    // Função para filtrar produtos
    function filtrarProdutos() {
      const filtroNome = filtroNomeInput.value.toLowerCase();  
      const produtosFiltrados = products.filter(product => 
        product.produto.toLowerCase().includes(filtroNome)  
      );
      exibirProdutos(produtosFiltrados);
    }

    filtroNomeInput.addEventListener('input', filtrarProdutos);

    const select = document.querySelector('select');
    categorias.forEach(categoria => {
      const option = document.createElement('option');
      option.value = categoria.id;
      option.textContent = categoria.categoria;
      select.appendChild(option);
    });

    select.addEventListener('change', async (e) => {
      const categoriaId = e.target.value;
      let filteredProducts = products;
      if (categoriaId) {
        filteredProducts = await window.electron.getProducts(categoriaId);
      }
      exibirProdutos(filteredProducts);
    });

    // Função para remover os produtos selecionados
    removerBtn.addEventListener('click', async () => {
      const selectedCheckboxes = document.querySelectorAll('.product-checkbox:checked');  // Seleciona todos os checkboxes marcados
      const productIds = Array.from(selectedCheckboxes).map(checkbox => checkbox.dataset.id);  // Pega os IDs dos produtos selecionados

      if (productIds.length > 0) {
        // Chama a função no main.js para deletar os produtos
        const result = await window.electron.deleteProducts(productIds);
        
        if (result.success) {
          const updatedProducts = await window.electron.getProducts();
          exibirProdutos(updatedProducts);
        } else {
          console.log('erro')
        }
      } else {
        console.log('erro')
      }
    });

  } catch (err) {
    console.error('Erro ao carregar os produtos:', err);
  }
});

document.getElementById('adicionar').addEventListener('click', async () => {
  window.location.href = '../adicionar-produto/index.html'
})

