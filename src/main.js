const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbClient = require('./db');  

let mainWindow;

let usuarioLogado = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1050,
    height: 700,
    minWidth: 1050,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),  
    }
  });

  mainWindow.loadFile(path.join(__dirname, './pages/login/index.html'));
}

ipcMain.handle('verify-login', async (event, { username, password }) => {
  try {
    
    const res = await dbClient.query('SELECT * FROM users WHERE usuario = $1 AND senha = $2', [username, password]);

    if (res.rows.length > 0) {
      usuarioLogado = res.rows[0].id;
      return { success: true };  
    } else {
      return { success: false, message: 'Usuário ou senha incorretos' };  
    }
  } catch (err) {
    console.error('Erro ao verificar login:', err);
    return { success: false, message: 'Erro ao verificar login' };
  }
});

ipcMain.handle('get-products', async (event, categoriaId, filtroNome) => {
  try {
    console.log('Categoria recebida no main:', categoriaId);
    console.log('Filtro de nome recebido:', filtroNome);

    let query = 'SELECT produtos.id, produtos.codigo, produtos.produto, categorias.categoria, produtos.preco, produtos.quantidade FROM produtos INNER JOIN categorias on produtos.idcat = categorias.id LIMIT 50';
    let params = [];

    // Se um filtro de categoria for passado
    if (categoriaId && categoriaId !== "0") {
      query += ` WHERE produtos.idcat = $1`;
      params.push(categoriaId);
    }

    // Se um filtro de nome for passado, adiciona o filtro de nome à query
    if (filtroNome) {
      if (params.length > 0) {
        query += ` AND produtos.produto ILIKE $${params.length + 1}`;
      } else {
        query += ` WHERE produtos.produto ILIKE $1`;
      }
      params.push(`%${filtroNome}%`);  // Usamos ILIKE para fazer uma busca sem case-sensitive (em PostgreSQL)
    }

    
    const res = await dbClient.query(query, params);

    if (res && res.rows) {
      return res.rows;  // Retorna os produtos filtrados
    } else {
      console.log('Nenhum produto encontrado.');
      return [];  // Retorna um array vazio caso nenhum produto seja encontrado
    }

  } catch (err) {
    console.error('Erro ao buscar produtos:', err);
    return [];  // Retorna um array vazio em caso de erro
  }
});

ipcMain.handle('delete-products', async (event, productIds) => {
  try {
    // Cria a query para deletar os produtos com os IDs recebidos
    const query = `DELETE FROM produtos WHERE id = ANY($1::int[])`;
    
    // Executa a query no banco de dados
    const res = await dbClient.query(query, [productIds]);

    if (res.rowCount > 0) {
      return { success: true };  // Retorna sucesso
    } else {
      console.log('Nenhum produto encontrado para remover.');
      return { success: false };  // Retorna falha caso não tenha sido encontrado nenhum produto
    }
  } catch (err) {
    console.error('Erro ao remover produtos:', err);
    return { success: false, message: 'Erro ao remover produtos' };  // Retorna erro em caso de falha
  }
});


ipcMain.handle('get-categorias', async () => {
  try {
    const res = await dbClient.query('SELECT * FROM categorias');  
    if (res.rows.length === 0) {
      console.log("Nenhuma categoria encontrada na tabela.");
    }
    return res.rows; 
  } catch (err) {
    console.error('Erro ao buscar as categorias:', err);
    return []; 
  }
});

ipcMain.handle('get-produtos-select', async () => {
  try {
    const res = await dbClient.query('SELECT id, produto, codigo, preco, desconto, quantidade FROM produtos LIMIT 50');  
    if (res.rows.length === 0) {
      console.log("Nenhuma categoria encontrada na tabela.");
    }
    return res.rows; 
  } catch (err) {
    console.error('Erro ao buscar as categorias:', err);
    return []; 
  }
});

