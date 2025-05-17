// Seleciona o ícone de menu e a área do menu lateral
const menuPng = document.getElementById('menu-png');
const menuLateral = document.querySelector('.menu-lateral');
const home = document.querySelector('.home');
const searchInput = document.getElementById("searchInput");
const dropdownList = document.getElementById("dropdownList");
const items = dropdownList.getElementsByTagName("a");
const input = document.getElementById('codigo');
let total = 0;

// Adiciona um ouvinte de evento para o clique no ícone do menu
menuPng.addEventListener('click', () => {
    // Alterna a classe 'menu-lateral-exibido' para mostrar ou esconder o menu
    menuLateral.classList.toggle('menu-lateral-exibido');
    // Alterna a classe 'menu-lateral-aberto' para ajustar a margem do conteúdo
    home.classList.toggle('menu-lateral-aberto');
});

//tecla f2
window.addEventListener('keydown', (event) => {
    if (event.key === 'F2') {
      const finalizaBotao = document.getElementById('finalizar-compra');
      if (finalizaBotao) {
        finalizaBotao.click();  // Simula o clique do botão
      }
    }
});

//tecla f4
window.addEventListener('keydown', (event) => {
  if (event.key === 'F4') {
    const removeItem = document.getElementById('delete-item');
    if (removeItem) {
      removeItem.click();  // Simula o clique do botão
    }
  }
});

//tecla insert
window.addEventListener('keydown', (event) => {
  if (event.key === 'Insert') {
    const addItem = document.getElementById('add-item');
    if (addItem) {
      addItem.click();  // Simula o clique do botão
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

//retornar os dados do bd na tabela do caixa
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const nomeUsuarioLogado = await window.electron.getUsuario();
    const nomeUser = document.getElementById("nome-user");
    nomeUser.innerHTML = nomeUsuarioLogado;
  
    const caixa = await window.electron.getCaixa(); // Recebe os dados da tabela 'caixa'
    
    if (caixa && caixa.length > 0) {
      // Obtém o corpo da tabela (<tbody>) onde as linhas serão adicionadas
      const tbody = document.querySelector('table tbody');
      
      // Limpa o corpo da tabela para garantir que não haja dados antigos
      tbody.innerHTML = '';

      // Variável para acumular o total
      let totalSubtotal = 0;

      // Para cada item da tabela 'caixa', crie uma nova linha e insira os dados
      caixa.forEach(item => {
        const row = document.createElement('tr'); // Cria uma nova linha (<tr>)

        // Cria as células (<td>) para cada dado da tabela
        const tdQuantidade = document.createElement('td');
        tdQuantidade.textContent = item.quantidade;
        tdQuantidade.classList.add('quantidade'); // Adiciona a classe 'quantidade'

        const tdNome = document.createElement('td');
        tdNome.textContent = item.produto;
        tdNome.classList.add('nome'); // Adiciona a classe 'nome'
        
        // Garantir que 'preco' seja um número e formatá-lo com .toFixed()
        const preco = parseFloat(item.preco);
        const tdPreco = document.createElement('td');
        tdPreco.textContent = !isNaN(preco) ? preco.toFixed(2) : '0.00';  // Verifica se 'preco' é um número válido
        tdPreco.classList.add('preco'); // Adiciona a classe 'preco'
        
        // Desconto
        const desconto = parseFloat(item.desconto);
        const tdDesconto = document.createElement('td');
        tdDesconto.textContent = !isNaN(desconto) && desconto >= 0 ? `${desconto.toFixed(2)}%` : '0.00%';  // Verifica se 'desconto' é um número válido
        tdDesconto.classList.add('desconto'); // Adiciona a classe 'desconto'
        
        // Calculando o preço com desconto
        const precoDesc = !isNaN(preco) && !isNaN(desconto) ? preco - (preco * desconto / 100) : preco;
        const tdPrecoDesc = document.createElement('td');
        tdPrecoDesc.textContent = precoDesc.toFixed(2);  // Calcula e exibe o preço com desconto
        tdPrecoDesc.classList.add('precodesconto'); // Adiciona a classe 'precodesconto'
        
        const tdTotal = document.createElement('td');
        tdTotal.textContent = item.total;
        tdTotal.classList.add('codigo'); // Adiciona a classe 'codigo'
        
        // Adiciona as células à linha
        row.appendChild(tdQuantidade);
        row.appendChild(tdNome);
        row.appendChild(tdPreco);
        row.appendChild(tdDesconto);
        row.appendChild(tdPrecoDesc);
        row.appendChild(tdTotal);

        // Adiciona a linha ao corpo da tabela
        tbody.appendChild(row);

        // Acumula o valor total
        const totalItem = parseFloat(item.total);
        if (!isNaN(totalItem)) {
          totalSubtotal += totalItem;
        }
      });

      // Atualiza o subtotal no <h4>
      const h4Subtotal = document.querySelector('.valor-subtotal h4');
      if (h4Subtotal) {
        total = totalSubtotal.toFixed(2)
        h4Subtotal.textContent = `R$ ${total}`;
      }
    } else {
      console.log('Nenhum produto encontrado.');
    }
  } catch (err) {
    console.log('Erro ao carregar a tabela', err);
  }
});

// retornar dados do bd na tabela do popup
document.getElementById('delete-item').addEventListener('click', async function() { 
  // Exibe o popup
  document.getElementById('popup').style.display = 'flex';
  
  try {
    // Obter os dados da tabela 'caixa' (dados do banco)
    const caixa = await window.electron.getCaixa(); 
    
    if (caixa && caixa.length > 0) {
      // Obtém o corpo da tabela <tbody> para a tabela de 'caixa'
      const tbodyPopup = document.querySelector('#tabela-popup tbody');
      
      // Limpa o corpo da tabela para garantir que não haja dados antigos
      tbodyPopup.innerHTML = '';

      caixa.forEach(item => {
        // Criando a linha com template string
        const row = document.createElement('tr');
        

        row.innerHTML = `
          <td><img src="../../../media/x.png" class="edit" data-id="${item.id}" style="width: 20px; height: 20px; cursor: pointer;" ></td>
          <td>${item.quantidade}</td> 
          <td>${item.produto}</td> 
          <td>R$${parseFloat(item.preco)}</td> 
          <td>${item.desconto}%</td> 
          <td>R$${item.precodesc}</td> 
          <td>R$${parseFloat(item.total)}</td> 
        `;

        // Evento de clique na imagem de edição
        const editImage = row.querySelector('.edit');
        editImage.addEventListener('click', async function() {
          const itemId = editImage.getAttribute('data-id');
          try {
            const response = await window.electron.deleteCaixa(itemId);
            window.location.reload(); // Recarrega a página
            console.log('Item deletado:', response);
          } catch (error) {
            console.log('Erro ao deletar item:', error);
          }
        });

        // Adiciona a linha ao corpo da tabela no popup
        tbodyPopup.appendChild(row);
      });
    } else {
      console.log('Nenhum produto encontrado.');
    }
  } catch (err) {
    console.log('Erro ao carregar a tabela', err);
  }
});

// Função para fechar o popup
document.getElementById('close-btn').addEventListener('click', function() {
  // Esconde o popup
  document.getElementById('popup').style.display = 'none';
});


// Fecha o popup se o usuário clicar fora da área do popup
window.addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup')) {
      document.getElementById('popup').style.display = 'none';
  }
});

