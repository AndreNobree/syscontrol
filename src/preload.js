const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  verifyLogin: (username, password) => ipcRenderer.invoke('verify-login', { username, password }),
  getUsuario: () => ipcRenderer.invoke('get-usuario'),
  getAllUsers: () => ipcRenderer.invoke('get-all-users'),
  getUserById: (userId) => ipcRenderer.invoke('getUsersById', userId),
  updateEditUser: (nome, senha, cargo, userId) => ipcRenderer.invoke('update-users', { nome, senha, cargo, userId }),
  addUser: (nome, senha, cargo) => ipcRenderer.invoke('insert-users', { nome, senha, cargo }),
  addUser2: (nome, senha) => ipcRenderer.invoke('insert-users2', { nome, senha }),
  getNiveis: () => ipcRenderer.invoke('get-niveis'),
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
  addFornecedor: (nome, telefone, cnpj, email, cep, endereco) => ipcRenderer.invoke('insert-fornecedor', { nome, telefone, cnpj, email, cep, endereco }),
  addCliente: (nome, celular, cpf_cnpj, email, cep, endereco, complemento) => ipcRenderer.invoke('insert-cliente', { nome, celular, cpf_cnpj, email, cep, endereco, complemento }),
  getFaturamento: () => ipcRenderer.invoke('get-faturmaento'),
  getQuantidadeVendas: () => ipcRenderer.invoke('get-quantidade-vendas'),
  getLucro: () => ipcRenderer.invoke('get-lucro'),
});


// insert into produtos 
//   (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, garantia, comissao) 
// values
//   (3232, 'coca-cola 1,5l', 8, 8.99, 98, '', 8.99, 4.99, '1', 0, 0)