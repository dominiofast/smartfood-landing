const bcrypt = require('bcryptjs');
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

// Query helper
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Query executed', { text, duration, rows: res.rowCount });
    return res;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Responder a requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const { name, email, password, store_id } = JSON.parse(event.body);

    // Validações
    if (!name || !email || !password || !store_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Nome, email, senha e ID da loja são obrigatórios' })
      };
    }

    // Verificar se a loja existe
    const storeResult = await query(
      'SELECT id, name FROM stores WHERE id = $1',
      [store_id]
    );

    if (storeResult.rows.length === 0) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: 'Loja não encontrada' })
      };
    }

    // Verificar se já existe um usuário com este email
    const emailCheck = await query(
      'SELECT COUNT(*) as count FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (parseInt(emailCheck.rows[0].count) > 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email já cadastrado' })
      };
    }

    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Inserir manager
    const result = await query(
      `INSERT INTO users 
       (name, email, password_hash, role, store_id, is_active, created_at, updated_at)
       VALUES ($1, $2, $3, 'manager', $4, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       RETURNING id, name, email, role, store_id, created_at`,
      [name, email.toLowerCase(), password_hash, store_id]
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        success: true,
        user: result.rows[0],
        store: storeResult.rows[0],
        credentials: {
          email: email.toLowerCase(),
          password: password
        }
      })
    };
  } catch (error) {
    console.error('Erro ao criar manager:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro ao criar manager',
        message: error.message
      })
    };
  }
}; 