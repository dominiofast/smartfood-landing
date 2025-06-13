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
    // Primeiro verificar se a tabela users existe
    try {
      const tableCheck = await query(
        `SELECT to_regclass('public.users') as table_exists`,
        []
      );
      
      const tableExists = tableCheck.rows[0].table_exists !== null;
      
      if (!tableExists) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            error: 'Tabela de usuários não encontrada',
            details: 'A tabela "users" não existe no banco de dados',
            setup_required: true
          })
        };
      }
    } catch (tableError) {
      console.error('Erro ao verificar tabela:', tableError);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error: 'Erro ao verificar estrutura do banco de dados',
          details: tableError.message,
          stack: tableError.stack
        })
      };
    }

    // Verificar se existe um superadmin
    const result = await query(
      `SELECT id, name, email, role, created_at 
       FROM users 
       WHERE role = 'superadmin'`,
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
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        error: 'Erro ao verificar superadmin',
        message: error.message,
        stack: error.stack,
        database_url_exists: !!process.env.DATABASE_URL
      })
    };
  }
};
