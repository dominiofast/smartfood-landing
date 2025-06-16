const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rotas
exports.protect = async (req, res, next) => {
  let token;
  console.log('--- [AUTH] Iniciando verificação de proteção ---');

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
    console.log('--- [AUTH] Token encontrado no cabeçalho.');
  }

  if (!token) {
    console.error('--- [AUTH] FALHA: Nenhum token encontrado na requisição.');
    return res.status(401).json({ success: false, error: 'Acesso não autorizado, token não fornecido.' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('--- [AUTH] FALHA CRÍTICA: Variável de ambiente JWT_SECRET não definida no servidor.');
      return res.status(500).json({ success: false, error: 'Erro de configuração do servidor.' });
    }

    // Verificar e decodificar token
    const decoded = jwt.verify(token, jwtSecret);
    console.log(`--- [AUTH] Token decodificado para o ID de usuário: ${decoded.id}`);

    // Encontrar usuário no banco de dados
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      console.error(`--- [AUTH] FALHA: Token válido, mas usuário com ID ${decoded.id} não foi encontrado no banco de dados.`);
      return res.status(401).json({ success: false, error: 'Acesso não autorizado, usuário não encontrado.' });
    }

    if (!user.isActive) {
      console.warn(`--- [AUTH] FALHA: Usuário ${user.email} está inativo.`);
      return res.status(403).json({ success: false, error: 'Sua conta está inativa.' });
    }

    console.log(`--- [AUTH] SUCESSO: Usuário ${user.email} autenticado.`);
    req.user = user;
    next();
    
  } catch (err) {
    console.error('--- [AUTH] FALHA: Erro ao verificar o token (pode estar expirado ou ser inválido).', err.message);
    return res.status(401).json({ success: false, error: 'Acesso não autorizado, token inválido ou expirado.' });
  }
};

// Conceder acesso a roles específicas
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `A role '${req.user.role}' não tem permissão para acessar esta rota`
      });
    }
    next();
  };
};

// Middleware para verificar se é SuperAdmin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Apenas superadmins podem realizar esta ação.'
    });
  }
  next();
};

// Verificar se é manager da loja
exports.isStoreManager = async (req, res, next) => {
  try {
    // Superadmin tem acesso total
    if (req.user.role === 'superadmin') {
      return next();
    }

    // Manager só pode acessar sua própria loja
    if (req.user.role === 'manager') {
      const storeId = req.params.storeId || req.body.store;
      
      if (!storeId || req.user.store.toString() !== storeId) {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para acessar esta loja'
        });
      }
    }

    next();
  } catch (err) {
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar permissões'
    });
  }
}; 