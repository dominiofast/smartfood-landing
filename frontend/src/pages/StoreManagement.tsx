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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { storeService, Store } from '../services/storeService';
import { useAuth } from '../contexts/AuthContext';

// Schema simplificado para criação de loja
const createStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
});

// Schema completo para edição
const editStoreSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  address: yup.string().optional(),
  city: yup.string().optional(),
  state: yup.string().optional(),
  zip_code: yup.string().optional(),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  logo_url: yup.string().url('URL inválida').optional().nullable(),
});

type CreateStoreFormData = yup.InferType<typeof createStoreSchema>;
type EditStoreFormData = yup.InferType<typeof editStoreSchema>;

// Constantes para estados brasileiros
const ESTADOS_BRASILEIROS = [
  { sigla: 'AC', nome: 'Acre' },
  { sigla: 'AL', nome: 'Alagoas' },
  { sigla: 'AP', nome: 'Amapá' },
  { sigla: 'AM', nome: 'Amazonas' },
  { sigla: 'BA', nome: 'Bahia' },
  { sigla: 'CE', nome: 'Ceará' },
  { sigla: 'DF', nome: 'Distrito Federal' },
  { sigla: 'ES', nome: 'Espírito Santo' },
  { sigla: 'GO', nome: 'Goiás' },
  { sigla: 'MA', nome: 'Maranhão' },
  { sigla: 'MT', nome: 'Mato Grosso' },
  { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'Minas Gerais' },
  { sigla: 'PA', nome: 'Pará' },
  { sigla: 'PB', nome: 'Paraíba' },
  { sigla: 'PR', nome: 'Paraná' },
  { sigla: 'PE', nome: 'Pernambuco' },
  { sigla: 'PI', nome: 'Piauí' },
  { sigla: 'RJ', nome: 'Rio de Janeiro' },
  { sigla: 'RN', nome: 'Rio Grande do Norte' },
  { sigla: 'RS', nome: 'Rio Grande do Sul' },
  { sigla: 'RO', nome: 'Rondônia' },
  { sigla: 'RR', nome: 'Roraima' },
  { sigla: 'SC', nome: 'Santa Catarina' },
  { sigla: 'SP', nome: 'São Paulo' },
  { sigla: 'SE', nome: 'Sergipe' },
  { sigla: 'TO', nome: 'Tocantins' }
];

