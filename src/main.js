const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbClient = require('./db');  
const bcrypt = require('bcrypt');

let mainWindow;

let usuarioLogado = null;
let nomeUsuarioLogado = null;

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
    // Busca apenas pelo nome de usuário
    const res = await dbClient.query('SELECT * FROM users WHERE usuario = $1', [username]);

    if (res.rows.length === 0) {
      console.log('Usuário não encontrado!');
      return { success: false, message: 'Usuário ou senha incorretos' };
    }

    const user = res.rows[0];

    const senhaCorreta = await bcrypt.compare(password, user.senha.trim());

    if (senhaCorreta) {
      usuarioLogado = user.id;
      nomeUsuarioLogado = username;
      return { success: true };
    } else {
      console.log('Senha não bateu.');
      return { success: false, message: 'Usuário ou senha incorretos' };
    }
    
  } catch (err) {
    console.error('Erro ao verificar login:', err);
    return { success: false, message: 'Erro ao verificar login' };
  }
});

ipcMain.handle('get-usuario', async () => {
  try {
    return nomeUsuarioLogado; 
  } catch (err) {
    console.error('Erro ao buscar o usuario logado:', err);
    return []; 
  }
});

ipcMain.handle('get-all-users', async () => {
  try {
    const res = await dbClient.query('SELECT a.id, a.usuario, a.idnivel, b.nomenivel FROM users a LEFT JOIN niveis b ON a.idnivel = b.nivel');  
    if (res.rows.length === 0) {
      console.log("Nenhum usuário encontrado na tabela.");
    }
    return res.rows; 
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return []; 
  }
});

ipcMain.handle('getUsersById', async (event, userId) => {
  try {
    const res = await dbClient.query('SELECT a.id, a.usuario, a.idnivel, b.nomenivel FROM users a LEFT JOIN niveis b ON a.idnivel = b.nivel WHERE a.id = $1', [userId]);  
    if (res.rows.length === 0) {
      console.log("Nenhum usuário encontrado na tabela.");
    }
    return res.rows[0];
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return []; 
  }
});

ipcMain.handle('update-users', async (event, { nome, senha, cargo, userId }) => {
  try {
    const saltRounds = 10; // Nível de segurança (padrão é 10)
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    const res3 = await dbClient.query('UPDATE users SET usuario = $1, senha = $2, idnivel = $3 where id = $4', [nome, hashedPassword, cargo, userId]);

    if (res3.rows.length > 0) {
      return { success: true };  
    } else {
      return { success: false, message: 'Falha ao fazer insert no banco de dados' };  
    }
  } catch (err) {
    console.error('Erro ao fazer insert no banco:', err);
    return { success: false, message: 'Erro ao fazer insert no banco' };
  }
});

ipcMain.handle('insert-users', async (event, { nome, senha, cargo }) => {
  try {
    // Gera o hash da senha antes de salvar
    const saltRounds = 10; // Nível de segurança (padrão é 10)
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Agora salva o hash no lugar da senha original
    const res3 = await dbClient.query(
      'INSERT INTO users (usuario, senha, idnivel) values ($1, $2, $3)',
      [nome, hashedPassword, cargo]
    );

    return { success: true };

  } catch (err) {
    console.error('Erro ao fazer insert no banco:', err);
    return { success: false, message: 'Erro ao fazer insert no banco' };
  }
});

ipcMain.handle('insert-users2', async (event, { nome, senha }) => {
  const cargo = 3
  try {
    // Verifica se já existe um usuário com idnivel = 3
    const { rows } = await dbClient.query(
      'SELECT 1 FROM users WHERE idnivel = $1 LIMIT 1',
      [cargo]
    );

    if (rows.length > 0) {
      // Já existe um usuário com cargo 3
      return { success: false, message: 'Já existe um usuário com o cargo 3.' };
    }

    // Gera o hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(senha, saltRounds);

    // Insere o novo usuário
    await dbClient.query(
      'INSERT INTO users (usuario, senha, idnivel) VALUES ($1, $2, $3)',
      [nome, hashedPassword, cargo]
    );

    return { success: true };
  } catch (err) {
    console.error('Erro ao inserir usuário:', err);
    return { success: false, message: 'Erro ao inserir usuário no banco.' };
  }
});


