const jwt = require('jsonwebtoken');
const { query } = require('./db');

const verifyToken = async (token) => {
  if (!token) {
    throw new Error('Token não fornecido');
  }

  try {
    // Remove 'Bearer ' if present
    const cleanToken = token.replace('Bearer ', '');
    
    // Verify token
    const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
    
    // Get user from database
    const userResult = await query(
      'SELECT id, name, email, role, store_id, is_active FROM users WHERE id = $1',
      [decoded.id]
    );

    if (userResult.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      throw new Error('Usuário inativo');
    }

    return user;
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new Error('Token inválido');
    }
    if (error.name === 'TokenExpiredError') {
      throw new Error('Token expirado');
    }
    throw error;
  }
};

const requireAuth = async (event) => {
  const token = event.headers.authorization;
  
  if (!token) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: 'Não autorizado' })
    };
  }

  try {
    const user = await verifyToken(token);
    return { user };
  } catch (error) {
    return {
      statusCode: 401,
      body: JSON.stringify({ error: error.message })
    };
  }
};

const requireRole = (allowedRoles) => {
  return async (event) => {
    const authResult = await requireAuth(event);
    
    if (authResult.statusCode) {
      return authResult;
    }

    const { user } = authResult;

    if (!allowedRoles.includes(user.role)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ 
          error: `Acesso negado. Apenas ${allowedRoles.join(', ')} podem acessar este recurso.` 
        })
      };
    }

    return { user };
  };
};

module.exports = {
  verifyToken,
  requireAuth,
  requireRole
}; 