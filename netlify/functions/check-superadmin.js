const { query } = require('./utils/db');

exports.handler = async (event, context) => {
  // Apenas permitir GET
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Método não permitido' })
    };
  }

  try {
    // Verificar se existe um superadmin
    const result = await query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       WHERE role = 'superadmin' AND is_active = true`,
      []
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exists: false,
          message: 'Nenhum superadmin encontrado.'
        })
      };
    }

    // Retornar informações não sensíveis
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exists: true,
        count: result.rows.length,
        superadmins: result.rows.map(user => ({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at
        }))
      })
    };
  } catch (error) {
    console.error('Erro ao verificar superadmin:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao verificar superadmin' })
    };
  }
};
