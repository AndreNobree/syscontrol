const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const dbClient = require('./db');  
const bcrypt = require('bcrypt');

let mainWindow;

let usuarioLogado = null;
let nomeUsuarioLogado = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1366,
    height: 768,
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
    let entra = true
    let zero = 0

    const data = new Date();
    const res = await dbClient.query('INSERT INTO produtos (codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, dataalteracao) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)', [codigo, produto, idcat, preco, quantidade, desconto, precoprazo, precocompra, idfornecedor, data]);
    const result = await dbClient.query('SELECT * FROM produtos WHERE codigo = $1', [codigo]);
    const idProduct = result.rows[0].id
    const res2 = await dbClient.query('INSERT INTO movimentacoes_estoque (id_produto, id_user, id_cliente, tipo_movimento, quantidade, preco_unitario, data_movimento, fornecedor, status) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [idProduct, usuarioLogado, zero, entra, quantidade, preco, data, idfornecedor, entra]);

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
    const certo = true
    const res = await dbClient.query('UPDATE produtos SET codigo = $1, idcat = $2, preco = $3, quantidade = $4, desconto = $5, produto = $6, dataalteracao = $7 WHERE id = $8', [codigo, idcat, preco, quantidade, desconto, produto, data, idRegistro]);
    const res2 = await dbClient.query('UPDATE movimentacoes_estoque SET quantidade = $1, preco_unitario = $2, data_movimento = $3 WHERE id_produto = $4', [quantidade, preco, data, idRegistro]);

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

//insert caixa
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
      let idfornecedor = result.rows[0].idfornecedor
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
      const falso = false
      
      const insetCaixa = await dbClient.query('INSERT INTO caixa (iduser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)', [idUser, idproduto, quantidade, codigo, produto, preco, desconto, precodesc, total]);
      const updateProd = await dbClient.query('UPDATE produtos SET quantidade = $1 WHERE codigo = $2', [quantidadeProd, codigo]);

      const movimentoExistente = await dbClient.query(
        `SELECT * FROM movimentacoes_estoque 
        WHERE id_produto = $1 
          AND status = $2 and id_user = $3`,
        [idproduto, falso, usuarioLogado]
      );

      // Só faz o INSERT se não encontrou movimentação existente
      if (movimentoExistente.rows.length === 0) {
        let zero = 0
        await dbClient.query(
          `INSERT INTO movimentacoes_estoque 
            (id_produto, id_user, id_cliente, tipo_movimento, quantidade, preco_unitario, data_movimento, fornecedor, status)  
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
          [idproduto, usuarioLogado, zero, falso, quantidade, preco, data, idfornecedor, falso]
        );
        await dbClient.query('INSERT INTO lucrosvenda (id_usuario, data_venda, lucro, id_produto, status) VALUES ($1, $2, $3, $4, $5)', [idUser, data, lucro, idproduto, falso]);
      } else {
         // Já existe um registro -> fazemos o UPDATE (atualizar quantidade e total)
        const idMovEstoque = movimentoExistente.rows[0].id
        let quantidadeAtual = movimentoExistente.rows[0].quantidade;
        let novaQuantidade = parseFloat(quantidadeAtual) + parseFloat(quantidade);


        await dbClient.query(
          'UPDATE movimentacoes_estoque SET quantidade = $1 WHERE id = $2',
          [novaQuantidade, idMovEstoque]
        );

        const selectLucros = await dbClient.query('SELECT lucro FROM lucrosvenda WHERE id_produto = $1', [idproduto]);
        let selectAtualizado = selectLucros.rows[0].lucro;
        totalLucro = parseFloat(lucro) + parseFloat(selectAtualizado)

        await dbClient.query('UPDATE lucrosvenda SET lucro = $1 WHERE id_produto = $2', [parseFloat(totalLucro), idproduto]);
      }
      
      if (insetCaixa.rows.length > 0 && updateProd.rows.length > 0 && insetLucro.rows.length > 0 && updateMovEstoque.rows.length > 0) {
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

ipcMain.handle('delete-item-caixa', async (event, caixaId) => {
  
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
    const query6 = await dbClient.query('SELECT * FROM caixa WHERE idproduto = $1', [idproduto]);

    if (query6.rows.length === 0) {
      const falso = false
      await dbClient.query('DELETE FROM movimentacoes_estoque WHERE id_produto = $1 and status = $2 and id_user = $3', [idproduto, falso, usuarioLogado]);
      await dbClient.query('DELETE FROM lucrosvenda WHERE id_produto = $1', [idproduto]);
    }else{
      //const data = new Date(); // isso pegará a data atual
      const falso = false
      let quantidade3 = query2.rows[0].quantidade
      let lucro = query2.rows[0].precodesc - query4.rows[0].precocompra
      let totalTudo = query2.rows[0].quantidade * lucro
      // let lucro = query2.rows[0].precodesc - query4.rows[0].precocompra
      await dbClient.query('UPDATE movimentacoes_estoque SET quantidade = $1 WHERE id_produto = $2 and status = $3 and id_user = $4', [quantidade3,idproduto, falso, usuarioLogado]);
      await dbClient.query('UPDATE lucrosvenda set lucro = $1 WHERE id_produto = $2', [totalTudo, idproduto]);
      
    }

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
      const certo = true

      const insetRelarorio = await dbClient.query('INSERT INTO relatoriovenda (id_usuario, data_venda, total, forma_pagamento) VALUES ($1, $2, $3, $4)', [usuarioLogado, data, total, pagamento]);
      
      const deleteCaixa = await dbClient.query('DELETE FROM caixa WHERE idUser = $1', [usuarioLogado]);

      const selectLucrosVenda = await dbClient.query('SELECT sum(lucro) AS lucro FROM lucrosvenda WHERE id_usuario = $1 AND id_produto <> $2', [usuarioLogado, zero]);
      let lucroTotal = selectLucrosVenda.rows[0].lucro
      const insetLucro = await dbClient.query('INSERT INTO lucrosvenda (id_usuario, data_venda, lucro, id_produto, status) VALUES ($1, $2, $3, $4, $5)', [usuarioLogado, data, lucroTotal, zero, certo]);
      const deleteLucrosVenda = await dbClient.query('DELETE FROM lucrosvenda WHERE id_usuario = $1 AND id_produto <> $2', [usuarioLogado, zero]);
      const updateMovEstoque = await dbClient.query('UPDATE movimentacoes_estoque SET status = $1 WHERE id_user = $2', [certo, usuarioLogado]);
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
ipcMain.handle('get-fornecedor-cadastro', async () => {
  try {
    // Substitua esta consulta com a consulta real ao seu banco de dados
    const result = await dbClient.query('SELECT contrato, nome, cnpj, telefone, cep, email, ativo FROM fornecedor');

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


//DASHBOARDS
//faturamento 60 dias
ipcMain.handle('get-faturmaento', async () => {
  try {
    const result = await dbClient.query(`
      SELECT COALESCE(SUM(total), 0) AS total_vendas
      FROM relatoriovenda
      WHERE data_venda >= NOW() - INTERVAL '30 days';
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
      WHERE data_venda >= NOW() - INTERVAL '30 days';
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
      WHERE status = true
      AND data_venda >= NOW() - INTERVAL '30 days';
    `);

    return result.rows[0].lucro;
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});

ipcMain.handle('get-mov-estoque', async () => {
  try {
    const result = await dbClient.query(`
      SELECT a.tipo_movimento as tipo, a.quantidade as quantidade, a.valor_total as total, a.data_movimento as datam, a.fornecedor as fornecedor, b.produto as produto, c.usuario as usuario, b.desconto as desconto 
      FROM movimentacoes_estoque a 
      LEFT JOIN produtos b ON a.id_produto = b.id
      LEFT JOIN users c ON a.id_user = c.id
      WHERE a.status = true
      ORDER BY datam desc
      LIMIT 20
    `);

    if (result.rows.length === 0) {
      console.log("Nenhuma movimentação  encontrada na tabela.");
    }
    return result.rows; 
  } catch (err) {
    console.error('Erro ao buscar produto:', err);
    throw new Error('Erro ao buscar produto');
  }
});


//DASHBOARDS - vendas
// Gráfico 1 – 5   Produtos mais vendidos
ipcMain.handle('get-produtos-mais-vendidos', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    JOIN produtos p ON p.id = m.id_produto
    WHERE m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido DESC
    LIMIT 6;
  `);
  return result.rows;
});