ipcMain.handle('get-niveis', async () => {
  try {
    const res = await dbClient.query('SELECT * FROM niveis');  
    if (res.rows.length === 0) {
      console.log("Nenhum nivel encontrado na tabela.");
    }
    return res.rows; 
  } catch (err) {
    console.error('Erro ao buscar os niveis:', err);
    return []; 
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

ipcMain.handle('insert-produtos', async (event, { codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor }) => {
  try {
    const data = new Date();
    const res = await dbClient.query('INSERT INTO produtos (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, dataalteracao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, data]);

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
    const data = new Date();
    console.log(codigo)
    const res = await dbClient.query('UPDATE produtos SET codigo = $1, idcat = $2, preco = $3, quantidade = $4, desconto = $5, produto = $6, dataalteracao = $7 WHERE id = $8', [codigo, idcat, preco, quantidade, desconto, produto, data, idRegistro]);

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


ipcMain.handle('get-update-products-for-caixa', async (event, {codigo, quantidade}) => {
  try {
    const data = new Date();
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
      let quantidadeProd = result.rows[0].quantidade
      let precocompra = result.rows[0].precocompra
      let total = 0
      let precodesc = 0
      quantidadeProd = quantidadeProd - quantidade

      let lucro = preco - precocompra

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
      console.log(lucro)
      
      const insetCaixa = await dbClient.query('INSERT INTO caixa (iduser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [idUser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total]);
      const insetLucro = await dbClient.query('INSERT INTO lucrosvenda (id_usuario, data_venda, lucro, id_produto) VALUES ($1, $2, $3, $4)', [idUser, data, lucro, idproduto]);
      const updateProd = await dbClient.query('UPDATE produtos SET quantidade = $1 WHERE codigo = $2', [quantidadeProd, codigo]);
      
      if (insetCaixa.rows.length > 0 && updateProd.rows.length > 0 && insetLucro.rows.length > 0) {
        return { success: true };  
      } else {
        return { success: false, message: 'Falha ao fazer insert-update da acao de inserir dados no caixa e atualização de quantidade' };  
      }
    }
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
    const query2 = await dbClient.query('SELECT * FROM caixa WHERE id = $1', [caixaId]);
    let idproduto = query2.rows[0].idproduto
    let quantidade1 = query2.rows[0].quantidade
    const query4 = await dbClient.query('SELECT * FROM produtos WHERE id = $1', [idproduto]);
    let quantidade2 = query4.rows[0].quantidade
    let quantidade = quantidade2 + quantidade1
    const positivo = Math.abs(quantidade);

    const query = await dbClient.query('DELETE FROM caixa WHERE id = $1', [caixaId]);
    const query3 = await dbClient.query('UPDATE produtos SET quantidade = $1 WHERE id = $2', [positivo,idproduto]);
    const query5 = await dbClient.query('DELETE FROM lucrosvenda WHERE id_produto = $1', [idproduto]);
    if (query2.rowCount > 0) {
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

ipcMain.handle('insert-relatorio-delete-caixa', async (event, {pagamento, total}) => {

  try {
      const data = new Date(); // isso pegará a data atual
      const zero = 0;
      

      const insetRelarorio = await dbClient.query('INSERT INTO relatoriovenda (id_usuario, data_venda, total, forma_pagamento) VALUES ($1, $2, $3, $4)', [usuarioLogado, data, total, pagamento]);
      
      const deleteCaixa = await dbClient.query('DELETE FROM caixa WHERE idUser = $1', [usuarioLogado]);

      const selectLucrosVenda = await dbClient.query('SELECT sum(lucro) AS lucro FROM lucrosvenda WHERE id_usuario = $1 AND id_produto <> $2', [usuarioLogado, zero]);
      let lucroTotal = selectLucrosVenda.rows[0].lucro
      const insetLucro = await dbClient.query('INSERT INTO lucrosvenda (id_usuario, data_venda, lucro, id_produto) VALUES ($1, $2, $3, $4)', [usuarioLogado, data, lucroTotal, zero]);
      const deleteLucrosVenda = await dbClient.query('DELETE FROM lucrosvenda WHERE id_usuario = $1 AND id_produto <> $2', [usuarioLogado, zero]);
      
      if (insetRelarorio.rows.length > 0) {
        return { success: true };  
      } else {
        return { success: false, message: 'Falha ao fazer insert - [ERRO DE INSERT DO RELATORIO]' };  
      }

  } catch (err) {
    console.error('Erro ao remover produtos:', err);
    return { success: false, message: 'Erro ao remover produtos' };  // Retorna erro em caso de falha
  }

});

ipcMain.handle('get-caixa-descontos', async () => {
  const zero = 0;
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT produto, preco, desconto, precodesc FROM caixa WHERE iduser = $1 and desconto <> $2', [usuarioLogado, zero]);

    if (result.rows.length === 0) {
      // Se não houver nenhum item, retornará um array vazio
      return [];
    }

    // Retorna todas as linhas da tabela 'caixa'
    return result.rows;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('get-relatoriovenda', async () => {
  try {
    // Consulta principal: registros de vendas do dia
    const vendasRes = await dbClient.query(`
      SELECT 
        b.nome, 
        a.total, 
        a.forma_pagamento, 
        a.data_venda, 
        c.usuario
      FROM relatoriovenda a
      LEFT JOIN clientes b ON a.id_cliente = b.id
      LEFT JOIN users c ON a.id_usuario = c.id
      WHERE DATE(a.data_venda) = CURRENT_DATE;
    `);

    // Consulta do total geral
    const totalRes = await dbClient.query(`
      SELECT 
        SUM(a.total) AS total_geral
      FROM relatoriovenda a
      WHERE DATE(a.data_venda) = CURRENT_DATE;
    `);

    const vendas = vendasRes.rows;
    const total = totalRes.rows[0].total_geral || 0; // evita null

    return {
      vendas,
      total
    };

  } catch (err) {
    console.error('Erro ao buscar dados do relatório:', err);
    return { vendas: [], total: 0 };
  }
});

ipcMain.handle('get-clientes', async () => {
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT nome, celular, cpf_cnpj, cep, email FROM clientes LIMIT 50');

    if (result.rows.length === 0) {
      // Se não houver nenhum item, retornará um array vazio
      return [];
    }

    // Retorna todas as linhas da tabela 'caixa'
    return result.rows;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('get-fornecedor', async () => {
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT contrato, nome, cnpj, telefone, cep, email, ativo FROM fornecedor LIMIT 50');

    if (result.rows.length === 0) {
      // Se não houver nenhum item, retornará um array vazio
      return [];
    }

    // Retorna todas as linhas da tabela 'caixa'
    return result.rows;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('insert-cliente', async (event, { nome, celular, cpf_cnpj, email, cep, endereco, complemento }) => {
  try {
    const res = await dbClient.query('INSERT INTO clientes (nome, celular, cpf_cnpj, email, cep, endereco, complemento) VALUES ($1, $2, $3, $4, $5, $6, $7)', [nome, celular, cpf_cnpj, email, cep, endereco, complemento]);

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
ipcMain.handle('insert-fornecedor', async (event, { nome, telefone, cnpj, email, cep, endereco }) => {
  try {
    const res = await dbClient.query('INSERT INTO fornecedor (nome, telefone, cnpj, email, cep, endereco) VALUES ($1, $2, $3, $4, $5, $6)', [nome, telefone, cnpj, email, cep, endereco]);

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

//faturamento 60 dias
ipcMain.handle('get-faturmaento', async () => {
  try {
    const result = await dbClient.query(`
      SELECT COALESCE(SUM(total), 0) AS total_vendas
      FROM relatoriovenda
      WHERE data_venda >= NOW() - INTERVAL '60 days';
    `);

    return result.rows[0].total_vendas;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});
//quantidade de vendas 60 dias
ipcMain.handle('get-quantidade-vendas', async () => {
  try {
    const result = await dbClient.query(`
      SELECT COUNT(*) AS quantidade
      FROM relatoriovenda
      WHERE data_venda >= NOW() - INTERVAL '60 days';
    `);

    // PostgreSQL pode retornar COUNT como string, então convertemos para número
    return parseInt(result.rows[0].quantidade, 10);
  } catch (err) {
    console.error('Erro ao contar vendas:', err);
    throw new Error('Erro ao contar vendas');
  }
});
//lucro real 60 dias
ipcMain.handle('get-lucro', async () => {
  try {
    const result = await dbClient.query(`
      SELECT sum(lucro) AS lucro
      FROM lucrosvenda
      WHERE data_venda >= NOW() - INTERVAL '60 days';
    `);

    return result.rows[0].lucro;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



