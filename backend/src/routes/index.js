const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const userRoutes = require('./userRoutes');
// const menuRoutes = require('./menuRoutes'); // Removido pois o arquivo não existe
// const orderRoutes = require('./orderRoutes'); // Removido pois o arquivo não existe
const whatsappRoutes = require('./whatsappRoutes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/users', userRoutes);
// router.use('/menu', menuRoutes); // Removido pois o arquivo não existe
// router.use('/orders', orderRoutes); // Removido pois o arquivo não existe
router.use('/whatsapp', whatsappRoutes);

module.exports = router; 