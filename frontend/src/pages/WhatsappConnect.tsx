import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Message {
  _id: string;
  type: string;
  content: string;
  from: string;
  to: string;
  timestamp: string;
  direction: 'inbound' | 'outbound';
  status: string;
}

export default function WhatsappConnect() {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('Olá, gostaria de falar com a loja!');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedPhone, setSelectedPhone] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  const whatsappLink = phone
    ? `https://wa.me/${phone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    : '';

  // Carregar mensagens
  const loadMessages = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/messages/${user?.store?.id}`, {
        params: {
          page,
          phone: selectedPhone
        }
      });

      setMessages(response.data.data.messages);
      setTotalPages(response.data.data.totalPages);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  useEffect(() => {
    if (user?.store?.id) {
      loadMessages();
    }
  }, [user?.store?.id, page, selectedPhone]);

  // Função para conectar o WhatsApp
  const connectWhatsapp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('/api/whatsapp/connect', {
        storeId: user?.store?.id
      });
      
      if (response.data.qrCode) {
        setQrCode(response.data.qrCode);
        // Iniciar polling para verificar status da conexão
        checkConnectionStatus();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao conectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Função para desconectar o WhatsApp
  const disconnectWhatsapp = async () => {
    try {
      setLoading(true);
      await axios.post('/api/whatsapp/disconnect', {
        storeId: user?.store?.id
      });
      setQrCode(null);
      toast.success('WhatsApp desconectado com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao desconectar WhatsApp');
    } finally {
      setLoading(false);
    }
  };

  // Função para verificar status da conexão
  const checkConnectionStatus = async () => {
    try {
      const response = await axios.get(`/api/whatsapp/status/${user?.store?.id}`);
      if (response.data.connected) {
        setQrCode(null);
        toast.success('WhatsApp conectado com sucesso!');
      } else {
        // Continuar verificando a cada 5 segundos
        setTimeout(checkConnectionStatus, 5000);
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  // Função para enviar mensagem
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhone || !newMessage) return;

    try {
      setSendingMessage(true);
      await axios.post(`/api/whatsapp/messages/${user?.store?.id}`, {
        phone: selectedPhone,
        message: newMessage
      });

      setNewMessage('');
      loadMessages(); // Recarregar mensagens
      toast.success('Mensagem enviada com sucesso!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao enviar mensagem');
    } finally {
      setSendingMessage(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
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

      {/* Integração Simples */}
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

      {/* Integração Avançada */}
      <div className="bg-white rounded-xl shadow p-6 border">
        <h2 className="text-xl font-semibold mb-2 text-green-600">Integração Avançada (Bot WhatsApp)</h2>
        <p className="text-gray-700 mb-4">
          Conecte seu WhatsApp para habilitar recursos avançados como respostas automáticas, automação de mensagens e integração com sistemas.
        </p>

        {user?.store?.whatsappApi?.isConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">WhatsApp Conectado</span>
            </div>
            <button
              onClick={disconnectWhatsapp}
              disabled={loading}
              className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Desconectando...' : 'Desconectar WhatsApp'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {qrCode ? (
              <div className="flex flex-col items-center gap-4">
                <img
                  src={qrCode}
                  alt="QR Code para conexão do WhatsApp"
                  className="w-64 h-64"
                />
                <p className="text-sm text-gray-600">
                  Escaneie o QR Code com seu WhatsApp para conectar
                </p>
              </div>
            ) : (
              <button
                onClick={connectWhatsapp}
                disabled={loading || !user?.store?.whatsappApi?.instanceKey}
                className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? 'Conectando...' : 'Conectar WhatsApp'}
              </button>
            )}
            
            {!user?.store?.whatsappApi?.instanceKey && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <b>Configuração necessária:</b> Solicite ao administrador para configurar as credenciais da API do WhatsApp nas configurações da loja.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Lista de Mensagens */}
        {user?.store?.whatsappApi?.isConnected && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Mensagens</h3>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={selectedPhone}
                  onChange={e => setSelectedPhone(e.target.value)}
                  placeholder="Filtrar por número"
                  className="border rounded-lg px-3 py-1 text-sm"
                />
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <div className="max-h-96 overflow-y-auto">
                {messages.map(msg => (
                  <div
                    key={msg._id}
                    className={`p-3 border-b ${
                      msg.direction === 'inbound' ? 'bg-gray-50' : 'bg-green-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium">
                          {msg.direction === 'inbound' ? msg.from : msg.to}
                        </p>
                        <p className="text-gray-600">{msg.content}</p>
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(msg.timestamp).toLocaleString()}
                      </div>
                    </div>
                    {msg.direction === 'outbound' && (
                      <div className="mt-1 text-xs text-gray-500">
                        Status: {msg.status}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Paginação */}
              <div className="flex items-center justify-between p-3 border-t bg-gray-50">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {totalPages}
                </span>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  Próxima
                </button>
              </div>
            </div>

            {/* Formulário de Envio */}
            <form onSubmit={handleSendMessage} className="mt-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={selectedPhone}
                  onChange={e => setSelectedPhone(e.target.value)}
                  placeholder="Número do WhatsApp"
                  required
                  className="flex-1 border rounded-lg px-3 py-2"
                />
                <input
                  type="text"
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  placeholder="Digite sua mensagem"
                  required
                  className="flex-2 border rounded-lg px-3 py-2"
                />
                <button
                  type="submit"
                  disabled={sendingMessage}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                >
                  {sendingMessage ? 'Enviando...' : 'Enviar'}
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="mt-6 space-y-2">
          <h3 className="font-medium text-gray-900">Recursos disponíveis:</h3>
          <ul className="list-disc ml-6 text-gray-600 space-y-1">
            <li>Respostas automáticas e chatbot</li>
            <li>Automação de mensagens e disparos</li>
            <li>Integração com sistemas</li>
            <li>Múltiplos atendentes</li>
            <li>Relatórios e métricas</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 