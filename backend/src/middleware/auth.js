const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rotas
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota'
    });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota'
    });
  }
};

// Verificar roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Usuário com role ${req.user.role} não está autorizado para acessar esta rota`
      });
    }
    next();
  };
};

// Verificar se é superadmin
exports.isSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'superadmin') {
    return res.status(403).json({
      success: false,
      error: 'Apenas superadmins podem acessar esta rota'
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