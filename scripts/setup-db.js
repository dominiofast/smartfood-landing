const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

async function initDatabase() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('Erro: variável de ambiente DATABASE_URL não definida.');
    process.exit(1);
  }

  const sqlPath = path.join(__dirname, '..', 'database', 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const pool = new Pool({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false,
    },
  });

  console.log('Iniciando criação das tabelas no banco de dados...');

  const client = await pool.connect();
  try {
    await client.query(sql);
    console.log('🎉 Banco de dados inicializado com sucesso!');
  } catch (err) {
    console.error('Erro ao executar schema.sql:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase(); 