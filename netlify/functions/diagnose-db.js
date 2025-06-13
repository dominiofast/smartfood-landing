const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

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
  // Permitir GET e POST
  if (event.httpMethod !== 'GET' && event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    const diagnostics = {
      database: {
        connection: true,
        tables: {},
        superadmin: {}
      },
      actions: {
        performed: [],
        results: {}
      }
    };

    // 1. Verificar conexão com o banco
    try {
      await pool.query('SELECT NOW()');
      diagnostics.database.connection = true;
    } catch (connError) {
      console.error('Erro de conexão com o banco:', connError);
      return {
        statusCode: 500,
        body: JSON.stringify({
          error: 'Erro de conexão com o banco de dados',
          details: connError.message,
          database_url: DATABASE_URL ? 'Configurada' : 'Não configurada'
        })
      };
    }

    // 2. Verificar se as tabelas existem
    try {
      const tablesCheck = await query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);
      
      const tables = tablesCheck.rows.map(row => row.table_name);
      diagnostics.database.tables.list = tables;
      diagnostics.database.tables.users_exists = tables.includes('users');
      diagnostics.database.tables.stores_exists = tables.includes('stores');
    } catch (tablesError) {
      console.error('Erro ao verificar tabelas:', tablesError);
      diagnostics.database.tables.error = tablesError.message;
    }

    // 3. Se a tabela users existir, verificar superadmin
    if (diagnostics.database.tables.users_exists) {
      try {
        const superadminCheck = await query(`
          SELECT id, name, email, role, is_active, created_at
          FROM users
          WHERE role = 'superadmin'
        `);
        
        diagnostics.database.superadmin.exists = superadminCheck.rows.length > 0;
        diagnostics.database.superadmin.count = superadminCheck.rows.length;
        diagnostics.database.superadmin.list = superadminCheck.rows.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          is_active: user.is_active,
          created_at: user.created_at
        }));
      } catch (superadminError) {
        console.error('Erro ao verificar superadmin:', superadminError);
        diagnostics.database.superadmin.error = superadminError.message;
      }
    }

    // 4. Se for POST e não existir superadmin, criar um
    if (event.httpMethod === 'POST' && (!diagnostics.database.superadmin.exists || diagnostics.database.superadmin.count === 0)) {
      try {
        // Criar tabelas se não existirem
        if (!diagnostics.database.tables.stores_exists) {
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
          diagnostics.actions.performed.push('created_stores_table');
          diagnostics.database.tables.stores_exists = true;
        }
        
        if (!diagnostics.database.tables.users_exists) {
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
          diagnostics.actions.performed.push('created_users_table');
          diagnostics.database.tables.users_exists = true;
        }

        // Criar superadmin
        const name = 'Super Admin';
        const email = 'admin@dominiotech.com';
        const password = 'SuperAdmin@123';
        
        // Gerar hash da senha
        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        // Verificar se já existe um usuário com este email
        const emailCheck = await query(
          `SELECT COUNT(*) as count FROM users WHERE email = $1`,
          [email.toLowerCase()]
        );

        if (parseInt(emailCheck.rows[0].count) === 0) {
          // Inserir superadmin
          const result = await query(
            `INSERT INTO users 
             (name, email, password_hash, role, is_active, created_at, updated_at)
             VALUES ($1, $2, $3, 'superadmin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             RETURNING id, name, email, role, created_at`,
            [name, email.toLowerCase(), password_hash]
          );

          diagnostics.actions.performed.push('created_superadmin');
          diagnostics.actions.results.superadmin = {
            id: result.rows[0].id,
            name: result.rows[0].name,
            email: result.rows[0].email,
            credentials: {
              email: email.toLowerCase(),
              password: password
            }
          };
        } else {
          diagnostics.actions.performed.push('superadmin_email_exists');
          
          // Atualizar a senha do superadmin existente
          const salt = await bcrypt.genSalt(10);
          const password_hash = await bcrypt.hash(password, salt);
          
          await query(
            `UPDATE users 
             SET password_hash = $1, is_active = true, updated_at = CURRENT_TIMESTAMP
             WHERE email = $2`,
            [password_hash, email.toLowerCase()]
          );
          
          diagnostics.actions.performed.push('reset_superadmin_password');
          diagnostics.actions.results.password_reset = {
            email: email.toLowerCase(),
            password: password
          };
        }
      } catch (createError) {
        console.error('Erro ao criar superadmin:', createError);
        diagnostics.actions.error = createError.message;
      }
    }

    // 5. Verificar credenciais de login do superadmin
    if (event.httpMethod === 'POST' && event.body) {
      try {
        const { email, password } = JSON.parse(event.body);
        
        if (email && password) {
          // Buscar usuário
          const userResult = await query(
            `SELECT id, name, email, password_hash, role, is_active
             FROM users
             WHERE email = $1`,
            [email.toLowerCase()]
          );
          
          if (userResult.rows.length > 0) {
            const user = userResult.rows[0];
            
            // Verificar senha
            const isValidPassword = await bcrypt.compare(password, user.password_hash);
            
            diagnostics.actions.performed.push('test_login');
            diagnostics.actions.results.login_test = {
              user_found: true,
              password_valid: isValidPassword,
              is_active: user.is_active,
              role: user.role
            };
          } else {
            diagnostics.actions.performed.push('test_login');
            diagnostics.actions.results.login_test = {
              user_found: false
            };
          }
        }
      } catch (loginTestError) {
        console.error('Erro ao testar login:', loginTestError);
        diagnostics.actions.login_test_error = loginTestError.message;
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(diagnostics)
    };
  } catch (error) {
    console.error('Erro no diagnóstico:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Erro no diagnóstico',
        message: error.message,
        stack: error.stack
      })
    };
  }
};
