const { Configuration, OpenAIApi } = require('openai');
const { requireAuth } = require('./utils/auth');
const { query } = require('./utils/db');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

exports.handler = async (event, context) => {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
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
    const { message, history = [] } = JSON.parse(event.body);

    if (!message) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Mensagem é obrigatória' })
      };
    }

    // Get store context if user has one
    let storeContext = '';
    if (user.store_id) {
      const storeResult = await query(
        `SELECT name, business_type, settings_currency 
         FROM stores WHERE id = $1`,
        [user.store_id]
      );
      
      if (storeResult.rows.length > 0) {
        const store = storeResult.rows[0];
        storeContext = `\nContexto da loja: ${store.name} (${store.business_type})`;
      }
    }

    // Build conversation for OpenAI
    const messages = [
      {
        role: 'system',
        content: `Você é um assistente de IA especializado em gestão de restaurantes chamado DomínioTech AI. 
        Você ajuda com análises de dados, insights de negócio, sugestões de melhorias e responde dúvidas sobre gestão.
        Seja sempre profissional, útil e forneça respostas práticas e acionáveis.
        Responda sempre em português brasileiro.${storeContext}`
      },
      ...history.slice(-5).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    // Call OpenAI
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    const aiResponse = completion.data.choices[0].message.content;

    // Save message to database
    await query(
      `INSERT INTO ai_messages (user_id, store_id, role, content, tokens_used) 
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, user.store_id, 'user', message, 0]
    );

    await query(
      `INSERT INTO ai_messages (user_id, store_id, role, content, tokens_used) 
       VALUES ($1, $2, $3, $4, $5)`,
      [user.id, user.store_id, 'assistant', aiResponse, completion.data.usage.total_tokens]
    );

    // Generate suggestions based on context
    const suggestions = generateSuggestions(message, aiResponse);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content: aiResponse,
        metadata: {
          intent: detectIntent(message),
          confidence: 0.95,
          suggestions
        }
      })
    };
  } catch (error) {
    console.error('AI chat error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erro ao processar mensagem' })
    };
  }
};

function detectIntent(message) {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes('venda') || lowerMessage.includes('faturamento')) {
    return 'sales_analysis';
  }
  if (lowerMessage.includes('estoque') || lowerMessage.includes('produto')) {
    return 'inventory_query';
  }
  if (lowerMessage.includes('cliente') || lowerMessage.includes('avaliação')) {
    return 'customer_insights';
  }
  if (lowerMessage.includes('relatório') || lowerMessage.includes('análise')) {
    return 'report_request';
  }
  
  return 'general_query';
}

function generateSuggestions(message, response) {
  const suggestions = [];
  
  if (response.includes('vendas')) {
    suggestions.push('Mostrar gráfico de vendas');
    suggestions.push('Comparar com mês anterior');
  }
  
  if (response.includes('cliente')) {
    suggestions.push('Ver avaliações recentes');
    suggestions.push('Análise de satisfação');
  }
  
  if (suggestions.length === 0) {
    suggestions.push('Gerar relatório completo');
    suggestions.push('Ver insights do dia');
    suggestions.push('Sugestões de melhorias');
  }
  
  return suggestions.slice(0, 3);
} 