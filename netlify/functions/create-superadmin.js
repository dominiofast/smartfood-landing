const bcrypt = require('bcryptjs');
const { query, transaction } = require('./utils/db');

exports.handler = async (event, context) => {
  // Apenas permitir POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Verificar se já existe um superadmin
    const checkResult = await query(
      `SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'`,
      []
    );

    if (parseInt(checkResult.rows[0].count) > 0) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          success: false,
          message: 'Já existe pelo menos um superadmin no sistema.'
        })
      };
    }

    // Obter dados do corpo da requisição ou usar valores padrão
    let { name, email, password } = {};
    
    try {
      const requestBody = JSON.parse(event.body);
      name = requestBody.name;
      email = requestBody.email;
      password = requestBody.password;
    } catch (e) {
      // Se não houver corpo ou for inválido, usar valores padrão
      console.log('Usando valores padrão para superadmin');
    }

    // Valores padrão
    name = name || 'Super Admin';
    email = email || 'admin@dominiotech.com';
    password = password || 'SuperAdmin@123';

    // Gerar hash da senha
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Inserir superadmin
    const result = await transaction(async (client) => {
      // Verificar novamente dentro da transação
      const check = await client.query(
        `SELECT COUNT(*) as count FROM users WHERE role = 'superadmin'`,
        []
      );
      
      if (parseInt(check.rows[0].count) > 0) {
        throw new Error('Já existe um superadmin');
      }

      // Inserir o usuário
      const insertResult = await client.query(
        `INSERT INTO users 
         (name, email, password_hash, role, is_active, created_at, updated_at)
         VALUES ($1, $2, $3, 'superadmin', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, role, created_at`,
        [name, email.toLowerCase(), password_hash]
      );

      return insertResult;
    });

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        message: 'Superadmin criado com sucesso!',
        user: {
          id: result.rows[0].id,
          name: result.rows[0].name,
          email: result.rows[0].email,
          role: result.rows[0].role,
          created_at: result.rows[0].created_at
        },
        credentials: {
          email: email.toLowerCase(),
          password: password
        }
      })
    };
  } catch (error) {
    console.error('Erro ao criar superadmin:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Erro ao criar superadmin',
        message: error.message
      })
    };
  }
};
