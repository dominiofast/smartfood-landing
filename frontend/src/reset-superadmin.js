import fetch from 'node-fetch';

async function resetSuperadmin() {
  try {
    // Primeiro, tentar com a senha original
    const response1 = await fetch('https://peppy-narwhal-64ff9e.netlify.app/.netlify/functions/diagnose-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'reset_superadmin',
        name: 'Super Admin',
        email: 'admin@dominiotech.com',
        password: 'DominioTech@2025'
      })
    });
    
    console.log('Resposta 1:', await response1.json());

    // Tentar com a senha alternativa
    const response2 = await fetch('https://peppy-narwhal-64ff9e.netlify.app/.netlify/functions/diagnose-db', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'reset_superadmin',
        name: 'Super Admin',
        email: 'admin@dominiotech.com',
        password: 'SuperAdmin@123'
      })
    });

    console.log('Resposta 2:', await response2.json());

  } catch (error) {
    console.error('Erro:', error);
  }
}

resetSuperadmin(); 