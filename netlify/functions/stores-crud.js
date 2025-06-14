const { Pool } = require('pg');

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

// Importar JWT
const jwt = require('jsonwebtoken');

// Middleware para verificar autenticação e extrair dados do usuário
const verifyAuth = (headers) => {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autenticação não fornecido');
  }
  
  const token = authHeader.substring(7);
  const JWT_SECRET = process.env.JWT_SECRET || 'smartfood-secret-key-2025';
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    return decoded; // Retorna os dados do usuário decodificados do token
  } catch (error) {
    throw new Error('Token inválido ou expirado');
  }
};

exports.handler = async (event, context) => {
  // Configurar CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Content-Type': 'application/json'
  };
  
  // Responder a requisições OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers
    };
  }
  
  let userData = null;
  
  try {
    // Sempre verificar autenticação para obter dados do usuário
    try {
      userData = verifyAuth(event.headers);
    } catch (error) {
      // Para GET, permitir acesso sem autenticação mas sem filtros
      if (event.httpMethod !== 'GET') {
        return {
          statusCode: 401,
          headers,
          body: JSON.stringify({ error: 'Não autorizado', message: error.message })
        };
      }
    }
    
    // Processar a requisição com base no método HTTP
    switch (event.httpMethod) {
      case 'GET': {
        // Verificar se é uma requisição para uma loja específica
        const pathParts = event.path.split('/');
        const storeId = pathParts[pathParts.length - 1];
        
        if (storeId && storeId !== 'stores-crud') {
          // Buscar loja específica
          const result = await query(
            'SELECT * FROM stores WHERE id = $1',
            [storeId]
          );
          
          if (result.rows.length === 0) {
            return {
              statusCode: 404,
              headers,
              body: JSON.stringify({ error: 'Loja não encontrada' })
            };
          }
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, store: result.rows[0] })
          };
        } else {
          // Buscar todas as lojas
          let queryText = 'SELECT * FROM stores';
          let queryParams = [];
          
          // Se for manager, filtrar apenas a loja dele
          if (userData && userData.role === 'manager' && userData.store_id) {
            queryText += ' WHERE id = $1';
            queryParams = [userData.store_id];
          }
          // SuperAdmin vê todas as lojas
          
          queryText += ' ORDER BY name';
          
          const result = await query(queryText, queryParams);
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, stores: result.rows })
          };
        }
      }
      
      case 'POST': {
        // Apenas superadmin pode criar lojas
        if (!userData || userData.role !== 'superadmin') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Apenas superadmin pode criar lojas' })
          };
        }
        
        // Criar nova loja
        const { 
          name, 
          address, 
          city, 
          state, 
          zip_code, 
          phone, 
          email, 
          logo_url 
        } = JSON.parse(event.body);
        
        // Validações básicas
        if (!name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome da loja é obrigatório' })
          };
        }
        
        if (!phone) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Telefone é obrigatório' })
          };
        }
        
        if (!email) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Email é obrigatório' })
          };
        }



        // Verificar se já existe um superadmin para usar como created_by
        let createdBy;
        try {
          const superAdminResult = await query(
            "SELECT id FROM users WHERE role = 'superadmin' LIMIT 1"
          );

          if (superAdminResult.rows.length === 0) {
            // Se não há superadmin, criar um UUID temporário
            createdBy = 'temp-' + Date.now();
          } else {
            createdBy = superAdminResult.rows[0].id;
          }
        } catch (error) {
          console.log('Erro ao buscar superadmin, usando ID temporário');
          createdBy = 'temp-' + Date.now();
        }
        
        console.log('Dados recebidos:', { name, address, city, state, zip_code, phone, email, logo_url });
        
        const result = await query(
          `INSERT INTO stores (
            name, 
            address, 
            phone, 
            email, 
            logo_url,
            is_active
          ) VALUES ($1, $2, $3, $4, $5, true)
          RETURNING *`,
          [
            name, 
            address || 'Endereço não informado', 
            phone, 
            email, 
            logo_url || null
          ]
        );
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, store: result.rows[0] })
        };
      }
      
      case 'PUT': {
        // Verificar se usuário está autenticado
        if (!userData) {
          return {
            statusCode: 401,
            headers,
            body: JSON.stringify({ error: 'Não autorizado' })
          };
        }
        
        // Atualizar loja existente
        const pathParts = event.path.split('/');
        let storeId = pathParts[pathParts.length - 1];
        
        // Se o último segmento for 'stores-crud', tentar pegar o ID do body
        if (storeId === 'stores-crud' && event.body) {
          const bodyData = JSON.parse(event.body);
          storeId = bodyData.id;
        }
        
        if (!storeId || storeId === 'stores-crud') {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID da loja não fornecido' })
          };
        }
        
        // Verificar permissões: superadmin pode editar qualquer loja, manager apenas a sua
        if (userData.role === 'manager' && userData.store_id !== parseInt(storeId)) {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Você só pode editar sua própria loja' })
          };
        }
        
        const { name, address, phone, email, logo_url, is_active } = JSON.parse(event.body);
        
        if (!name) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'Nome da loja é obrigatório' })
          };
        }
        
        // Verificar se a loja existe
        const checkResult = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
        
        if (checkResult.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Loja não encontrada' })
          };
        }
        
        const result = await query(
          `UPDATE stores
           SET name = $1, address = $2, phone = $3, email = $4, logo_url = $5, 
               is_active = $6, updated_at = CURRENT_TIMESTAMP
           WHERE id = $7
           RETURNING *`,
          [name, address || null, phone || null, email || null, logo_url || null, 
           is_active !== undefined ? is_active : true, storeId]
        );
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, store: result.rows[0] })
        };
      }
      
      case 'DELETE': {
        // Apenas superadmin pode excluir lojas
        if (!userData || userData.role !== 'superadmin') {
          return {
            statusCode: 403,
            headers,
            body: JSON.stringify({ error: 'Apenas superadmin pode excluir lojas' })
          };
        }
        
        // Excluir loja
        const pathParts = event.path.split('/');
        const storeId = pathParts[pathParts.length - 1];
        
        if (!storeId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID da loja não fornecido' })
          };
        }
        
        // Verificar se a loja existe
        const checkResult = await query('SELECT id FROM stores WHERE id = $1', [storeId]);
        
        if (checkResult.rows.length === 0) {
          return {
            statusCode: 404,
            headers,
            body: JSON.stringify({ error: 'Loja não encontrada' })
          };
        }
        
        // Verificar se existem usuários vinculados à loja
        const usersResult = await query('SELECT COUNT(*) as count FROM users WHERE store_id = $1', [storeId]);
        
        if (parseInt(usersResult.rows[0].count) > 0) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ 
              error: 'Não é possível excluir a loja', 
              message: 'Existem usuários vinculados a esta loja' 
            })
          };
        }
        
        // Excluir loja
        await query('DELETE FROM stores WHERE id = $1', [storeId]);
        
        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({ success: true, message: 'Loja excluída com sucesso' })
        };
      }
      
      default:
        return {
          statusCode: 405,
          headers,
          body: JSON.stringify({ error: 'Método não permitido' })
        };
    }
  } catch (error) {
    console.error('Erro ao processar requisição:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Erro interno do servidor',
        message: error.message
      })
    };
  }
};
