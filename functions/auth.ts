import { Handler } from '@netlify/functions';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuração do pool de conexão com o banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função auxiliar para gerar token JWT
const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '90d' }
  );
};

// Handler principal
export const handler: Handler = async (event) => {
  // Habilita CORS
  const headers = {
    'Access-Control-Allow-Origin': 'https://peppy-narwhal-64ff9e.netlify.app',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Responde a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Verifica se é uma requisição POST para /auth/login
  if (event.path === '/.netlify/functions/auth/login' && event.httpMethod === 'POST') {
    try {
      const { email, password } = JSON.parse(event.body || '{}');

      // Validação básica
      if (!email || !password) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Email e senha são obrigatórios'
          })
        };
      }

      // Busca usuário no banco
      const result = await pool.query(
        'SELECT id, email, password, name, role FROM users WHERE email = $1',
        [email]
      );

      const user = result.rows[0];

      // Verifica se usuário existe
      if (!user) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Credenciais inválidas'
          })
        };
      }

      // Verifica senha
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({
            error: 'Credenciais inválidas'
          })
        };
      }

      // Gera token
      const token = generateToken(user.id, user.role);

      // Remove senha do objeto do usuário
      delete user.password;

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role
          }
        })
      };

    } catch (error) {
      console.error('Erro durante login:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro interno do servidor'
        })
      };
    }
  }

  // Rota não encontrada
  return {
    statusCode: 404,
    headers,
    body: JSON.stringify({
      error: 'Rota não encontrada'
    })
  };
}; 