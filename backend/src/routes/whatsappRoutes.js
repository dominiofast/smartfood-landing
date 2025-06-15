const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const whatsappController = require('../controllers/whatsappController');

// Rotas protegidas
router.use(protect);

// Conectar WhatsApp
router.post('/connect', whatsappController.connect);

// Desconectar WhatsApp
router.post('/disconnect', whatsappController.disconnect);

// Verificar status da conexão
router.get('/status/:storeId', whatsappController.status);

// Listar mensagens
router.get('/messages/:storeId', whatsappController.listMessages);

// Enviar mensagem
router.post('/messages/:storeId', whatsappController.sendMessage);

// Webhook do WhatsApp (não precisa de autenticação)
router.post('/webhook/:storeId', whatsappController.webhook);

module.exports = router; 