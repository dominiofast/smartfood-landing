const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  updatePassword,
  createSuperAdmin
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// Rotas públicas
router.post('/register', register);
router.post('/login', login);
router.post('/create-superadmin', createSuperAdmin); // Usar apenas na primeira instalação

// Rotas protegidas
router.get('/me', protect, getMe);
router.put('/updateprofile', protect, updateProfile);
router.put('/updatepassword', protect, updatePassword);
router.get('/logout', protect, logout);

module.exports = router; 