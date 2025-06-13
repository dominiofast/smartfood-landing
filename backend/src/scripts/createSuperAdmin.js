const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

// Carregar variáveis de ambiente
dotenv.config({ path: '../../.env' });

const createSuperAdmin = async () => {
  try {
    // Conectar ao banco
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    console.log('Conectado ao MongoDB');

    // Verificar se já existe um superadmin
    const existingSuperAdmin = await User.findOne({ role: 'superadmin' });
    
    if (existingSuperAdmin) {
      console.log('Superadmin já existe!');
      console.log('Email:', existingSuperAdmin.email);
      process.exit(0);
    }

    // Criar superadmin
    const superAdmin = await User.create({
      name: 'Super Admin',
      email: process.env.SUPERADMIN_EMAIL || 'admin@smartfood.com',
      password: process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123',
      role: 'superadmin'
    });

    console.log('\n✅ Superadmin criado com sucesso!');
    console.log('📧 Email:', superAdmin.email);
    console.log('🔑 Senha:', process.env.SUPERADMIN_PASSWORD || 'SuperAdmin@123');
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar superadmin:', error.message);
    process.exit(1);
  }
};

// Executar script
createSuperAdmin(); 