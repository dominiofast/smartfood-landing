import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

// Interface simplificada para Store
interface SimpleStore {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
  created_at?: string;
  
  // Campos do banco de dados
  contact_phone?: string;
  contact_email?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  images_logo?: string;
}

// Schema para criação de loja
const createStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

type CreateStoreFormData = yup.InferType<typeof createStoreSchema>;



export default function StoreManagement() {
  const { user } = useAuth();
  const [stores, setStores] = useState<SimpleStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState<SimpleStore[]>([]);

  // Form para criar loja
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateStoreFormData>({
    resolver: yupResolver(createStoreSchema),
  });

  // Carregar lojas ao iniciar
  useEffect(() => {
    loadStores();
  }, []);

  // Aplicar filtros de busca
  useEffect(() => {
    let filtered = [...stores];
    
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(term) ||
        (store.phone && store.phone.toLowerCase().includes(term)) ||
        (store.contact_phone && store.contact_phone.toLowerCase().includes(term)) ||
        (store.email && store.email.toLowerCase().includes(term)) ||
        (store.contact_email && store.contact_email.toLowerCase().includes(term)) ||
        (store.address && store.address.toLowerCase().includes(term)) ||
        (store.address_street && store.address_street.toLowerCase().includes(term))
      );
    }
    
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  // Função para carregar lojas
  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Determinar endpoint baseado no ambiente
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const endpoint = (isNetlifyDev || isProduction) ? '/.netlify/functions/stores-crud' : '/api/stores';
      
      console.log('Carregando lojas do endpoint:', endpoint);
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos:', data);
      
      if (data.success && Array.isArray(data.stores)) {
        setStores(data.stores);
        setFilteredStores(data.stores);
      } else {
        // Se não há lojas, inicializar com array vazio
        setStores([]);
        setFilteredStores([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar lojas:', error);
      setError(error.message || 'Erro ao carregar lojas');
      setStores([]);
      setFilteredStores([]);
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  // Criar nova loja
  const onSubmit = async (data: CreateStoreFormData) => {
    try {
      console.log('Criando loja com dados:', data);
      
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const endpoint = (isNetlifyDev || isProduction) ? '/.netlify/functions/stores-crud' : '/api/stores';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          name: data.name,
          phone: data.phone,
          email: data.email,
          address: '',
          city: '',
          state: 'SP',
          zip_code: '00000-000',
          logo_url: null
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro ao criar loja');
      }

      toast.success('Loja criada com sucesso! Agora você pode editar para adicionar mais informações.');
      setIsCreateModalOpen(false);
      reset();
      loadStores();
    } catch (error: any) {
      console.error('Erro ao criar loja:', error);
      toast.error(error.message || 'Erro ao criar loja');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

  // Se houver erro, mostrar mensagem de erro
  if (error && !loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <ExclamationTriangleIcon className="w-16 h-16 mx-auto text-red-400 mb-4" />
          <h3 className="text-lg font-medium text-red-900 mb-2">Erro ao carregar dados</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadStores}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Lojas</h1>
          <p className="text-sm text-slate-500 mt-1">
            Gerencie todas as lojas da plataforma SmartFood
          </p>
        </div>
        {isSuperAdmin && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nova Loja
          </motion.button>
        )}
      </div>

      {/* Barra de pesquisa */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-primary-500 focus:border-primary-500"
            placeholder="Buscar lojas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Lista de lojas */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      ) : filteredStores.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <BuildingStorefrontIcon className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma loja encontrada</h3>
          <p className="text-gray-500">
            {stores.length === 0 
              ? 'Não há lojas cadastradas. Clique em "Nova Loja" para adicionar.' 
              : 'Nenhuma loja corresponde aos critérios de busca.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStores.map((store) => (
            <motion.div
              key={store.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">{store.name}</h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    {store.is_active !== false ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm text-gray-600">
                  {(store.contact_phone || store.phone) && (
                    <p>
                      <span className="font-medium">Telefone:</span> {store.contact_phone || store.phone}
                    </p>
                  )}
                  {(store.contact_email || store.email) && (
                    <p>
                      <span className="font-medium">Email:</span> {store.contact_email || store.email}
                    </p>
                  )}
                  {(store.address_street || store.address) && (
                    <p>
                      <span className="font-medium">Endereço:</span> {store.address_street || store.address}
                    </p>
                  )}
                  {store.created_at && (
                    <p>
                      <span className="font-medium">Criado em:</span>{' '}
                      {new Date(store.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
              </div>
              
              {isSuperAdmin && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar loja"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Excluir loja"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para criar loja */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Criar Nova Loja
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Restaurante do João"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    {...register('phone')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(11) 99999-9999"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contato@restaurante.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                <p><strong>Dica:</strong> Você pode adicionar mais informações (endereço, logo, etc.) editando a loja após a criação.</p>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmitting ? 'Criando...' : 'Criar Loja'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}