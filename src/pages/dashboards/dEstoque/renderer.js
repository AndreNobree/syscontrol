// Seleciona o ícone de menu e a área do menu lateral
const menuPng = document.getElementById('menu-png');
const menuLateral = document.querySelector('.menu-lateral');
const home = document.querySelector('.home');

const searchInput = document.getElementById("searchInput");
const dropdownList = document.getElementById("dropdownList");
let total = 0;

// Adiciona um ouvinte de evento para o clique no ícone do menu
menuPng.addEventListener('click', () => {
    // Alterna a classe 'menu-lateral-exibido' para mostrar ou esconder o menu
    menuLateral.classList.toggle('menu-lateral-exibido');
    // Alterna a classe 'menu-lateral-aberto' para ajustar a margem do conteúdo
    home.classList.toggle('menu-lateral-aberto');
});

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

      // Adicionando a tag <a> no dropdown
      select.appendChild(tagA);
    });

  } catch (err) {
    console.error('Erro ao carregar os produtos:', err);
  }
});

async function carregarGraficoLinhaHoras() {
  const data = await window.electron.getVendasPorDia();
  const horas = data.map(d => d.hora);
  const vendas = data.map(d => parseFloat(d.faturamento));
  const lucros = data.map(d => parseFloat(d.lucro));

  new Chart(document.getElementById('grafico-linhas-movimentacoes'), {
    type: 'line',
    data: {
      labels: horas,
      datasets: [
        {
          label: 'Vendas (R$)',
          data: vendas,
          borderColor: '#CA6924',
          fill: false
        },
        {
          label: 'Lucro (R$)',
          data: lucros,
          borderColor: '#2d89ef',
          fill: false
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: { beginAtZero: true }
      },
      plugins: {
        title: {
          display: true,
          text: 'Vendas Relializadas nas Últimas 24 horas', // <-- Título desejado
          font: {
            size: 16,
            weight: 'bold',
          },
          color: '#333',
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          position: 'top'
        }
      }
    }
  });
}


document.getElementById('vendas').addEventListener('click', async function() { 
  window.location.href = `../dVendas/index.html`; 
})

document.getElementById('geral').addEventListener('click', async function() { 
  window.location.href = `../index.html`; 
})

document.getElementById('clientes').addEventListener('click', async function() { 
  window.location.href = `../dClientes/index.html`; 
})

