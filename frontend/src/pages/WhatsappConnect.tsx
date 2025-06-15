import React, { useState } from 'react';

export default function WhatsappConnect() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Olá, gostaria de falar com a loja!');

  const whatsappLink = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    : '';

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-4 text-green-600">
        <svg
          viewBox="0 0 448 512"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
        </svg>
        Conectar WhatsApp
      </h1>
      <div className="bg-white rounded-xl shadow p-6 mb-8 border">
        <h2 className="text-xl font-semibold mb-2">Integração Simples (Link/Botão)</h2>
        <p className="text-gray-600 mb-4">Permite que o cliente abra uma conversa no WhatsApp Web ou app com sua loja.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-1">Número do WhatsApp (apenas números, com DDD e país)</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 outline-none"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              placeholder="Ex: 5511999999999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Mensagem Padrão</label>
            <input
              type="text"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-300 outline-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Digite a mensagem inicial"
            />
          </div>
        </div>
        <a
          href={whatsappLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 px-6 py-2 rounded-lg text-white font-semibold shadow transition-colors ${phone ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'}`}
          onClick={(e) => !phone && e.preventDefault()}
        >
          <svg
            viewBox="0 0 448 512"
            fill="currentColor"
            className="w-5 h-5"
          >
            <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
          </svg>
          Abrir WhatsApp
        </a>
      </div>
      <div className="bg-white rounded-xl shadow p-6 border">
        <h2 className="text-xl font-semibold mb-2 text-yellow-600">Integração Avançada (Bot WhatsApp)</h2>
        <p className="text-gray-700 mb-2">
          Para automação, respostas automáticas e integração real com mensagens, é necessário rodar um <b>bot de WhatsApp</b> usando a biblioteca <code>whatsapp-web.js</code> no backend.<br />
          <span className="text-sm text-gray-500">(O servidor precisa ficar online 24h para o bot funcionar.)</span>
        </p>
        <ul className="list-disc ml-6 text-gray-600 mb-2">
          <li>Permite automação de mensagens, respostas automáticas, integração com sistemas.</li>
          <li>Necessita configuração e autenticação via QR Code.</li>
          <li>Não é uma API oficial do WhatsApp.</li>
        </ul>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <b>Próximos passos:</b> Solicite ao desenvolvedor a configuração do bot no backend.<br />
          Após configurado, a comunicação entre o site e o bot pode ser feita via API interna.
        </div>
      </div>
    </div>
  );
} 