// Gráfico 2 – Vendas realizadas nos ultimos 30 dias
ipcMain.handle('get-vendas-por-trinta', async () => {
  const result = await dbClient.query(`
    SELECT 
      SUM(l.lucro) AS lucro,
      SUM(r.total) AS faturamento
    FROM relatoriovenda r
    LEFT JOIN lucrosvenda l 
      ON l.data_venda = r.data_venda
    WHERE 
      r.data_venda >= NOW() - INTERVAL '30 days'
      AND l.status = true;
    `);
    return result.rows;
  });

  // Gráfico 3 – Vendas realizadas hoje
ipcMain.handle('get-vendas-por-dia', async () => {
  const result = await dbClient.query(`
    SELECT 
      TO_CHAR(DATE_TRUNC('hour', r.data_venda), 'HH24:00') AS hora,
      SUM(r.total) AS faturamento,
      SUM(l.lucro) AS lucro
    FROM relatoriovenda r
    LEFT JOIN lucrosvenda l 
      ON l.data_venda = r.data_venda
    WHERE 
      DATE(r.data_venda) = CURRENT_DATE
      AND l.status = true
    GROUP BY hora
    ORDER BY hora;

  `);
  return result.rows;
});



// grafico 4 - lucros/venda por 12 meses
ipcMain.handle('get-vendas-por-doze-meses', async () => {
  const result = await dbClient.query(`
    SELECT
      TO_CHAR(r.data_venda, 'MM/YYYY') AS mes_ano,
      SUM(r.total) AS faturamento,
      SUM(l.lucro) AS lucro
    FROM relatoriovenda r
    LEFT JOIN lucrosvenda l ON l.data_venda = r.data_venda
    WHERE
      r.data_venda >= (CURRENT_DATE - INTERVAL '12 months')
      AND l.status = true
    GROUP BY TO_CHAR(r.data_venda, 'MM/YYYY')
    ORDER BY TO_CHAR(r.data_venda, 'MM/YYYY');
    `);
    return result.rows;
});
  

    // Gráfico 5 – Vendas por forma de pagamento
