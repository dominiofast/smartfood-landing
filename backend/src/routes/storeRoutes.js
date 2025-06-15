const express = require('express');
const router = express.Router();
const {
  getStores,
  getStore,
  createStore,
  updateStore,
  deleteStore,
  getStoreStats,
  getSuperAdminDashboard,
  updateLogo,
  updateBanners
} = require('../controllers/storeController');
const { protect, authorize, isSuperAdmin } = require('../middleware/auth');

// Todas as rotas precisam de autenticação
router.use(protect);

// Rotas gerais
router.route('/')
  .get(getStores) // Superadmin vê todas, manager vê só a sua
  .post(isSuperAdmin, createStore); // Apenas superadmin pode criar

// Dashboard do superadmin
router.get('/dashboard', isSuperAdmin, getSuperAdminDashboard);

// Rotas específicas por ID
router.route('/:id')
  .get(getStore)
  .put(updateStore) // Superadmin pode atualizar qualquer uma, manager só a sua
  .delete(isSuperAdmin, deleteStore); // Apenas superadmin pode deletar

// Estatísticas da loja
router.get('/:id/stats', getStoreStats);

// Rotas para logo e banners
router.put('/:id/logo', updateLogo);
router.put('/:id/banners', updateBanners);

module.exports = router; 