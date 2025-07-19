// Menu lateral toggle
const menuPng = document.getElementById('menu-png');
const menuLateral = document.querySelector('.menu-lateral');
const home = document.querySelector('.home');
menuPng.addEventListener('click', () => {
  menuLateral.classList.toggle('menu-lateral-exibido');
  home.classList.toggle('menu-lateral-aberto');
});

// Carregamento inicial
window.addEventListener('DOMContentLoaded', async () => {
  const nomeUsuarioLogado = await window.electron.getUsuario();
  document.getElementById("nome-user").textContent = nomeUsuarioLogado;

  carregarTopProdutos();
  carregarGraficoPizza30Dias();
  carregarGraficoLinhaHoras();
  carregarGraficoBarraMes();
  carregarGraficoFormaPagamento();
  carregarGraficoLinha7Dias();
});

async function carregarTopProdutos() {
  const produtos = await window.electron.getProdutosMaisVendidos();
  const tabela = document.getElementById("tabela-produtos");
  tabela.innerHTML = "";
  produtos.forEach((p, index) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>#${index + 1}</td><td>${p.produto}</td><td>${p.total_vendido}</td>`;
    tabela.appendChild(tr);
  });
}

async function carregarGraficoPizza30Dias() {
  const data = await window.electron.getVendasPorTrintaDias();
  const total = data[0]; // como só vem uma linha

  const labels = ['Vendas (R$)', 'Lucro (R$)'];
  const valores = [parseFloat(total.faturamento), parseFloat(total.lucro)];

  new Chart(document.getElementById('grafico-pizza-vendas-lucro'), {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        label: 'Distribuição',
        data: valores,
        backgroundColor: ['#CA6924', '#2d89ef']
      }]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Vendas e Lucros dos Últimos 30 dias', // <-- Título desejado
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


async function carregarGraficoLinhaHoras() {
  const data = await window.electron.getVendasPorDia();
  const horas = data.map(d => d.hora);
  const vendas = data.map(d => parseFloat(d.faturamento));
  const lucros = data.map(d => parseFloat(d.lucro));

  new Chart(document.getElementById('grafico-linhas-horas'), {
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

async function carregarGraficoBarraMes() {
  const data = await window.electron.getVendasPorDozeMeses();
  const meses = data.map(d => d.mes_ano);
  const vendas = data.map(d => parseFloat(d.faturamento));
  const lucros = data.map(d => parseFloat(d.lucro));

  new Chart(document.getElementById('grafico-barras-mes'), {
    type: 'bar',
    data: {
      labels: meses,
      datasets: [
        {
          label: 'Vendas (R$)',
          data: vendas,
          backgroundColor: '#CA6924'
        },
        {
          label: 'Lucro (R$)',
          data: lucros,
          backgroundColor: '#2d89ef'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          stacked: false,
          ticks: {
            maxRotation: 0,
            minRotation: 0
          }
        },
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        title: {
          display: true,
          text: 'Vendas/Lucro do Ano', // <-- Título desejado
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

async function carregarGraficoFormaPagamento() {
  const data = await window.electron.getVendasPorPagamento();
  const labels = data.map(d => d.forma_pagamento);
  const valores = data.map(d => parseFloat(d.total_pagamento));

  new Chart(document.getElementById('grafico-pizza-pagamento'), {
    type: 'pie',
    data: {
      labels,
      datasets: [
        {
          label: 'Forma de Pagamento',
          data: valores,
          backgroundColor: ['#CA6924', '#2d89ef', '#fbbc05', '#34a853', '#9b59b6']
        }
      ]
    },
    options: {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Formas de Pagamento - Últimos 30 dias', 
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

async function carregarGraficoLinha7Dias() {
  const data = await window.electron.getVendasSeteDias();

  const labels = data.map(d => d.dia);
  const faturamento = data.map(d => parseFloat(d.faturamento));
  const lucro = data.map(d => parseFloat(d.lucro));

  new Chart(document.getElementById('grafico-linhas-sete-dias'), {
    type: 'line',
    data: {
      labels,
      datasets: [
        {
          label: 'Vendas (R$)',
          data: faturamento,
          borderColor: '#CA6924',
          backgroundColor: 'rgba(202, 105, 36, 0.2)',
          fill: true,
          tension: 0.3
        },
        {
          label: 'Lucro (R$)',
          data: lucro,
          borderColor: '#2d89ef',
          backgroundColor: 'rgba(45, 137, 239, 0.2)',
          fill: true,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true
        }
      },
      plugins: {
        title: {
          display: true,
          text: 'Vendas e Lucro dos Últimos 7 Dias', // <-- Título desejado
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


document.getElementById('geral').addEventListener('click', async function() { 
  window.location.href = `../index.html`; 
})

document.getElementById('estoque').addEventListener('click', async function() { 
  window.location.href = `../dEstoque/index.html`; 
})