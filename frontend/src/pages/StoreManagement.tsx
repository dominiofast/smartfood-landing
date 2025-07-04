import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm, FormProvider } from 'react-hook-form';
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
import WhatsappApiSettings from '../components/WhatsappApiSettings';
import EditStoreForm from '../components/EditStoreForm';
import { Store, SimpleStore, EditStoreFormData } from '../types/store';

// Schema para edição de loja
const editStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  description: yup.string(),
  contact: yup.object({
    phone: yup.string().required('Telefone é obrigatório'),
    email: yup.string().email('Email inválido').required('Email é obrigatório'),
    whatsapp: yup.string()
  }).required(),
  address: yup.object({
    street: yup.string().required('Endereço é obrigatório'),
    number: yup.string(),
    complement: yup.string(),
    neighborhood: yup.string().required('Bairro é obrigatório'),
    city: yup.string().required('Cidade é obrigatória'),
    state: yup.string().required('Estado é obrigatório'),
    zipCode: yup.string().required('CEP é obrigatório')
  }).required(),
  whatsappApi: yup.object({
    controlId: yup.string(),
    host: yup.string(),
    instanceKey: yup.string(),
    token: yup.string(),
    webhook: yup.string()
  }).required().default({})
});

// Schema para criação de loja
const createStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

