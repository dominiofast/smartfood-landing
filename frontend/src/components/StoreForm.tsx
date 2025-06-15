import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Store, WhatsappApi } from '../types';

interface StoreFormProps {
  formData: Store;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading?: boolean;
}

const StoreForm: React.FC<StoreFormProps> = ({
  formData,
  handleChange,
  handleSubmit,
  isLoading = false
}) => {
  const { user } = useAuth();

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Basic Info */}
      <div className="col-span-2 bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Loja
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: Restaurante do João"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <input
              type="text"
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: O melhor restaurante da cidade"
            />
          </div>
        </div>
      </div>

      {/* Address */}
      <div className="col-span-2 bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Endereço</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rua
            </label>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: Rua das Flores"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Número
            </label>
            <input
              type="text"
              name="address.number"
              value={formData.address.number || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: 123"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Complemento
            </label>
            <input
              type="text"
              name="address.complement"
              value={formData.address.complement || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: Sala 101"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bairro
            </label>
            <input
              type="text"
              name="address.neighborhood"
              value={formData.address.neighborhood}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: Centro"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cidade
            </label>
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: São Paulo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Estado
            </label>
            <input
              type="text"
              name="address.state"
              value={formData.address.state}
              onChange={handleChange}
              required
              maxLength={2}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none uppercase"
              placeholder="Ex: SP"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              CEP
            </label>
            <input
              type="text"
              name="address.zipCode"
              value={formData.address.zipCode}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: 12345-678"
            />
          </div>
        </div>
      </div>

      {/* Contact Info */}
      <div className="col-span-2 bg-white p-6 rounded-lg shadow border">
        <h3 className="text-lg font-semibold mb-4">Contato</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Telefone
            </label>
            <input
              type="text"
              name="contact.phone"
              value={formData.contact.phone}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              WhatsApp
            </label>
            <input
              type="text"
              name="contact.whatsapp"
              value={formData.contact.whatsapp || ''}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: (11) 99999-9999"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              name="contact.email"
              value={formData.contact.email}
              onChange={handleChange}
              required
              className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-300 outline-none"
              placeholder="Ex: contato@restaurante.com"
            />
          </div>
        </div>
      </div>

      {/* WhatsApp API Settings */}
      {user?.role === 'superadmin' && (
        <div className="col-span-2 bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4 text-green-600 flex items-center gap-2">
            <svg
              viewBox="0 0 448 512"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
            </svg>
            Configurações da API do WhatsApp
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID de Controle
              </label>
              <input
                type="text"
                name="whatsappApi.controlId"
                value={formData.whatsappApi?.controlId || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none"
                placeholder="Ex: e570acd2-2d6a-41b0-8fee-7253c9caa91c"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Host
              </label>
              <input
                type="text"
                name="whatsappApi.host"
                value={formData.whatsappApi?.host || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none"
                placeholder="Ex: apinocode01.megaapi.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instance Key
              </label>
              <input
                type="text"
                name="whatsappApi.instanceKey"
                value={formData.whatsappApi?.instanceKey || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none"
                placeholder="Ex: megacode-MDT3OHEGIyu"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Token
              </label>
              <input
                type="text"
                name="whatsappApi.token"
                value={formData.whatsappApi?.token || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none"
                placeholder="Ex: MDT3OHEGIyu"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Webhook URL
              </label>
              <input
                type="text"
                name="whatsappApi.webhook"
                value={formData.whatsappApi?.webhook || ''}
                onChange={handleChange}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-300 outline-none"
                placeholder="Ex: https://dominio-menu-002.replit.app/api/webhook/whatsapp/3"
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="col-span-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Salvando...' : 'Salvar'}
        </button>
      </div>
    </form>
  );
};

export default StoreForm; 