const { Pool } = require('pg');
require('dotenv').config();

const DATABASE_URL = "postgresql://neondb_owner:npg_aj6KdeGg4QiO@ep-weathered-dream-acw41z52-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

async function testConnection() {
  const pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: {
      rejectUnauthorized: true
    }
  });

  try {
    console.log('Tentando conectar ao banco de dados Neon...');
    console.log('DATABASE_URL:', DATABASE_URL ? 'Definida' : 'Não definida');
    
    const client = await pool.connect();
    console.log('Conexão bem sucedida!');
    
    const result = await client.query('SELECT NOW()');
    console.log('Consulta de teste:', result.rows[0]);
    
    client.release();
  } catch (err) {
    console.error('Erro ao conectar:', err);
    console.error('Detalhes do erro:', err.message);
    if (err.stack) {
      console.error('Stack:', err.stack);
    }
  } finally {
    await pool.end();
  }
}

testConnection(); 