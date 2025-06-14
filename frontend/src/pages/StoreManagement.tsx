import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  ExclamationTriangleIcon,
  UserPlusIcon
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

// Schema para edição de loja
const editStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  address: yup.string(),
  city: yup.string(),
  state: yup.string(),
  zip_code: yup.string(),
  logo_url: yup.string().url('URL inválida').nullable(),
});

type EditStoreFormData = yup.InferType<typeof editStoreSchema>;

// Schema para criar manager
const createManagerSchema = yup.object({
  name: yup.string().required('Nome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(8, 'Senha deve ter no mínimo 8 caracteres').required('Senha é obrigatória'),
});

type CreateManagerFormData = yup.InferType<typeof createManagerSchema>;



export default function StoreManagement() {
  const { user } = useAuth();
  const [stores, setStores] = useState<SimpleStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreateManagerModalOpen, setIsCreateManagerModalOpen] = useState(false);
  const [selectedStore, setSelectedStore] = useState<SimpleStore | null>(null);
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

  // Form para editar loja
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<EditStoreFormData>({
    resolver: yupResolver(editStoreSchema),
  });

  // Form para criar manager
  const {
    register: registerManager,
    handleSubmit: handleSubmitManager,
    reset: resetManager,
    formState: { errors: errorsManager, isSubmitting: isSubmittingManager },
  } = useForm<CreateManagerFormData>({
    resolver: yupResolver(createManagerSchema),
  });

  // Carregar lojas ao iniciar
  useEffect(() => {
    loadStores();
  }, []);

  // Verificar se o usuário pode editar a loja
  const canEditStore = (store: SimpleStore): boolean => {
    if (user?.role === 'superadmin') return true;
    if (user?.role === 'manager' && user.store?.id === store.id) return true;
    return false;
  };

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

  // Abrir modal de edição
  const handleEdit = (store: SimpleStore) => {
    setSelectedStore(store);
    setValueEdit('name', store.name);
    setValueEdit('phone', store.phone || '');
    setValueEdit('email', store.email || '');
    setValueEdit('address', store.address || '');
    setValueEdit('city', store.city || '');
    setValueEdit('state', store.state || 'SP');
    setValueEdit('zip_code', store.zip_code || '');
    setValueEdit('logo_url', store.logo_url || '');
    setIsEditModalOpen(true);
  };

  // Atualizar loja
  const onSubmitEdit = async (data: EditStoreFormData) => {
    if (!selectedStore) return;
    
    try {
      console.log('Atualizando loja:', selectedStore.id, data);
      
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const endpoint = (isNetlifyDev || isProduction) 
        ? `/.netlify/functions/stores-crud/${selectedStore.id}` 
        : `/api/stores/${selectedStore.id}`;
      
      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...data,
          id: selectedStore.id
        })
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || result.message || 'Erro ao atualizar loja');
      }

      toast.success('Loja atualizada com sucesso!');
      setIsEditModalOpen(false);
      resetEdit();
      setSelectedStore(null);
      loadStores();
    } catch (error: any) {
      console.error('Erro ao atualizar loja:', error);
      toast.error(error.message || 'Erro ao atualizar loja');
    }
  };

  // Abrir modal para criar manager
  const handleCreateManager = (store: SimpleStore) => {
    setSelectedStore(store);
    setIsCreateManagerModalOpen(true);
  };

  // Criar manager
  const onSubmitManager = async (data: CreateManagerFormData) => {
    if (!selectedStore) return;
    
    try {
      console.log('Criando manager para loja:', selectedStore.id, data);
      
      const response = await fetch('http://localhost:8888/.netlify/functions/create-manager', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({
          ...data,
          store_id: selectedStore.id
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao criar dono da loja');
      }

      console.log('Manager criado:', result);
      
      // Fechar modal e limpar formulário
      setIsCreateManagerModalOpen(false);
      resetManager();
      setSelectedStore(null);
      
      // Mostrar mensagem de sucesso
      alert(`Dono da loja criado com sucesso!\n\nEmail: ${result.credentials.email}\nSenha: ${result.credentials.password}\n\nGuarde essas informações!`);
      
    } catch (error) {
      console.error('Erro ao criar manager:', error);
      alert(error instanceof Error ? error.message : 'Erro ao criar dono da loja');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';
  const canCreateStore = isSuperAdmin; // Apenas superadmin pode criar lojas

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
        {canCreateStore && (
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
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nome da Loja
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Telefone
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Criado em
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStores.map((store) => (
                <motion.tr
                  key={store.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{store.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{store.name}</div>
                    {(store.address_street || store.address) && (
                      <div className="text-sm text-gray-500">
                        {store.address_street || store.address}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.contact_phone || store.phone || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.contact_email || store.email || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      store.is_active !== false 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.is_active !== false ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {store.created_at 
                      ? new Date(store.created_at).toLocaleDateString('pt-BR')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {canEditStore(store) ? (
                      <>
                        <button
                          onClick={() => handleEdit(store)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                          title="Gerenciar loja"
                        >
                          Gerenciar
                        </button>
                        {isSuperAdmin && (
                          <>
                            <button
                              onClick={() => handleCreateManager(store)}
                              className="text-green-600 hover:text-green-900 mr-3"
                              title="Criar dono da loja"
                            >
                              <UserPlusIcon className="w-5 h-5 inline" />
                              Criar Dono
                            </button>
                            <button
                              className="text-red-600 hover:text-red-900"
                              title="Excluir loja"
                            >
                              Excluir
                            </button>
                          </>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
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

      {/* Modal para editar loja */}
      {isEditModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gerenciar Loja
              </h3>
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetEdit();
                  setSelectedStore(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(onSubmitEdit)} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Informações Básicas */}
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Informações Básicas</h4>
                </div>
                
                <div>
                  <label htmlFor="edit-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    {...registerEdit('name')}
                    id="edit-name"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.name && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="edit-phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    {...registerEdit('phone')}
                    id="edit-phone"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.phone && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.phone.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="edit-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...registerEdit('email')}
                    id="edit-email"
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.email && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.email.message}</p>
                  )}
                </div>
                
                {/* Endereço */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Endereço</h4>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="edit-address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    {...registerEdit('address')}
                    id="edit-address"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Rua, número, complemento"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-city" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    {...registerEdit('city')}
                    id="edit-city"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="edit-state" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    {...registerEdit('state')}
                    id="edit-state"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="AC">AC</option>
                    <option value="AL">AL</option>
                    <option value="AP">AP</option>
                    <option value="AM">AM</option>
                    <option value="BA">BA</option>
                    <option value="CE">CE</option>
                    <option value="DF">DF</option>
                    <option value="ES">ES</option>
                    <option value="GO">GO</option>
                    <option value="MA">MA</option>
                    <option value="MT">MT</option>
                    <option value="MS">MS</option>
                    <option value="MG">MG</option>
                    <option value="PA">PA</option>
                    <option value="PB">PB</option>
                    <option value="PR">PR</option>
                    <option value="PE">PE</option>
                    <option value="PI">PI</option>
                    <option value="RJ">RJ</option>
                    <option value="RN">RN</option>
                    <option value="RS">RS</option>
                    <option value="RO">RO</option>
                    <option value="RR">RR</option>
                    <option value="SC">SC</option>
                    <option value="SP">SP</option>
                    <option value="SE">SE</option>
                    <option value="TO">TO</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="edit-zip" className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    {...registerEdit('zip_code')}
                    id="edit-zip"
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                  />
                </div>
                
                {/* Logo */}
                <div className="md:col-span-2 mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Imagens</h4>
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="edit-logo" className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Logo
                  </label>
                  <input
                    {...registerEdit('logo_url')}
                    id="edit-logo"
                    type="url"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {errorsEdit.logo_url && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.logo_url.message}</p>
                  )}
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    resetEdit();
                    setSelectedStore(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmittingEdit ? 'Salvando...' : 'Salvar Alterações'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal para criar manager */}
      {isCreateManagerModalOpen && selectedStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Criar Dono da Loja
              </h3>
              <button
                onClick={() => {
                  setIsCreateManagerModalOpen(false);
                  resetManager();
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitManager(onSubmitManager)} className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  Criando dono para: <strong>{selectedStore.name}</strong>
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nome Completo
                  </label>
                  <input
                    type="text"
                    {...registerManager('name')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ex: João Silva"
                  />
                  {errorsManager.name && (
                    <p className="mt-1 text-sm text-red-600">{errorsManager.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email (será usado para login)
                  </label>
                  <input
                    type="email"
                    {...registerManager('email')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ex: joao@suaempresa.com"
                  />
                  {errorsManager.email && (
                    <p className="mt-1 text-sm text-red-600">{errorsManager.email.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Senha
                  </label>
                  <input
                    type="password"
                    {...registerManager('password')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Mínimo 8 caracteres"
                  />
                  {errorsManager.password && (
                    <p className="mt-1 text-sm text-red-600">{errorsManager.password.message}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateManagerModalOpen(false);
                    resetManager();
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingManager}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmittingManager ? 'Criando...' : 'Criar Dono'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}