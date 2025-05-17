const { Client } = require('pg');

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'admin',
    port: 5432,
});

client.connect().then(() => console.log('Conectado ao PostgreSQL')).catch(err => console.error('Erro de conexão:', err));

module.exports = client;