type CreateStoreFormData = yup.InferType<typeof createStoreSchema>;

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
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    setValue: setValueEdit,
    formState: { isSubmitting: isSubmittingEdit },
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
    if (!user) {
      return false;
    }
    // Superadmin e Manager sempre podem ver o botão de gerenciar.
    if (user.role === 'superadmin' || user.role === 'manager') {
      return true;
    }
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
    
    console.log('Lojas filtradas:', {
      searchTerm,
      totalStores: stores.length,
      filteredCount: filtered.length,
      filtered
    });
    
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  // Função para carregar lojas
  const loadStores = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const endpoint = (isNetlifyDev || isProduction) ? '/.netlify/functions/stores-crud' : '/api/stores';
      
      console.log('Carregando lojas do endpoint:', endpoint, {
        isNetlifyDev,
        isProduction,
        port: window.location.port,
        hostname: window.location.hostname
      });
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        }
      });

      if (!response.ok) {
        console.error('Erro na resposta HTTP:', {
          status: response.status,
          statusText: response.statusText
        });
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      console.log('Dados recebidos das lojas:', {
        success: data.success,
        storesCount: data.stores?.length,
        stores: data.stores
      });
      
      if (data.success && Array.isArray(data.stores)) {
        // Garantir que os dados da WhatsApp API sejam mantidos
        const processedStores = data.stores.map((store: SimpleStore) => {
          // Preservar os dados existentes do WhatsApp API
          const existingStore = stores.find(s => s.id === store.id);
          const whatsappApi = store.whatsappApi || existingStore?.whatsappApi || {
            controlId: undefined,
            host: undefined,
            instanceKey: undefined,
            token: undefined,
            webhook: undefined
          };

          return {
            ...store,
            whatsappApi
          };
        });

        console.log('Lojas processadas e carregadas:', {
          totalStores: processedStores.length,
          firstStore: processedStores[0],
          whatsappApiData: processedStores.map((store: SimpleStore) => ({
            id: store.id,
            whatsappApi: store.whatsappApi
          }))
        });

        setStores(processedStores);
        setFilteredStores(processedStores);
      } else {
        console.log('Nenhuma loja encontrada ou formato inválido:', data);
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
    // Extrair dados do endereço do formato string, se necessário
    let addressData = {
      street: '', number: '', complement: '', neighborhood: '',
      city: '', state: '', zipCode: ''
    };

    try {
      if (store.address && typeof store.address === 'string' && store.address.startsWith('{')) {
        const parsedAddress = JSON.parse(store.address);
        addressData = { ...addressData, ...parsedAddress };
      } else {
        addressData = {
          street: store.address_street || store.address || '',
          number: store.address_number || '',
          complement: store.address_complement || '',
          neighborhood: store.address_neighborhood || '',
          city: store.address_city || store.city || '',
          state: store.address_state || store.state || '',
          zipCode: store.address_zip_code || store.zip_code || ''
        };
      }
    } catch (e) {
      console.error("Erro ao processar endereço:", e);
    }
    
    setSelectedStore(store);
    
    setValueEdit('name', store.name);
    setValueEdit('description', store.description || '');
    setValueEdit('contact.phone', store.contact_phone || store.phone || '');
    setValueEdit('contact.email', store.contact_email || store.email || '');
    setValueEdit('contact.whatsapp', store.contact?.whatsapp || '');
    setValueEdit('address', addressData);
    setValueEdit('whatsappApi', store.whatsappApi || {});

    setIsEditModalOpen(true);
  };

  // Atualizar loja
  const onSubmitEdit = async (data: EditStoreFormData) => {
    if (!selectedStore) {
      toast.error('Nenhuma loja selecionada para edição.');
      return;
    }

    const toastId = toast.loading('Atualizando loja...');
    
    try {
      const endpoint = window.location.hostname.includes('localhost')
        ? `/api/stores/${selectedStore.id}`
        : `/.netlify/functions/stores-crud/${selectedStore.id}`;

      // O objeto 'data' do react-hook-form já tem a estrutura aninhada correta
      // que o schema do Mongoose no backend espera.
      // Apenas garantimos que campos vazios do whatsappApi sejam undefined.
      const updateData = {
        ...data,
        whatsappApi: {
          controlId: data.whatsappApi?.controlId?.trim() || undefined,
          host: data.whatsappApi?.host?.trim() || undefined,
          instanceKey: data.whatsappApi?.instanceKey?.trim() || undefined,
          token: data.whatsappApi?.token?.trim() || undefined,
          webhook: data.whatsappApi?.webhook?.trim() || undefined
        }
      };
      
      console.log('Enviando dados para atualização:', { endpoint, body: updateData });

      const response = await fetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(updateData)
      });
      
      const result = await response.json();

      if (!response.ok) {
        console.error('Erro ao atualizar loja:', { status: response.status, result });
        throw new Error(result.error || result.message || 'Erro ao atualizar loja');
      }

      toast.success('Loja atualizada com sucesso!', { id: toastId });
      setIsEditModalOpen(false);
      await loadStores(); // Recarregar lojas para ver a atualização

    } catch (error: any) {
      console.error('Falha na submissão da edição:', error);
      toast.error(error.message || 'Falha ao atualizar a loja', { id: toastId });
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
                    {(() => {
                      try {
                        // Tentar parsear o endereço se estiver em formato JSON
                        if (store.address && typeof store.address === 'string' && store.address.startsWith('{')) {
                          const addressData = JSON.parse(store.address);
                          return (
                            <div className="text-sm text-gray-500">
                              {`${addressData.street}${addressData.number ? `, ${addressData.number}` : ''}`}
                              {addressData.neighborhood ? ` - ${addressData.neighborhood}` : ''}
                              {addressData.city ? `, ${addressData.city}` : ''}
                              {addressData.state ? `-${addressData.state}` : ''}
                            </div>
                          );
                        }
                        
                        // Se não for JSON, usar os campos individuais
                        if (store.address_street || store.address) {
                          return (
                            <div className="text-sm text-gray-500">
                              {store.address_street || store.address}
                              {store.address_city ? `, ${store.address_city}` : ''}
                              {store.address_state ? `-${store.address_state}` : ''}
                            </div>
                          );
                        }
                      } catch (error) {
                        console.error('Erro ao processar endereço:', error);
                        // Em caso de erro, mostrar o endereço como está
                        return store.address && (
                          <div className="text-sm text-gray-500">
                            {store.address}
                          </div>
                        );
                      }
                    })()}
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
                    {(() => {
                      const canEdit = canEditStore(store);
                      // Log para depuração final
                      console.log('Dados para renderizar Ações:', {
                        storeId: store.id,
                        storeName: store.name,
                        userFromAuth: user,
                        userRole: user?.role,
                        canEditResult: canEdit,
                        isSuperAdmin: user?.role === 'superadmin'
                      });

                      if (!canEdit) {
                        return <span className="text-gray-400">-</span>;
                      }

                      return (
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
                      );
                    })()}
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
        <EditStoreForm
          store={selectedStore}
          onSubmit={onSubmitEdit}
          onCancel={() => {
            setIsEditModalOpen(false);
            resetEdit();
            setSelectedStore(null);
          }}
          isSubmitting={isSubmittingEdit}
        />
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