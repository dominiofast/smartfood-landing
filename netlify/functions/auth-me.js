const { requireAuth } = require('./utils/auth');
const { query } = require('./utils/db');

exports.handler = async (event, context) => {
  // Only allow GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  // Check authentication
  const authResult = await requireAuth(event);
  if (authResult.statusCode) {
    return authResult;
  }

  const { user } = authResult;

  try {
    // Get complete user data with store info
    let userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      lastLogin: user.last_login
    };

    // If user has a store, get store details
    if (user.store_id) {
      const storeResult = await query(
        'SELECT id, name, slug, business_type FROM stores WHERE id = $1',
        [user.store_id]
      );

      if (storeResult.rows.length > 0) {
        userData.store = storeResult.rows[0];
      }
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        success: true,
        data: userData
      })
    };
  } catch (error) {
    console.error('Get user error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao buscar dados do usuário' })
    };
  }
}; 