ipcMain.handle('get-vendas-por-pagamento', async () => {
  const result = await dbClient.query(`
      SELECT 
        forma_pagamento,
        count(forma_pagamento) as total_pagamento
      FROM relatoriovenda
      WHERE data_venda >= NOW() - INTERVAL '30 days'
      GROUP BY forma_pagamento
  `);
  return result.rows;
});

ipcMain.handle('get-vendas-por-sete-dias', async () => {
  const result = await dbClient.query(`
    SELECT
      TO_CHAR(r.data_venda, 'DD/MM/YYYY') AS dia,
      SUM(r.total) AS faturamento,
      SUM(l.lucro) AS lucro
    FROM relatoriovenda r
    LEFT JOIN lucrosvenda l ON l.data_venda = r.data_venda
    WHERE
      r.data_venda >= (CURRENT_DATE - INTERVAL '7 days')
      AND l.status = true
    GROUP BY TO_CHAR(r.data_venda, 'DD/MM/YYYY')
    ORDER BY TO_DATE(TO_CHAR(r.data_venda, 'DD/MM/YYYY'), 'DD/MM/YYYY');
  `);
  return result.rows;
});


//DASHBOARDS - estoque
//total em estoque (grafico 1)
ipcMain.handle('get-total-estoque', async () => {
  try {
    const result = await dbClient.query(`
      SELECT 
        SUM(quantidade * precocompra) AS valor_total_estoque
      FROM produtos;
    `);

    return result.rows[0].valor_total_estoque;
  } catch (err) {
    console.error('Erro ao buscar total em estoque:', err);
    throw new Error('Erro ao buscar total em estoque');
  }
});

//quantos produtos foram vendidos (grafico 2)
ipcMain.handle('get-quantidade-saida', async () => {
  try {
    const result = await dbClient.query(`
      SELECT 
        SUM(quantidade) AS total_saida
      FROM movimentacoes_estoque
      WHERE tipo_movimento = false;
    `);
    return result.rows[0].total_saida;

  } catch (err) {
    console.error('Erro ao buscar total em estoque:', err);
    throw new Error('Erro ao buscar total em estoque');
  }
});

//quantidade e valor do produto vendido por um ano (grafico 3)
ipcMain.handle('get-quantidade-valor-produto-ano', async (event, { produto }) => {
  const result = await dbClient.query(`
    SELECT
      TO_CHAR(m.data_movimento, 'MM/YYYY') AS mes_ano,
      SUM(m.valor_total) AS valor_total_estoque,
      SUM(m.quantidade) as quantidade
    FROM movimentacoes_estoque m
      LEFT JOIN produtos p ON p.id = m.id_produto
    WHERE
          m.data_movimento >= (CURRENT_DATE - INTERVAL '12 months')
          AND p.id = $1
    GROUP BY TO_CHAR(m.data_movimento, 'MM/YYYY')
    ORDER BY TO_CHAR(m.data_movimento, 'MM/YYYY');  
  `, [produto]);
  return result.rows;
});

//10 produtos com mais entradas e saidas por 30 dias (grafico 4)
ipcMain.handle('get-mais-dez-trinta-dias', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.data_movimento >= NOW() - INTERVAL '30 DAYS'
    AND m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido DESC
    LIMIT 10
  `);
  return result.rows;
});

//10 produtos com mais entradas e saidas por 1 ano (grafico 5)
ipcMain.handle('get-mais-dez-um-ano', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.data_movimento >= NOW() - INTERVAL '12 months'
    AND m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido DESC
    LIMIT 10
  `);
  return result.rows;
});

//10 produtos com menos entradas e saidas por 30 dias (grafico 6)
ipcMain.handle('get-menos-dez-trinta-dias', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.data_movimento >= NOW() - INTERVAL '30 DAYS'
    AND m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido ASC
    LIMIT 10
  `);
  return result.rows;
});

//10 produtos com menos entradas e saidas por 1 ano (grafico 7)
ipcMain.handle('get-menos-dez-um-ano', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.data_movimento >= NOW() - INTERVAL '12 months'
    AND m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido ASC
    LIMIT 10
  `);
  return result.rows;
});

//produto mais vendido (grafico 8)
ipcMain.handle('get-mais-saida', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido DESC
    LIMIT 1
  `);
  return result.rows;
});

//produto MENOS vendido (grafico 9)
ipcMain.handle('get-menos-saida', async () => {
  const result = await dbClient.query(`
    SELECT 
      p.produto,
      SUM(m.quantidade) AS total_vendido
    FROM movimentacoes_estoque m
    LEFT JOIN produtos p ON m.id_produto = p.id
    WHERE m.tipo_movimento = false
    GROUP BY p.produto
    ORDER BY total_vendido ASC
    LIMIT 1
  `);
  return result.rows;
});



app.whenReady().then(createWindow);
    
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});



