const bcrypt = require('bcryptjs');
const { pool, query, transaction } = require('./utils/db');

exports.handler = async (event, context) => {
  // Apenas permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    console.log('Iniciando configuração do banco de dados...');
    
    // Verificar se a tabela users existe
    const tableCheck = await query(
      `SELECT to_regclass('public.users') as table_exists`,
      []
    ).catch(err => {
      console.error('Erro ao verificar tabela users:', err);
      return { rows: [{ table_exists: null }] };
    });
    
    const usersTableExists = tableCheck.rows[0].table_exists !== null;
    
    // Verificar se a tabela stores existe
    const storeTableCheck = await query(
      `SELECT to_regclass('public.stores') as table_exists`,
      []
    ).catch(err => {
      console.error('Erro ao verificar tabela stores:', err);
      return { rows: [{ table_exists: null }] };
    });
    
    const storesTableExists = storeTableCheck.rows[0].table_exists !== null;
    
    // Criar tabelas se não existirem
    if (!storesTableExists) {
      console.log('Criando tabela stores...');
      await query(`
        CREATE TABLE stores (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          address VARCHAR(255),
          phone VARCHAR(20),
          email VARCHAR(255),
          logo_url VARCHAR(255),
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }
    
    if (!usersTableExists) {
      console.log('Criando tabela users...');
      await query(`
        CREATE TABLE users (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL,
          store_id INTEGER REFERENCES stores(id),
          is_active BOOLEAN DEFAULT true,
          reset_password_token VARCHAR(255),
          reset_password_expires TIMESTAMP,
          last_login TIMESTAMP,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Obter dados do corpo da requisição ou usar valores padrão
    let { name, email, password } = {};
    
    try {
      const requestBody = JSON.parse(event.body);
      name = requestBody.name;
      email = requestBody.email;
      password = requestBody.password;
    } catch (e) {
      console.log('Usando valores padrão para superadmin');
    }

    // Valores padrão
    name = name || 'Super Admin';
    email = email || 'admin@dominiotech.com';
    password = password || 'SuperAdmin@123';

    // Verificar se já existe um superadmin
    const superadminCheck = await query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'`,
      []
    ).catch(err => {
      console.error('Erro ao verificar superadmin existente:', err);
      return { rows: [{ count: '0' }] };
    });

    let superadminCreated = false;
    let superadminInfo = null;

    // Criar superadmin se não existir
    if (parseInt(superadminCheck.rows[0].count) === 0) {
      console.log('Criando usuário superadmin...');
      
      // Gerar hash da senha
      const salt = await bcrypt.genSalt(10);
      const password_hash = await bcrypt.hash(password, salt);

      // Inserir superadmin
      const result = await query(
        `INSERT INTO users 
         (name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, 'superadmin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role, created_at`,
        [name, email.toLowerCase(), password_hash]
      );

      superadminCreated = true;
      superadminInfo = {
        id: result.rows[0].id,
        name: result.rows[0].name,
        email: result.rows[0].email,
        credentials: {
          email: email.toLowerCase(),
          password: password
        }
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        database: {
          users_table_exists: usersTableExists,
          stores_table_exists: storesTableExists,
          users_table_created: !usersTableExists,
          stores_table_created: !storesTableExists
        },
        superadmin: {
          created: superadminCreated,
          already_exists: parseInt(superadminCheck.rows[0].count) > 0,
          info: superadminCreated ? superadminInfo : null
        }
      })
    };
  } catch (error) {
    console.error('Erro na configuração do banco de dados:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Erro na configuração do banco de dados',
        message: error.message,
        stack: error.stack,
        database_url_exists: !!process.env.DATABASE_URL
      })
    };
  }
};
