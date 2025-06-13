const bcrypt = require('bcryptjs');

async function generatePasswordHash() {
  const password = 'DominioTech@2025';
  const saltRounds = 10;
  
  try {
    const hash = await bcrypt.hash(password, saltRounds);
    console.log('\n=== CREDENCIAIS DO SUPERADMIN ===');
    console.log('Email: admin@dominiotech.com');
    console.log('Senha: DominioTech@2025');
    console.log('\nHash gerado para o banco de dados:');
    console.log(hash);
    console.log('\nSQL para inserir o superadmin:');
    console.log(`
INSERT INTO users (name, email, password_hash, role, store_id) 
VALUES (
    'Super Admin', 
    'admin@dominiotech.com', 
    '${hash}',
    'superadmin', 
    NULL
);
    `);
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
  }
}

generatePasswordHash(); 