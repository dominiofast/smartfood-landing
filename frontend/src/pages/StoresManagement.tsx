import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { 
  PlusIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  MagnifyingGlassIcon,
  BuildingStorefrontIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { storeService, Store } from '../services/storeService';
import { useAuth } from '../contexts/AuthContext';

// Schema de validação para o formulário de loja
const storeSchema = yup.object({
  name: yup.string().required('Nome da loja é obrigatório'),
  address: yup.string().required('Endereço da loja é obrigatório'),
  city: yup.string().required('Cidade é obrigatória'),
  state: yup.string().required('Estado é obrigatório'),
  zip_code: yup.string().required('CEP é obrigatório'),
  phone: yup.string().required('Telefone é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  logo_url: yup.string().url('URL inválida').nullable(),
  manager_name: yup.string().nullable(),
  manager_email: yup.string().email('Email inválido').nullable(),
  manager_phone: yup.string().nullable(),
  opening_hours: yup.string().nullable(),
  description: yup.string().nullable(),
  status: yup.string().oneOf(['active', 'inactive', 'pending'], 'Status inválido').required('Status é obrigatório'),
});

type StoreFormData = yup.InferType<typeof storeSchema>;

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

// Tipo para Store com todos os campos necessários
type StoreExtended = Store;

export default function StoresManagement() {
  const { user } = useAuth();
  const [stores, setStores] = useState<StoreExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStore, setCurrentStore] = useState<StoreExtended | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreExtended | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStores, setFilteredStores] = useState<StoreExtended[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedStore, setSelectedStore] = useState<StoreExtended | null>(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);
  const [currentTab, setCurrentTab] = useState<'info' | 'stats' | 'users'>('info');
  const [exportLoading, setExportLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<StoreFormData>({
    resolver: yupResolver(storeSchema),
    defaultValues: {
      status: 'active'
    }
  });

  // Carregar lojas ao iniciar
  useEffect(() => {
    loadStores();
  }, []);

  // Aplicar filtros e ordenação às lojas
  useEffect(() => {
    let filtered = [...stores];
    
    // Aplicar filtro de busca
    if (searchTerm.trim()) {
      filtered = filtered.filter(store => 
        store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (store.address && store.address.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.city && store.city.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (store.email && store.email.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    // Aplicar filtro de status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(store => store.status === statusFilter);
    }
    
    // Aplicar ordenação
    filtered.sort((a, b) => {
      let valueA, valueB;
      
      switch (sortBy) {
        case 'name':
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
          break;
        case 'city':
          valueA = (a.city || '').toLowerCase();
          valueB = (b.city || '').toLowerCase();
          break;
        case 'total_sales':
          valueA = a.total_sales || 0;
          valueB = b.total_sales || 0;
          break;
        case 'total_orders':
          valueA = a.total_orders || 0;
          valueB = b.total_orders || 0;
          break;
        case 'created_at':
          valueA = new Date(a.created_at || '').getTime();
          valueB = new Date(b.created_at || '').getTime();
          break;
        default:
          valueA = a.name.toLowerCase();
          valueB = b.name.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });
    
    setFilteredStores(filtered);
  }, [searchTerm, statusFilter, sortBy, sortOrder, stores]);

  // Função para carregar lojas
  const loadStores = async () => {
    try {
      setLoading(true);
      const data = await storeService.getStores();
      
      // Converter dados para o tipo StoreExtended com valores padrão
      const extendedData: StoreExtended[] = data.map(store => ({
        ...store,
        city: store.city || '',
        state: store.state || '',
        zip_code: store.zip_code || '',
        manager_name: store.manager_name || '',
        manager_email: store.manager_email || '',
        manager_phone: store.manager_phone || '',
        opening_hours: store.opening_hours || '',
        description: store.description || '',
        status: store.status || 'active',
        created_at: store.created_at || new Date().toISOString(),
        updated_at: store.updated_at || new Date().toISOString(),
        total_sales: store.total_sales || Math.floor(Math.random() * 100000), // Dados de exemplo
        total_orders: store.total_orders || Math.floor(Math.random() * 1000), // Dados de exemplo
        active_users: store.active_users || Math.floor(Math.random() * 50) // Dados de exemplo
      }));
      
      setStores(extendedData);
      setFilteredStores(extendedData);
    } catch (error) {
      console.error('Erro ao carregar lojas:', error);
      toast.error('Erro ao carregar lojas');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setCurrentStore(null);
    reset({
      name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      phone: '',
      email: '',
      logo_url: '',
      manager_name: '',
      manager_email: '',
      manager_phone: '',
      opening_hours: '',
      description: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  // Abrir modal para editar loja existente
  const openEditModal = (store: StoreExtended) => {
    setCurrentStore(store);
    setValue('name', store.name);
    setValue('address', store.address || '');
    setValue('city', store.city || '');
    setValue('state', store.state || '');
    setValue('zip_code', store.zip_code || '');
    setValue('phone', store.phone || '');
    setValue('email', store.email || '');
    setValue('logo_url', store.logo_url || '');
    setValue('manager_name', store.manager_name || '');
    setValue('manager_email', store.manager_email || '');
    setValue('manager_phone', store.manager_phone || '');
    setValue('opening_hours', store.opening_hours || '');
    setValue('description', store.description || '');
    setValue('status', store.status);
    setIsModalOpen(true);
  };

  // Abrir modal de detalhes da loja
  const openStoreDetails = (store: StoreExtended) => {
    setSelectedStore(store);
    setShowStoreDetails(true);
    setCurrentTab('info');
  };

  // Fechar modal de detalhes da loja
  const closeStoreDetails = () => {
    setSelectedStore(null);
    setShowStoreDetails(false);
  };

  // Abrir modal de confirmação de exclusão
  const openDeleteConfirmation = (store: StoreExtended) => {
    setStoreToDelete(store);
    setIsDeleting(true);
  };

  // Fechar modal de exclusão
  const closeDeleteConfirmation = () => {
    setStoreToDelete(null);
    setIsDeleting(false);
  };

  // Exportar dados das lojas para CSV
  const exportToCSV = () => {
    setExportLoading(true);
    
    try {
      // Preparar dados para exportação
      const csvData = filteredStores.map(store => ({
        'ID': store.id,
        'Nome': store.name,
        'Endereço': store.address || '',
        'Cidade': store.city || '',
        'Estado': store.state || '',
        'CEP': store.zip_code || '',
        'Telefone': store.phone || '',
        'Email': store.email || '',
        'Gerente': store.manager_name || '',
        'Status': store.status === 'active' ? 'Ativo' : store.status === 'inactive' ? 'Inativo' : 'Pendente',
        'Vendas Totais': `R$ ${(store.total_sales || 0).toLocaleString('pt-BR')}`,
        'Total de Pedidos': store.total_orders || 0,
        'Usuários Ativos': store.active_users || 0,
        'Criado em': store.created_at ? format(new Date(store.created_at), 'dd/MM/yyyy', { locale: ptBR }) : '',
      }));
      
      // Criar cabeçalho CSV
      const headers = Object.keys(csvData[0]);
      const csvContent = [
        headers.join(','),
        ...csvData.map(row => headers.map(header => `"${row[header as keyof typeof row]}"`).join(','))
      ].join('\n');
      
      // Criar blob e link para download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `lojas_${format(new Date(), 'dd-MM-yyyy')}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    } finally {
      setExportLoading(false);
    }
  };

  // Enviar formulário (criar ou atualizar loja)
  const onSubmit = async (data: StoreFormData) => {
    try {
      if (currentStore) {
        // Atualizar loja existente
        await storeService.updateStore(currentStore.id, data);
        toast.success('Loja atualizada com sucesso');
      } else {
        // Criar nova loja
        await storeService.createStore(data);
        toast.success('Loja criada com sucesso');
      }
      
      setIsModalOpen(false);
      loadStores(); // Recarregar lista de lojas
    } catch (error) {
      console.error('Erro ao salvar loja:', error);
      toast.error('Erro ao salvar loja');
    }
  };

  // Excluir loja
  const deleteStore = async () => {
    if (!storeToDelete) return;
    
    try {
      await storeService.deleteStore(storeToDelete.id);
      toast.success('Loja excluída com sucesso');
      closeDeleteConfirmation();
      loadStores(); // Recarregar lista de lojas
    } catch (error) {
      console.error('Erro ao excluir loja:', error);
      toast.error('Erro ao excluir loja');
    }
  };
  
  // Renderizar status da loja com cor apropriada
  const renderStatus = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Ativo
          </span>
        );
      case 'inactive':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Inativo
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pendente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Gerencie todas as lojas da plataforma SmartFood
        </p>
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
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{store.name}</h3>
                  {store.is_active ? (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      Ativo
                    </span>
                  ) : (
                    <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                      Inativo
                    </span>
                  )}
                </div>
                
                {store.logo_url && (
                  <div className="mb-4 h-32 flex items-center justify-center">
                    <img 
                      src={store.logo_url} 
                      alt={`Logo ${store.name}`} 
                      className="max-h-full max-w-full object-contain"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Logo+Indisponível';
                      }}
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-sm text-gray-600">
                  {store.address && (
                    <p>
                      <span className="font-medium">Endereço:</span> {store.address}
                    </p>
                  )}
                  {store.phone && (
                    <p>
                      <span className="font-medium">Telefone:</span> {store.phone}
                    </p>
                  )}
                  {store.email && (
                    <p>
                      <span className="font-medium">Email:</span> {store.email}
                    </p>
                  )}
                  <p>
                    <span className="font-medium">Criado em:</span>{' '}
                    {new Date(store.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {isSuperAdmin && (
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-2">
                  <button
                    onClick={() => openEditModal(store)}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="Editar"
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

      {/* Modal para criar/editar loja */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {currentStore ? 'Editar Loja' : 'Nova Loja'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
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
                    placeholder="Nome da loja"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço
                  </label>
                  <input
                    {...register('address')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Endereço completo"
                  />
                  {errors.address && (
                    <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone
                  </label>
                  <input
                    {...register('phone')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="(00) 00000-0000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    {...register('email')}
                    type="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="email@exemplo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="logo_url" className="block text-sm font-medium text-gray-700 mb-1">
                    URL do Logo
                  </label>
                  <input
                    {...register('logo_url')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="https://exemplo.com/logo.png"
                  />
                  {errors.logo_url && (
                    <p className="mt-1 text-sm text-red-600">{errors.logo_url.message}</p>
                  )}
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium flex items-center"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Salvando...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4 mr-2" />
                      Salvar
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de confirmação de exclusão */}
      {isDeleting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
                <TrashIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Confirmar Exclusão
              </h3>
              <p className="text-gray-500 text-center mb-6">
                Tem certeza que deseja excluir a loja <strong>{storeToDelete?.name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={deleteStore}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium"
                >
                  Sim, Excluir
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
