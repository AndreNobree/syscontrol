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

    const faturamentoDias = await window.electron.getFaturamento();
    const tagFaturamento = document.getElementById("total-faturamento");
    tagFaturamento.innerHTML = "R$"+faturamentoDias;

    const getQuantidadeVendas = await window.electron.getQuantidadeVendas();
    const tagQuantidadeVendas = document.getElementById("quantidade-vendas");
    tagQuantidadeVendas.innerHTML = getQuantidadeVendas+" Realizadas";

    const lucroDias = await window.electron.getLucro();
    const tagLucroDias = document.getElementById("total-vendas");
    if (lucroDias == null){
        tagLucroDias.innerHTML = "R$0";
    }else{
        tagLucroDias.innerHTML = "R$"+lucroDias;
    }
    
    const moviEstoque = await window.electron.getMovimentacaoEstoque()

    const tabela = document.getElementById("tabela-relatorio");
    tabela.innerHTML = ""; // limpa a tabela

    moviEstoque.forEach((mov) => {
        const tr = document.createElement("tr");

        let tipoHTML = mov.tipo
        ? `<p class="entrou">Entrada</p>`
        : `<p class="saiu">Saída</p>`;

        tr.innerHTML = `
            <td>${mov.produto}</td>
            <td>${tipoHTML}</td>
            <td>${mov.quantidade}</td>
            <td>R$${mov.total}</td>
            <td>${mov.desconto}%</td>
            <td>${new Date(mov.datam).toLocaleString()}</td>
        `;

        tabela.appendChild(tr);
    });
    
})
document.getElementById('vendas').addEventListener('click', async function() { 
  window.location.href = `./dVendas/index.html`; 
})
document.getElementById('estoque').addEventListener('click', async function() { 
  window.location.href = `./dEstoque/index.html`; 
})
