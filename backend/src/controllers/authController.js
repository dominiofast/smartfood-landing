const User = require('../models/User');
const Store = require('../models/Store');
const bcrypt = require('bcryptjs');

// Registrar novo usuário
exports.register = async (req, res) => {
  try {
    const { name, email, password, role, storeId } = req.body;

    // Verificar se o usuário já existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }

    // Se não for superadmin, precisa de uma loja
    if (role !== 'superadmin' && !storeId) {
      return res.status(400).json({
        success: false,
        error: 'É necessário informar uma loja para este usuário'
      });
    }

    // Verificar se a loja existe
    if (storeId) {
      const store = await Store.findById(storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          error: 'Loja não encontrada'
        });
      }
    }

    // Criar usuário
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'manager',
      store: storeId || undefined
    });

    sendTokenResponse(user, 201, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar email e senha
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Por favor, forneça email e senha'
      });
    }

    // Verificar usuário
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Verificar se o usuário está ativo
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo. Entre em contato com o administrador.'
      });
    }

    // Verificar senha
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: 'Credenciais inválidas'
      });
    }

    // Atualizar último login
    await user.updateLastLogin();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Obter usuário atual
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('store');

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Atualizar perfil
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email
    };

    // Remover campos undefined
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );

    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Atualizar senha
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');

    // Verificar senha atual
    if (!(await user.matchPassword(req.body.currentPassword))) {
      return res.status(401).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Logout
exports.logout = async (req, res) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({
    success: true,
    data: {}
  });
};

// Criar superadmin inicial (deve ser executado apenas uma vez)
exports.createSuperAdmin = async (req, res) => {
  try {
    // Verificar se já existe um superadmin
    const superAdminExists = await User.findOne({ role: 'superadmin' });
    
    if (superAdminExists) {
      return res.status(400).json({
        success: false,
        error: 'Superadmin já existe'
      });
    }

    // Criar superadmin com as credenciais do .env
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'admin@smartfood.com',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'superadmin'
    });

    res.status(201).json({
      success: true,
      data: {
        id: superAdmin._id,
        name: superAdmin.name,
        email: superAdmin.email,
        role: superAdmin.role
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Helper para enviar resposta com token
const sendTokenResponse = (user, statusCode, res) => {
  // Criar token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000 // 30 dias
    ),
    httpOnly: true
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        store: user.store
      }
    });
}; 