import { Handler } from '@netlify/functions';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Configuração do pool de conexão com o banco de dados
const connectionString = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_aj6KdeGg4QiO@ep-weathered-dream-acw41z52-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false
  }
});

// Função auxiliar para gerar token JWT
const generateToken = (userId: string, role: string): string => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || "chave_super_secreta_123",
    { expiresIn: '90d' }
  );
};

// Handler principal
export const handler: Handler = async (event) => {
  // Log para debug das variáveis de ambiente
  console.log('Variáveis de ambiente:', {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? 'Definida' : 'Não definida',
    JWT_SECRET: process.env.JWT_SECRET ? 'Definida' : 'Não definida'
  });

  // Determina a origem permitida baseado no ambiente
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:8888',
    'https://peppy-narwhal-64ff9e.netlify.app'
  ];

  const origin = event.headers.origin || event.headers.Origin || '';
  const isAllowedOrigin = allowedOrigins.includes(origin);

  // Habilita CORS
  const headers = {
    'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'true',
  };

  // Log para debug
  console.log('Recebendo requisição:', {
    method: event.httpMethod,
    path: event.path,
    origin: origin,
    body: event.body ? JSON.parse(event.body) : null,
    headers: event.headers,
    isAllowedOrigin,
    corsOrigin: headers['Access-Control-Allow-Origin']
  });

  // Responde a requisições OPTIONS (preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers,
      body: ''
    };
  }

  // Verifica se é uma requisição POST para /auth/login
  if ((event.path === '/auth/login' || event.path === '/.netlify/functions/auth/login') && event.httpMethod === 'POST') {
    try {
      console.log('Iniciando processo de login...');
      
      const { email, password } = JSON.parse(event.body || '{}');
      console.log('Dados recebidos:', { email });

      // Validação básica
      if (!email || !password) {
        console.log('Dados inválidos:', { email, password: '***' });
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            error: 'Email e senha são obrigatórios'
          })
        };
      }

      console.log('Tentando conectar ao banco de dados...');

      // Busca usuário no banco
      const result = await pool.query(
        'SELECT id, email, password_hash AS password, name, role FROM users WHERE email = $1',
        [email]
      );

      console.log('Resultado da consulta:', {
        rowCount: result.rowCount,
        hasUser: !!result.rows[0],
        columns: result.fields.map(f => f.name)
      });

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
      console.log('Verificação de senha:', { isValid: isValidPassword });

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

      console.log('Login bem-sucedido para:', { email: user.email, role: user.role });

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
      console.error('Erro detalhado durante login:', {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error,
        env: {
          nodeEnv: process.env.NODE_ENV,
          hasDatabase: !!process.env.DATABASE_URL,
          hasJwt: !!process.env.JWT_SECRET
        }
      });
      
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          error: 'Erro interno do servidor',
          details: error instanceof Error ? error.message : 'Erro desconhecido'
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