document.getElementById('close-btn2').addEventListener('click', function() {
  // Esconde o popup
  document.getElementById('popup2').style.display = 'none';
});


window.addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup2')) {
    document.getElementById('popup2').style.display = 'none';
  }
});

document.getElementById('close-btn3').addEventListener('click', function() {
  // Esconde o popup
  document.getElementById('popup3').style.display = 'none';
});

window.addEventListener('click', function(event) {
  if (event.target === document.getElementById('popup3')) {
    document.getElementById('popup3').style.display = 'none';
  }
});

//verifica o numero de caracteres do input
input.addEventListener('input', function() {
  // Verifica a quantidade de caracteres no valor do input
  if (input.value.length > 12) {
    const input = document.getElementById('quantidade');
    if (input) {
      input.focus();
    }
  }
});

//adiciona item caixa
document.getElementById('add-item').addEventListener('click', async () => {
  
  const codigo = document.getElementById('codigo').value.trim();
  
  
  let quantidade = document.getElementById('quantidade').value;
  
  if (codigo == 0 || codigo == ""){
    document.getElementById('error-message').style.display = 'block';
    
  }else{
    if (isNaN(quantidade) || quantidade <= 0) {
      quantidade = 1;
    }
    try {      
      const response = await window.electron.getProductForCaixa(codigo, quantidade);
      console.log(response);
      window.location.reload(); // Recarrega a página
    } catch (err) {
      
      console.error('Erro ao tentar fazer o insert:', err);
    }}

  
});


//finaliza compra
document.getElementById('finalizar-compra').addEventListener('click', async () => {
  if (total != 0){
    document.getElementById('popup2').style.display = 'flex';
  }else{
    console.log()
  }
  
})

