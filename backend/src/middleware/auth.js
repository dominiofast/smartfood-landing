const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Proteger rotas
exports.protect = async (req, res, next) => {
  let token;
  console.log('--- INICIANDO MIDDLEWARE PROTECT ---');
  console.log('Verificando cabeçalho de autorização...');

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token encontrado no cabeçalho.');
  }

  if (!token) {
    console.error('ERRO: Token não encontrado na requisição.');
    console.log('--- FIM DO MIDDLEWARE PROTECT (ERRO) ---');
    return res.status(401).json({
      success: false,
      error: 'Não autorizado para acessar esta rota'
    });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('ERRO: Variável de ambiente JWT_SECRET não está definida.');
      console.log('--- FIM DO MIDDLEWARE PROTECT (ERRO) ---');
      return res.status(500).json({ success: false, error: 'Erro de configuração do servidor' });
    }
    console.log('JWT_SECRET carregado com sucesso.');

    // Verificar token
    const decoded = jwt.verify(token, jwtSecret);
    console.log('Token decodificado com sucesso:', decoded);

    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      console.error(`ERRO: Usuário com ID ${decoded.id} não encontrado no banco de dados.`);
      console.log('--- FIM DO MIDDLEWARE PROTECT (ERRO) ---');
      return res.status(401).json({
        success: false,
        error: 'Não autorizado para acessar esta rota'
      });
    }
    
    console.log(`Usuário ${req.user.email} encontrado e autenticado com sucesso.`);

    if (!req.user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      });
    }

    console.log('--- FIM DO MIDDLEWARE PROTECT (SUCESSO) ---');
    next();
  } catch (err) {
    console.error('ERRO: Falha na verificação do token (token inválido ou expirado).', err.message);
    console.log('--- FIM DO MIDDLEWARE PROTECT (ERRO) ---');
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