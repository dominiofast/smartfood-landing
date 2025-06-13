const User = require('../models/User');
const Store = require('../models/Store');

// Listar usuários (superadmin vê todos, manager vê só da sua loja)
exports.getUsers = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'superadmin') {
      // Superadmin pode filtrar por loja se quiser
      if (req.query.store) {
        query = User.find({ store: req.query.store });
      } else {
        query = User.find();
      }
    } else {
      // Manager só vê usuários da sua loja
      query = User.find({ store: req.user.store });
    }

    // Aplicar filtros
    if (req.query.role) {
      query = query.find({ role: req.query.role });
    }

    if (req.query.isActive !== undefined) {
      query = query.find({ isActive: req.query.isActive });
    }

    const users = await query.populate('store', 'name');

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Obter um usuário específico
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('store', 'name');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin') {
      if (req.user.store.toString() !== user.store._id.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Não autorizado a acessar este usuário'
        });
      }
    }

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

// Criar novo usuário
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role, storeId } = req.body;

    // Se não for superadmin, o usuário deve ser da mesma loja
    if (req.user.role !== 'superadmin') {
      if (storeId && storeId !== req.user.store.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Você só pode criar usuários para sua própria loja'
        });
      }
      req.body.store = req.user.store;
      
      // Manager não pode criar outro manager ou superadmin
      if (role === 'manager' || role === 'superadmin') {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para criar usuários com este role'
        });
      }
    }

    // Verificar se o email já existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email já cadastrado'
      });
    }

    // Verificar se a loja existe
    if (req.body.store || storeId) {
      const store = await Store.findById(req.body.store || storeId);
      if (!store) {
        return res.status(404).json({
          success: false,
          error: 'Loja não encontrada'
        });
      }
    }

    const user = await User.create(req.body);

    res.status(201).json({
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

// Atualizar usuário
exports.updateUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin') {
      if (req.user.store.toString() !== user.store.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Não autorizado a atualizar este usuário'
        });
      }

      // Manager não pode mudar roles para manager ou superadmin
      if (req.body.role === 'manager' || req.body.role === 'superadmin') {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para definir este role'
        });
      }

      // Manager não pode mudar a loja do usuário
      delete req.body.store;
    }

    // Não permitir atualização de senha por aqui
    delete req.body.password;

    user = await User.findByIdAndUpdate(req.params.id, req.body, {
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

// Desativar/Ativar usuário
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin') {
      if (req.user.store.toString() !== user.store.toString()) {
        return res.status(403).json({
          success: false,
          error: 'Não autorizado a alterar status deste usuário'
        });
      }

      // Manager não pode desativar outro manager
      if (user.role === 'manager') {
        return res.status(403).json({
          success: false,
          error: 'Você não tem permissão para alterar status de um manager'
        });
      }
    }

    // Não permitir desativar o próprio usuário
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode desativar seu próprio usuário'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

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

// Deletar usuário (soft delete)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Apenas superadmin pode deletar
    if (req.user.role !== 'superadmin') {
      return res.status(403).json({
        success: false,
        error: 'Apenas superadmin pode deletar usuários'
      });
    }

    // Não permitir deletar o próprio usuário
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({
        success: false,
        error: 'Você não pode deletar seu próprio usuário'
      });
    }

    // Soft delete
    user.isActive = false;
    user.email = `deleted_${Date.now()}_${user.email}`;
    await user.save();

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
}; 