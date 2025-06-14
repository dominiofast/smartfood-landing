const { Pool } = require('pg');

// Usar a string de conexão fornecida se a variável de ambiente não estiver disponível
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_aj6KdeGg4QiO@ep-hidden-snow-acgh5ii5-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require';

// Criar pool de conexão
const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000,
  max: 10
});

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Responder a requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Verificar estrutura da tabela stores
    const result = await pool.query(`
      SELECT 
        column_name,
        data_type,
        character_maximum_length,
        is_nullable,
        column_default
      FROM information_schema.columns
      WHERE table_name = 'stores'
      ORDER BY ordinal_position
    `);
    
    // Verificar também se a tabela existe
    const tableExists = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'stores'
      )
    `);
    
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        table_exists: tableExists.rows[0].exists,
        columns: result.rows,
        column_names: result.rows.map(col => col.column_name)
      })
    };
  } catch (error) {
    console.error('Erro ao verificar estrutura:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao verificar estrutura',
        message: error.message
      })
    };
  }
}; 