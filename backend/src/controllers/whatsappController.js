const Store = require('../models/Store');
const WhatsappMessage = require('../models/WhatsappMessage');
const axios = require('axios');

// Conectar WhatsApp
exports.connect = async (req, res) => {
  try {
    const { storeId } = req.body;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    if (!store.whatsappApi?.instanceKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais da API do WhatsApp não configuradas'
      });
    }

    // Obter QR Code da Mega API
    const response = await axios.get(`https://${store.whatsappApi.host}/api/instance/qr/${store.whatsappApi.instanceKey}`, {
      headers: {
        'Authorization': `Bearer ${store.whatsappApi.token}`
      }
    });

    if (response.data.qrcode) {
      // Atualizar QR Code na loja
      store.whatsappApi.qrCode = response.data.qrcode;
      await store.save();

      return res.json({
        success: true,
        qrCode: response.data.qrcode
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Não foi possível gerar o QR Code'
    });
  } catch (error) {
    console.error('Erro ao conectar WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao conectar WhatsApp'
    });
  }
};

// Desconectar WhatsApp
exports.disconnect = async (req, res) => {
  try {
    const { storeId } = req.body;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    if (!store.whatsappApi?.instanceKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais da API do WhatsApp não configuradas'
      });
    }

    // Desconectar da Mega API
    await axios.delete(`https://${store.whatsappApi.host}/api/instance/logout/${store.whatsappApi.instanceKey}`, {
      headers: {
        'Authorization': `Bearer ${store.whatsappApi.token}`
      }
    });

    // Atualizar status na loja
    store.whatsappApi.isConnected = false;
    store.whatsappApi.qrCode = null;
    await store.save();

    return res.json({
      success: true,
      message: 'WhatsApp desconectado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao desconectar WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao desconectar WhatsApp'
    });
  }
};

// Verificar status da conexão
exports.status = async (req, res) => {
  try {
    const { storeId } = req.params;
    
    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    if (!store.whatsappApi?.instanceKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais da API do WhatsApp não configuradas'
      });
    }

    // Verificar status na Mega API
    const response = await axios.get(`https://${store.whatsappApi.host}/api/instance/status/${store.whatsappApi.instanceKey}`, {
      headers: {
        'Authorization': `Bearer ${store.whatsappApi.token}`
      }
    });

    // Atualizar status na loja
    store.whatsappApi.isConnected = response.data.status === 'connected';
    if (store.whatsappApi.isConnected) {
      store.whatsappApi.lastConnection = new Date();
      store.whatsappApi.qrCode = null;
    }
    await store.save();

    return res.json({
      success: true,
      connected: store.whatsappApi.isConnected
    });
  } catch (error) {
    console.error('Erro ao verificar status do WhatsApp:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao verificar status do WhatsApp'
    });
  }
};

// Receber webhook do WhatsApp
exports.webhook = async (req, res) => {
  try {
    const { storeId } = req.params;
    const webhookData = req.body;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Processar eventos do webhook
    switch (webhookData.event) {
      case 'connection.update':
        // Atualizar status da conexão
        store.whatsappApi.isConnected = webhookData.data.status === 'connected';
        if (store.whatsappApi.isConnected) {
          store.whatsappApi.lastConnection = new Date();
          store.whatsappApi.qrCode = null;
        }
        await store.save();
        break;

      case 'message':
        // Salvar mensagem no banco de dados
        const messageData = webhookData.data;
        await WhatsappMessage.create({
          store: storeId,
          messageId: messageData.id,
          type: messageData.type,
          content: messageData.body || messageData.caption || '',
          mediaUrl: messageData.mediaUrl,
          from: messageData.from,
          to: messageData.to,
          timestamp: new Date(messageData.timestamp * 1000),
          direction: 'inbound',
          metadata: {
            raw: messageData
          }
        });

        // Se for uma mensagem de texto, podemos implementar respostas automáticas aqui
        if (messageData.type === 'text') {
          // Exemplo de resposta automática
          const response = await axios.post(
            `https://${store.whatsappApi.host}/api/message/text/${store.whatsappApi.instanceKey}`,
            {
              number: messageData.from,
              message: 'Obrigado por sua mensagem! Em breve retornaremos seu contato.'
            },
            {
              headers: {
                'Authorization': `Bearer ${store.whatsappApi.token}`
              }
            }
          );

          // Salvar a resposta automática
          if (response.data.success) {
            await WhatsappMessage.create({
              store: storeId,
              messageId: response.data.messageId,
              type: 'text',
              content: 'Obrigado por sua mensagem! Em breve retornaremos seu contato.',
              from: messageData.to,
              to: messageData.from,
              timestamp: new Date(),
              direction: 'outbound',
              status: 'sent'
            });
          }
        }
        break;

      case 'message.status':
        // Atualizar status da mensagem
        const statusData = webhookData.data;
        await WhatsappMessage.findOneAndUpdate(
          { messageId: statusData.messageId },
          { status: statusData.status }
        );
        break;

      default:
        console.log('Evento não tratado:', webhookData.event);
    }

    return res.json({
      success: true,
      message: 'Webhook processado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook'
    });
  }
};

// Listar mensagens do WhatsApp
exports.listMessages = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 20, phone } = req.query;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Construir query
    const query = { store: storeId };
    if (phone) {
      query.$or = [
        { from: phone },
        { to: phone }
      ];
    }

    // Contar total de mensagens
    const total = await WhatsappMessage.countDocuments(query);

    // Buscar mensagens com paginação
    const messages = await WhatsappMessage.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    return res.json({
      success: true,
      data: {
        messages,
        total,
        page: Number(page),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao listar mensagens'
    });
  }
};

// Enviar mensagem
exports.sendMessage = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { phone, message, type = 'text' } = req.body;

    const store = await Store.findById(storeId);
    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    if (!store.whatsappApi?.instanceKey) {
      return res.status(400).json({
        success: false,
        error: 'Credenciais da API do WhatsApp não configuradas'
      });
    }

    // Enviar mensagem via Mega API
    const response = await axios.post(
      `https://${store.whatsappApi.host}/api/message/${type}/${store.whatsappApi.instanceKey}`,
      {
        number: phone,
        message
      },
      {
        headers: {
          'Authorization': `Bearer ${store.whatsappApi.token}`
        }
      }
    );

    if (response.data.success) {
      // Salvar mensagem enviada
      const newMessage = await WhatsappMessage.create({
        store: storeId,
        messageId: response.data.messageId,
        type,
        content: message,
        from: store.contact.whatsapp || store.contact.phone,
        to: phone,
        timestamp: new Date(),
        direction: 'outbound',
        status: 'sent'
      });

      return res.json({
        success: true,
        data: newMessage
      });
    }

    return res.status(400).json({
      success: false,
      error: 'Erro ao enviar mensagem'
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao enviar mensagem'
    });
  }
}; 