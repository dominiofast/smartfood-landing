const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { query } = require('./utils/db');

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password } = JSON.parse(event.body);

    // Validate input
    if (!email || !password) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Email e senha são obrigatórios' })
      };
    }

    // Find user by email
    const userResult = await query(
      `SELECT u.*, s.name as store_name 
       FROM users u 
       LEFT JOIN stores s ON u.store_id = s.id 
       WHERE u.email = $1 AND u.is_active = true`,
      [email.toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    const user = userResult.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Credenciais inválidas' })
      };
    }

    // Update last login
    await query(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
      [user.id]
    );

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        store_id: user.store_id 
      },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    // Remove sensitive data
    delete user.password_hash;
    delete user.reset_password_token;
    delete user.reset_password_expires;

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          store: user.store_id ? {
            id: user.store_id,
            name: user.store_name
          } : null,
          lastLogin: user.last_login
        }
      })
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar login' })
    };
  }
}; 