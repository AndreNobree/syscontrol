const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  verifyLogin: (username, password) => ipcRenderer.invoke('verify-login', { username, password }),
  getProducts: (categoriaId, filtroNome) => ipcRenderer.invoke('get-products', categoriaId, filtroNome),
  getCategorias: () => ipcRenderer.invoke('get-categorias'),
  deleteProducts: (productIds) => ipcRenderer.invoke('delete-products', productIds),
  addProduto: (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor) => ipcRenderer.invoke('insert-produtos', { codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor }),
  getProductById: (productId) => ipcRenderer.invoke('getProductById', productId),
  updateEditProduto: (codigo, produto, idcat, preco, quantidade, desconto, idRegistro) => ipcRenderer.invoke('update-produtos', { codigo, produto, idcat, preco, quantidade, desconto, idRegistro }),
  getProdutosSelect: () => ipcRenderer.invoke('get-produtos-select'),
  getProductForCaixa: (codigo, quantidade) => ipcRenderer.invoke('get-update-products-for-caixa', { codigo, quantidade }),
  getCaixa: () => ipcRenderer.invoke('get-caixa'),
  deleteCaixa: (caixaId) => ipcRenderer.invoke('delete-caixa', caixaId),
  attCaixaRelatorio: (pagamento, total) => ipcRenderer.invoke('insert-relatorio-delete-caixa', { pagamento, total }),
  getDesconto: () => ipcRenderer.invoke('get-caixa-descontos'),
  getRelatorioVenda: () => ipcRenderer.invoke('get-relatoriovenda'),
  getCliente: () => ipcRenderer.invoke('get-clientes'),
  getFornecedor: () => ipcRenderer.invoke('get-fornecedor'),
});


// insert into produtos 
//   (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, garantia, comissao) 
// values
//   (3232, 'coca-cola 1,5l', 8, 8.99, 98, '', 8.99, 4.99, '1', 0, 0)
