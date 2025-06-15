import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  XMarkIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  birthDate?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
  isActive: boolean;
}

export default function Customers() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  // Função para salvar clientes no localStorage
  const saveCustomersData = useCallback((data: Customer[]) => {
    if (!user?.store?.id) return;
    
    const storageKey = `storeCustomers_${user.store.id}`;
    const customersData = {
      customers: data,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(storageKey, JSON.stringify(customersData));
  }, [user]);

  // Carregar clientes ao iniciar
  useEffect(() => {
    const loadMockData = () => {
      const mockCustomers: Customer[] = [
        {
          id: 1,
          name: 'João Silva',
          email: 'joao.silva@email.com',
          phone: '(11) 98765-4321',
          cpf: '123.456.789-00',
          birthDate: '1990-05-15',
          address: {
            street: 'Rua das Flores',
            number: '123',
            complement: 'Apto 45',
            neighborhood: 'Jardim Primavera',
            city: 'São Paulo',
            state: 'SP',
            zipCode: '01234-567'
          },
          notes: 'Cliente preferencial, gosta de pizza margherita',
          totalOrders: 15,
          totalSpent: 450.50,
          lastOrderDate: '2024-01-10',
          createdAt: '2023-06-15',
          isActive: true
        },
        {
          id: 2,
          name: 'Maria Santos',
          email: 'maria.santos@email.com',
          phone: '(11) 91234-5678',
          totalOrders: 8,
          totalSpent: 280.00,
          lastOrderDate: '2024-01-08',
          createdAt: '2023-08-20',
          isActive: true
        }
      ];
      
      setCustomers(mockCustomers);
      setFilteredCustomers(mockCustomers);
      saveCustomersData(mockCustomers);
    };

    if (!user?.store?.id) {
      setLoading(false);
      return;
    }
    
    const storageKey = `storeCustomers_${user.store.id}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const customersData = JSON.parse(savedData);
        setCustomers(customersData.customers || []);
        setFilteredCustomers(customersData.customers || []);
      } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        // Carregar dados mockados
        loadMockData();
      }
    } else {
      // Se não houver dados salvos, carrega dados mockados
      loadMockData();
    }
    
    setLoading(false);
  }, [user, saveCustomersData]);

  // Filtrar clientes
  useEffect(() => {
    const filtered = customers.filter(customer => {
      const searchLower = searchTerm.toLowerCase();
      return (
        customer.name.toLowerCase().includes(searchLower) ||
        customer.email.toLowerCase().includes(searchLower) ||
        customer.phone.includes(searchTerm) ||
        (customer.cpf && customer.cpf.includes(searchTerm))
      );
    });
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar telefone
  const formatPhone = (phone: string) => {
    return phone.replace(/\D/g, '')
      .replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  };

  // Salvar cliente
  const handleSaveCustomer = (formData: FormData) => {
    const customerData = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formatPhone(formData.get('phone') as string),
      cpf: formData.get('cpf') as string,
      birthDate: formData.get('birthDate') as string,
      address: {
        street: formData.get('street') as string,
        number: formData.get('number') as string,
        complement: formData.get('complement') as string,
        neighborhood: formData.get('neighborhood') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        zipCode: formData.get('zipCode') as string
      },
      notes: formData.get('notes') as string
    };

    if (editingCustomer) {
      // Editar cliente existente
      const updatedCustomers = customers.map(customer =>
        customer.id === editingCustomer.id
          ? { ...customer, ...customerData }
          : customer
      );
      setCustomers(updatedCustomers);
      saveCustomersData(updatedCustomers);
    } else {
      // Criar novo cliente
      const newCustomer: Customer = {
        id: Date.now(),
        ...customerData,
        totalOrders: 0,
        totalSpent: 0,
        createdAt: new Date().toISOString(),
        isActive: true
      };
      const updatedCustomers = [...customers, newCustomer];
      setCustomers(updatedCustomers);
      saveCustomersData(updatedCustomers);
    }

    setShowModal(false);
    setEditingCustomer(null);
  };

  // Excluir cliente
  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;

    const updatedCustomers = customers.filter(c => c.id !== customerToDelete.id);
    setCustomers(updatedCustomers);
    saveCustomersData(updatedCustomers);
    
    setShowDeleteConfirm(false);
    setCustomerToDelete(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meus Clientes</h1>
            <p className="text-gray-600 mt-1">
              Gerencie sua base de clientes e histórico de pedidos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <UserPlusIcon className="w-5 h-5 mr-2" />
            Novo Cliente
          </motion.button>
        </div>
      </div>

      {/* Barra de Busca e Estatísticas */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Busca */}
          <div className="md:col-span-2">
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nome, email, telefone ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>

          {/* Estatísticas */}
          <div className="text-center">
            <p className="text-sm text-gray-600">Total de Clientes</p>
            <p className="text-2xl font-bold text-gray-900">{customers.length}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Clientes Ativos</p>
            <p className="text-2xl font-bold text-green-600">
              {customers.filter(c => c.isActive).length}
            </p>
          </div>
        </div>
      </div>

      {/* Lista de Clientes */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {filteredCustomers.length === 0 ? (
          <div className="text-center py-12">
            <UserPlusIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pedidos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Gasto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Último Pedido
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{customer.name}</div>
                        {customer.cpf && (
                          <div className="text-sm text-gray-500">CPF: {customer.cpf}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <PhoneIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.phone}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <EnvelopeIcon className="w-4 h-4 mr-1 text-gray-400" />
                        {customer.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.totalOrders}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {formatCurrency(customer.totalSpent)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {customer.lastOrderDate ? formatDate(customer.lastOrderDate) : '-'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingCustomer(customer);
                          setShowModal(true);
                        }}
                        className="text-primary-600 hover:text-primary-900 mr-3"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => {
                          setCustomerToDelete(customer);
                          setShowDeleteConfirm(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de Cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCustomer ? 'Editar Cliente' : 'Novo Cliente'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingCustomer(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveCustomer(new FormData(e.currentTarget));
              }}
              className="p-6 space-y-6"
            >
              {/* Dados Pessoais */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Dados Pessoais</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nome *</label>
                    <input
                      type="text"
                      name="name"
                      required
                      defaultValue={editingCustomer?.name}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">CPF</label>
                    <input
                      type="text"
                      name="cpf"
                      placeholder="000.000.000-00"
                      defaultValue={editingCustomer?.cpf}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email *</label>
                    <input
                      type="email"
                      name="email"
                      required
                      defaultValue={editingCustomer?.email}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Telefone *</label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      placeholder="(00) 00000-0000"
                      defaultValue={editingCustomer?.phone}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Data de Nascimento</label>
                    <input
                      type="date"
                      name="birthDate"
                      defaultValue={editingCustomer?.birthDate}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-4">Endereço</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">CEP</label>
                    <input
                      type="text"
                      name="zipCode"
                      placeholder="00000-000"
                      defaultValue={editingCustomer?.address?.zipCode}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">Rua</label>
                    <input
                      type="text"
                      name="street"
                      defaultValue={editingCustomer?.address?.street}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Número</label>
                    <input
                      type="text"
                      name="number"
                      defaultValue={editingCustomer?.address?.number}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Complemento</label>
                    <input
                      type="text"
                      name="complement"
                      defaultValue={editingCustomer?.address?.complement}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bairro</label>
                    <input
                      type="text"
                      name="neighborhood"
                      defaultValue={editingCustomer?.address?.neighborhood}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Cidade</label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={editingCustomer?.address?.city}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <select
                      name="state"
                      defaultValue={editingCustomer?.address?.state}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    >
                      <option value="">Selecione</option>
                      <option value="SP">SP</option>
                      <option value="RJ">RJ</option>
                      <option value="MG">MG</option>
                      <option value="ES">ES</option>
                      {/* Adicionar outros estados */}
                    </select>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div>
                <label className="block text-sm font-medium text-gray-700">Observações</label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingCustomer?.notes}
                  placeholder="Preferências, alergias, observações especiais..."
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              {/* Botões */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCustomer(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  {editingCustomer ? 'Salvar' : 'Cadastrar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteConfirm && customerToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <ExclamationCircleIcon className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 text-center mb-2">
                Excluir Cliente
              </h3>
              <p className="text-sm text-gray-500 text-center mb-6">
                Tem certeza que deseja excluir o cliente <strong>{customerToDelete.name}</strong>?
                Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setCustomerToDelete(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleDeleteCustomer}
                  className="px-4 py-2 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
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