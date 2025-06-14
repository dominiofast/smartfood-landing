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

// Middleware para verificar autenticação
const verifyAuth = (headers) => {
  const authHeader = headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token de autenticação não fornecido');
  }
  
  // Em uma implementação real, você verificaria o token JWT aqui
  // Por simplicidade, apenas verificamos se o token existe
  return true;
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
  
  try {
    // Verificar autenticação (exceto para GET /stores que pode ser público)
    if (!(event.httpMethod === 'GET' && event.path === '/.netlify/functions/stores-crud')) {
      try {
        verifyAuth(event.headers);
      } catch (error) {
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
          const result = await query('SELECT * FROM stores ORDER BY name');
          
          return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ success: true, stores: result.rows })
          };
        }
      }
      
      case 'POST': {
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

        // Gerar slug único a partir do nome
        const slug = name.toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove acentos
          .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
          .replace(/\s+/g, '-') // Substitui espaços por hífens
          .substring(0, 100);

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
            slug,
            address_street, 
            address_city, 
            address_state, 
            address_zip_code, 
            contact_phone, 
            contact_email, 
            business_type,
            images_logo,
            is_active, 
            created_by
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, $11)
          RETURNING *`,
          [
            name, 
            slug,
            address || 'Endereço não informado', 
            city || 'Cidade não informada', 
            state || 'SP', 
            zip_code || '00000-000', 
            phone, 
            email, 
            'restaurant', // Tipo padrão
            logo_url || null,
            createdBy
          ]
        );
        
        return {
          statusCode: 201,
          headers,
          body: JSON.stringify({ success: true, store: result.rows[0] })
        };
      }
      
      case 'PUT': {
        // Atualizar loja existente
        const pathParts = event.path.split('/');
        const storeId = pathParts[pathParts.length - 1];
        
        if (!storeId) {
          return {
            statusCode: 400,
            headers,
            body: JSON.stringify({ error: 'ID da loja não fornecido' })
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
