import React, { useState } from 'react';
import { FaWhatsapp } from 'react-icons/fa';

export default function WhatsappConnect() {
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Olá, gostaria de falar com a loja!');

  const whatsappLink = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    : '';

  return (
    <div className="max-w-xl mx-auto p-6">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-4 text-green-600">
        <FaWhatsapp size={24} /> Conectar WhatsApp
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
          <FaWhatsapp size={20} /> Abrir WhatsApp
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