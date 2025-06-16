const Store = require('../models/Store');
const User = require('../models/User');

// Listar todas as lojas (superadmin) ou loja do manager
exports.getStores = async (req, res) => {
  try {
    let query;

    // Se for superadmin, pode ver todas as lojas
    if (req.user.role === 'superadmin') {
      query = Store.find().populate('createdBy', 'name email');
    } else {
      // Manager só vê sua própria loja
      query = Store.findById(req.user.store).populate('createdBy', 'name email');
    }

    const stores = await query;

    res.status(200).json({
      success: true,
      count: Array.isArray(stores) ? stores.length : 1,
      data: stores
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Obter uma loja específica
exports.getStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin' && 
        req.user.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a acessar esta loja'
      });
    }

    res.status(200).json({
      success: true,
      data: store
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Criar nova loja (apenas superadmin)
exports.createStore = async (req, res) => {
  try {
    // Adicionar o criador
    req.body.createdBy = req.user.id;

    const store = await Store.create(req.body);

    // Se foi informado um manager, atualizar o usuário
    if (req.body.managerId) {
      await User.findByIdAndUpdate(req.body.managerId, {
        store: store._id
      });
    }

    res.status(201).json({
      success: true,
      data: store
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Atualizar loja
exports.updateStore = async (req, res) => {
  console.log('--- INICIANDO ATUALIZAÇÃO DE LOJA ---');
  try {
    const storeId = req.params.id;
    const updateData = req.body;

    console.log(`[${new Date().toISOString()}] Recebida requisição para atualizar loja ID: ${storeId}`);
    console.log(`[${new Date().toISOString()}] Dados recebidos no corpo da requisição:`, JSON.stringify(updateData, null, 2));

    let store = await Store.findById(storeId);

    if (!store) {
      console.error(`[${new Date().toISOString()}] ERRO: Loja com ID ${storeId} não encontrada.`);
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin' && req.user.store.toString() !== store._id.toString()) {
      console.warn(`[${new Date().toISOString()}] AVISO: Usuário ${req.user.id} sem permissão para atualizar loja ${storeId}.`);
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a atualizar esta loja'
      });
    }

    console.log(`[${new Date().toISOString()}] Permissão concedida. Tentando atualizar...`);

    const updatedStore = await Store.findByIdAndUpdate(storeId, updateData, {
      new: true,
      runValidators: true
    });

    if (!updatedStore) {
        console.error(`[${new Date().toISOString()}] ERRO: findByIdAndUpdate retornou null. A atualização falhou silenciosamente.`);
        // Isso pode acontecer se a validação falhar e não for capturada no catch.
        return res.status(500).json({
            success: false,
            error: 'A atualização da loja falhou por um motivo desconhecido.'
        });
    }

    console.log(`[${new Date().toISOString()}] SUCESSO: Loja atualizada. Dados após atualização:`, JSON.stringify(updatedStore, null, 2));
    console.log('--- FIM DA ATUALIZAÇÃO DE LOJA ---');

    res.status(200).json({
      success: true,
      data: updatedStore
    });
  } catch (err) {
    console.error(`[${new Date().toISOString()}] ERRO CATCH: Ocorreu um erro durante a atualização.`, err);
    console.log('--- FIM DA ATUALIZAÇÃO DE LOJA (COM ERRO) ---');
    res.status(400).json({
      success: false,
      error: err.message
    });
  }
};

// Deletar loja (apenas superadmin)
exports.deleteStore = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Desativar todos os usuários da loja
    await User.updateMany(
      { store: store._id },
      { isActive: false }
    );

    // Soft delete - apenas desativa a loja
    store.isActive = false;
    await store.save();

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

// Estatísticas da loja
exports.getStoreStats = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);

    if (!store) {
      return res.status(404).json({
        success: false,
        error: 'Loja não encontrada'
      });
    }

    // Verificar permissão
    if (req.user.role !== 'superadmin' && 
        req.user.store.toString() !== store._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Não autorizado a ver estatísticas desta loja'
      });
    }

    // Contar usuários da loja
    const usersCount = await User.countDocuments({ store: store._id, isActive: true });

    res.status(200).json({
      success: true,
      data: {
        store: {
          id: store._id,
          name: store.name,
          status: store.subscription.status
        },
        stats: {
          ...store.stats,
          activeUsers: usersCount
        }
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Dashboard do superadmin
exports.getSuperAdminDashboard = async (req, res) => {
  try {
    const totalStores = await Store.countDocuments();
    const activeStores = await Store.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    const storesByPlan = await Store.aggregate([
      {
        $group: {
          _id: '$subscription.plan',
          count: { $sum: 1 }
        }
      }
    ]);

    const recentStores = await Store.find()
      .sort('-createdAt')
      .limit(5)
      .select('name createdAt subscription.plan')
      .populate('createdBy', 'name');

    res.status(200).json({
      success: true,
      data: {
        overview: {
          totalStores,
          activeStores,
          totalUsers,
          activeUsers
        },
        storesByPlan,
        recentStores
      }
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
};

// Atualizar logo da loja
exports.updateLogo = async (req, res) => {
  try {
    const { id } = req.params;
    const { logo } = req.body;
    let store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Loja não encontrada' });
    }
    // Permissão
    if (req.user.role !== 'superadmin' && req.user.store.toString() !== store._id.toString()) {
      return res.status(403).json({ success: false, error: 'Não autorizado' });
    }
    store.images.logo = logo;
    await store.save();
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Atualizar banners da loja
exports.updateBanners = async (req, res) => {
  try {
    const { id } = req.params;
    const { banners } = req.body;
    let store = await Store.findById(id);
    if (!store) {
      return res.status(404).json({ success: false, error: 'Loja não encontrada' });
    }
    // Permissão
    if (req.user.role !== 'superadmin' && req.user.store.toString() !== store._id.toString()) {
      return res.status(403).json({ success: false, error: 'Não autorizado' });
    }
    store.banners = banners;
    await store.save();
    res.status(200).json({ success: true, data: store });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
}; 