//configurações do dropdown search 
searchInput.addEventListener("input", function() {
    const filter = searchInput.value.toLowerCase();
    let hasMatch = false;
    
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const text = item.textContent || item.innerText;
        
        if (text.toLowerCase().includes(filter)) {
            item.style.display = "";
            hasMatch = true;
        } else {
            item.style.display = "none";
        }
    }

    if (filter === "") {
        dropdownList.classList.remove("show");
    } else if (hasMatch) {
        dropdownList.classList.add("show");
    }
});

searchInput.addEventListener("focus", function() {
    dropdownList.classList.add("show");
});

searchInput.addEventListener("blur", function() {
    setTimeout(() => {
        dropdownList.classList.remove("show");
    }, 200);
});

//retornar produtos no dropdown search
document.addEventListener('DOMContentLoaded', async () => {  
  try {
    const prod = await window.electron.getProdutosSelect();

    const select = document.getElementById('dropdownList');
    
    prod.forEach(produto => {
      const tagA = document.createElement('a');
      
      // Definindo um ID único para cada tag <a>
      tagA.id = `produto-${produto.id}`; 
      
      // Texto da tag <a>
      tagA.textContent = `${produto.produto}  [${produto.quantidade}]`;

      // preenchimento de inputs
      tagA.addEventListener('click', () => {
        const inputCodigo = document.getElementById('codigo');  
        inputCodigo.value = produto.codigo;  
        const inputPreco = document.getElementById('preco-unit');  
        inputPreco.value = `R$${produto.preco}`;  
        const inputProduto = document.getElementById('searchInput');  
        inputProduto.value = produto.produto.trim(); 
        const inputDesconto = document.getElementById('desconto');  
        inputDesconto.value = `${produto.desconto.trim()}%`; 
      });

      // Adicionando a tag <a> no dropdown
      select.appendChild(tagA);
    });

  } catch (err) {
    console.error('Erro ao carregar os produtos:', err);
  }
});

//aplica desconto total
window.addEventListener('keydown', async (event) => {
  if (event.key === 'F3') {
    if (total !== 0) {
      document.getElementById('popup3').style.display = 'flex';

      try {
        // Obter os dados da tabela 'caixa' (dados do banco)
        const desconto = await window.electron.getDesconto();

        if (desconto && desconto.length > 0) {
          const tbodyPopup = document.querySelector('#tabela-popup3 tbody');
          tbodyPopup.innerHTML = ''; // limpa linhas antigas

          desconto.forEach(item => {
            const row = document.createElement('tr');

            row.innerHTML = `
              <td>${item.produto}</td> 
              <td>${item.desconto}%</td> 
              <td>R$${parseFloat(item.preco)}</td> 
              <td>R$${parseFloat(item.precodesc)}</td> 
            `;

            tbodyPopup.appendChild(row);
          });
        } else {
          console.log('Nenhum produto encontrado.');
        }
      } catch (err) {
        console.log('Erro ao carregar a tabela:', err);
      }

    } else {
      console.log('Total é 0, popup não será exibido.');
    }
  }
});


// pagamento dinheiro
document.getElementById('dinheiro').addEventListener('click', async () => {
  
  try {    
    const response = await window.electron.attCaixaRelatorio('dinheiro', total);
    console.log(response);
    window.location.reload(); // Recarrega a página
  } catch (err) {
    
    console.error('Erro ao tentar fazer o insert:', err);
  }
})


// pagamento pix
document.getElementById('pix').addEventListener('click', async () => {
  let pagamento = 'pix'
  try {    
    const response = await window.electron.attCaixaRelatorio(pagamento, total);
    console.log(response);
    window.location.reload(); // Recarrega a página
  } catch (err) {
    
    console.error('Erro ao tentar fazer o insert:', err);
  }
})


// pagamento credito
document.getElementById('credito').addEventListener('click', async () => {
  let pagamento = 'credito'
  try {    
    const response = await window.electron.attCaixaRelatorio(pagamento, total);
    console.log(response);
    window.location.reload(); // Recarrega a página
  } catch (err) {
    
    console.error('Erro ao tentar fazer o insert:', err);
  }
})


// pagamento debito
document.getElementById('debito').addEventListener('click', async () => {
  let pagamento = 'debito'
  try {    
    const response = await window.electron.attCaixaRelatorio(pagamento, total);
    console.log(response);
    window.location.reload(); // Recarrega a página
  } catch (err) {
    
    console.error('Erro ao tentar fazer o insert:', err);
  }
})