ipcMain.handle('insert-produtos', async (event, { codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, garantia, comissao }) => {
  try {
    const res = await dbClient.query('INSERT INTO produtos (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, garantia, comissao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)', [codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, garantia, comissao]);

    if (res.rows.length > 0) {
      return { success: true };  
    } else {
      return { success: false, message: 'Falha ao fazer insert no banco de dados' };  
    }
  } catch (err) {
    console.error('Erro ao fazer insert no banco:', err);
    return { success: false, message: 'Erro ao fazer insert no banco' };
  }
});

ipcMain.handle('getProductById', async (event, productId) => {
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT * FROM produtos WHERE id = $1', [productId]);

    if (result.rows.length === 0) {
      // Se o produto não for encontrado, retornará null
      return null;
    }

    // Retorna o produto encontrado
    return result.rows[0];
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('update-produtos', async (event, { codigo, produto, idcat, preco, quantidade, desconto, idRegistro }) => {
  try {
    
    console.log(codigo)
    const res = await dbClient.query('UPDATE produtos SET codigo = $1, idcat = $2, preco = $3, quantidade = $4, desconto = $5, produto = $6 WHERE id = $7', [codigo, idcat, preco, quantidade, desconto, produto, idRegistro]);

    if (res.rows.length > 0) {
      return { success: true };  
    } else {
      return { success: false, message: 'Falha ao fazer insert no banco de dados' };  
    }
  } catch (err) {
    console.error('Erro ao fazer update no banco:', err);
    return { success: false, message: 'Erro ao fazer update no banco' };
  }
});


ipcMain.handle('get-products-for-caixa', async (event, {codigo, quantidade}) => {
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT * FROM produtos WHERE codigo = $1 AND quantidade >= $2', [codigo, quantidade]);

    if (result.rows.length === 0) {
      // Se o produto não for encontrado, retornará null
      return null;
    }

    else{
      let idUser = usuarioLogado
      let idproduto = result.rows[0].id
      let produto = result.rows[0].produto
      let preco = result.rows[0].preco
      let desconto = result.rows[0].desconto
      let total = 0
      let precodesc = 0

      if (desconto != "") {
        let descontoItem = parseFloat(desconto); // Converte o desconto para número
        descontoItem = descontoItem / 100
        descontoItem = descontoItem * preco; // Aplica o desconto no preço
        total = preco - descontoItem
        precodesc = total
        precodesc = precodesc.toFixed(2)
        total *= quantidade
        total = total.toFixed(2)
      }
      else{
       total = preco * quantidade 
      }
      
      const insetCaixa = await dbClient.query('INSERT INTO caixa (iduser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [idUser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total]);
      if (insetCaixa.rows.length > 0) {
        return { success: true };  
      } else {
        return { success: false, message: 'Falha ao fazer insert no banco de dados' };  
      }
    }

    // Retorna o produto encontrado
    return result.rows[0];
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('get-caixa', async () => {
  try {
    const result = await dbClient.query('SELECT * FROM caixa WHERE iduser = $1', [usuarioLogado]);

    if (result.rows.length === 0) {
      // Se não houver nenhum item, retornará um array vazio
      return [];
    }

    // Retorna todas as linhas da tabela 'caixa'
    return result.rows;
  } catch (err) {
    console.error('Erro ao buscar dados da tabela caixa:', err);
    throw new Error('Erro ao buscar dados da tabela caixa');
  }
});

ipcMain.handle('delete-caixa', async (event, caixaId) => {
  try {
    const query = await dbClient.query('DELETE FROM caixa WHERE id = $1', [caixaId]);
    if (res.rowCount > 0) {
      return { success: true };  // Retorna sucesso
    } else {
      console.log('Nenhum produto encontrado para remover.');
      return { success: false };  // Retorna falha caso não tenha sido encontrado nenhum produto
    }
  } catch (err) {
    console.error('Erro ao remover produtos:', err);
    return { success: false, message: 'Erro ao remover produtos' };  // Retorna erro em caso de falha
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