export default function StoreManagement() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<Store | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState<Store[]>([]);

  // Form para criar loja (campos básicos)
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    reset: resetCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
  } = useForm<CreateStoreFormData>({
    resolver: yupResolver(createStoreSchema),
  });

  // Form para editar loja (campos completos)
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
    formState: { errors: errorsEdit, isSubmitting: isSubmittingEdit },
  } = useForm<EditStoreFormData>({
    resolver: yupResolver(editStoreSchema),
  });

  // Carregar lojas ao iniciar
  useEffect(() => {
    loadStores();
  }, []);

  // Aplicar filtros de busca
  useEffect(() => {
    let filtered = [...stores];
    
    if (searchTerm.trim()) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.address_street && store.address_street.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.contact_email && store.contact_email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.email && store.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    setFilteredStores(filtered);
  }, [searchTerm, stores]);

  // Função para carregar lojas
  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStores();
      setStores(data);
      setFilteredStores(data);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para criar nova loja
  const openCreateModal = () => {
    resetCreate({
      name: '',
      phone: '',
      email: '',
    });
    setIsCreateModalOpen(true);
  };

  // Abrir modal para editar loja
  const openEditModal = (store: Store) => {
    setCurrentStore(store);
    resetEdit({
      name: store.name,
      address: store.address_street || store.address || '',
      city: store.address_city || store.city || '',
      state: store.address_state || store.state || '',
      zip_code: store.address_zip_code || store.zip_code || '',
      phone: store.contact_phone || store.phone || '',
      email: store.contact_email || store.email || '',
      logo_url: store.images_logo || store.logo_url || '',
    });
    setIsEditModalOpen(true);
  };

  // Abrir confirmação de exclusão
  const openDeleteConfirmation = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleting(true);
  };

  // Fechar confirmação de exclusão
  const closeDeleteConfirmation = () => {
    setStoreToDelete(null);
    setIsDeleting(false);
  };

  // Criar nova loja (apenas dados básicos)
  const onCreateSubmit = async (data: CreateStoreFormData) => {
    try {
      console.log('Criando loja com dados:', data);
      await storeService.createStore(data);
      toast.success('Loja criada com sucesso! Agora você pode editar para adicionar mais informações.');
      setIsCreateModalOpen(false);
      loadStores();
    } catch (error: any) {
      console.error('Erro ao criar loja:', error);
      toast.error(error.message || 'Erro ao criar loja');
    }
  };

  // Atualizar loja existente
  const onEditSubmit = async (data: EditStoreFormData) => {
    if (!currentStore) return;
    
    try {
      await storeService.updateStore(currentStore.id, data);
      toast.success('Loja atualizada com sucesso');
      setIsEditModalOpen(false);
      loadStores();
    } catch (error: any) {
      console.error('Erro ao atualizar loja:', error);
      toast.error(error.message || 'Erro ao atualizar loja');
    }
  };

  // Excluir loja
  const deleteStore = async () => {
    if (!storeToDelete) return;
    
    try {
      await storeService.deleteStore(storeToDelete.id);
      toast.success('Loja excluída com sucesso');
      closeDeleteConfirmation();
      loadStores();
    } catch (error: any) {
      console.error('Erro ao excluir loja:', error);
      toast.error(error.message || 'Erro ao excluir loja');
    }
  };

  const isSuperAdmin = user?.role === 'superadmin';

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
            onClick={openCreateModal}
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
                    Ativo
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
                    onClick={() => openEditModal(store)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar e adicionar mais informações"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => openDeleteConfirmation(store)}
                    className="text-red-600 hover:text-red-800 p-1"
                    title="Excluir"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal para criar loja (dados básicos) */}
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
            
            <form onSubmit={handleSubmitCreate(onCreateSubmit)} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    {...registerCreate('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ex: Restaurante do João"
                  />
                  {errorsCreate.name && (
                    <p className="mt-1 text-sm text-red-600">{errorsCreate.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    {...registerCreate('phone')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(11) 99999-9999"
                  />
                  {errorsCreate.phone && (
                    <p className="mt-1 text-sm text-red-600">{errorsCreate.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...registerCreate('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="contato@restaurante.com"
                  />
                  {errorsCreate.email && (
                    <p className="mt-1 text-sm text-red-600">{errorsCreate.email.message}</p>
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
                  disabled={isSubmittingCreate}
                  className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                >
                  {isSubmittingCreate ? 'Criando...' : 'Criar Loja'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal para editar loja (dados completos) */}
      {isEditModalOpen && currentStore && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                Editar Loja: {currentStore.name}
              </h3>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmitEdit(onEditSubmit)} className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nome da Loja *
                  </label>
                  <input
                    {...registerEdit('name')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.name && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <input
                    {...registerEdit('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.email && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.email.message}</p>
                  )}
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    {...registerEdit('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Rua, número, complemento"
                  />
                  {errorsEdit.address && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade
                  </label>
                  <input
                    {...registerEdit('city')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.city && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.city.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    Estado
                  </label>
                  <select
                    {...registerEdit('state')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Selecione o estado</option>
                    {ESTADOS_BRASILEIROS.map(estado => (
                      <option key={estado.sigla} value={estado.sigla}>
                        {estado.nome}
                      </option>
                    ))}
                  </select>
                  {errorsEdit.state && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.state.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    {...registerEdit('zip_code')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="00000-000"
                  />
                  {errorsEdit.zip_code && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.zip_code.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    {...registerEdit('phone')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  />
                  {errorsEdit.phone && (
                    <p className="mt-1 text-sm text-red-600">{errorsEdit.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Logo
                  </label>
                  <input
                    {...registerEdit('logo_url')}
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
                  onClick={() => setIsEditModalOpen(false)}
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

      {/* Modal de confirmação de exclusão */}
      {isDeleting && storeToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
          >
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-600 mb-6">
                Tem certeza que deseja excluir a loja "{storeToDelete.name}"? 
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteStore}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}