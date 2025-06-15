const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const storeRoutes = require('./storeRoutes');
const userRoutes = require('./userRoutes');
const menuRoutes = require('./menuRoutes');
const orderRoutes = require('./orderRoutes');
const whatsappRoutes = require('./whatsappRoutes');

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/users', userRoutes);
router.use('/menu', menuRoutes);
router.use('/orders', orderRoutes);
router.use('/whatsapp', whatsappRoutes);

module.exports = router; 