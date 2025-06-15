import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ShoppingCartIcon,
  UserIcon,
  PhoneIcon,
  MapPinIcon,
  ClockIcon,
  CreditCardIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XMarkIcon,
  PrinterIcon,
  HomeIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
  image?: string;
}

interface CartItem extends Product {
  quantity: number;
  notes?: string;
}

interface Customer {
  id: number;
  name: string;
  phone: string;
  address?: string;
}

type OrderType = 'balcao' | 'delivery';
type PaymentMethod = 'dinheiro' | 'cartao' | 'pix';

export default function PDV() {
  const { user } = useAuth();
  const [orderType, setOrderType] = useState<OrderType>('balcao');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('dinheiro');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);

  // Carregar produtos do menu
  useEffect(() => {
    if (!user?.store?.id) return;
    
    const storageKey = `storeMenuData_${user.store.id}`;
    const savedMenu = localStorage.getItem(storageKey);
    
    if (savedMenu) {
      try {
        const menuData = JSON.parse(savedMenu);
        const loadedProducts: Product[] = [];
        const loadedCategories: string[] = ['todos'];
        
        menuData.categories.forEach((cat: any) => {
          if (cat.is_active) {
            loadedCategories.push(cat.name);
            cat.products.forEach((prod: any) => {
              if (prod.is_active) {
                loadedProducts.push({
                  id: prod.id,
                  name: prod.name,
                  price: prod.price,
                  category: cat.name,
                  image: prod.image
                });
              }
            });
          }
        });
        
        setProducts(loadedProducts);
        setCategories(loadedCategories);
      } catch (error) {
        console.error('Erro ao carregar produtos:', error);
        loadMockProducts();
      }
    } else {
      loadMockProducts();
    }
  }, [user]);

  const loadMockProducts = () => {
    const mockProducts: Product[] = [
      { id: 1, name: 'Pizza Margherita', price: 35.90, category: 'Pizzas' },
      { id: 2, name: 'Pizza Calabresa', price: 38.90, category: 'Pizzas' },
      { id: 3, name: 'Coca-Cola 2L', price: 12.00, category: 'Bebidas' },
      { id: 4, name: 'Água Mineral', price: 3.50, category: 'Bebidas' },
    ];
    setProducts(mockProducts);
    setCategories(['todos', 'Pizzas', 'Bebidas']);
  };

  // Filtrar produtos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Adicionar ao carrinho
  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  // Atualizar quantidade
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  // Remover do carrinho
  const removeFromCart = (productId: number) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  // Calcular total
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Calcular troco
  const calculateChange = () => {
    const received = parseFloat(receivedAmount) || 0;
    const total = calculateTotal();
    return received - total;
  };

  // Formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Finalizar pedido
  const finishOrder = () => {
    if (cart.length === 0) return;
    
    if (orderType === 'delivery' && !selectedCustomer) {
      setShowCustomerModal(true);
      return;
    }
    
    setShowPaymentModal(true);
  };

  // Confirmar pagamento
  const confirmPayment = () => {
    const orderData = {
      id: Date.now(),
      type: orderType,
      items: cart,
      total: calculateTotal(),
      customer: selectedCustomer,
      deliveryAddress: orderType === 'delivery' ? deliveryAddress : null,
      paymentMethod,
      receivedAmount: paymentMethod === 'dinheiro' ? parseFloat(receivedAmount) : null,
      change: paymentMethod === 'dinheiro' ? calculateChange() : null,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    
    // Salvar pedido no localStorage
    const storageKey = `storeOrders_${user?.store?.id}`;
    const existingOrders = JSON.parse(localStorage.getItem(storageKey) || '[]');
    existingOrders.push(orderData);
    localStorage.setItem(storageKey, JSON.stringify(existingOrders));
    
    // Limpar carrinho e resetar estado
    setCart([]);
    setSelectedCustomer(null);
    setDeliveryAddress('');
    setPaymentMethod('dinheiro');
    setReceivedAmount('');
    setShowPaymentModal(false);
    
    // TODO: Imprimir cupom
    console.log('Pedido finalizado:', orderData);
    alert('Pedido finalizado com sucesso!');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">PDV - Ponto de Venda</h1>
          <div className="flex items-center space-x-4">
            {/* Tipo de Pedido */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setOrderType('balcao')}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  orderType === 'balcao'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <HomeIcon className="w-5 h-5 mr-2" />
                Balcão
              </button>
              <button
                onClick={() => setOrderType('delivery')}
                className={`flex items-center px-4 py-2 rounded-md transition-colors ${
                  orderType === 'delivery'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <TruckIcon className="w-5 h-5 mr-2" />
                Delivery
              </button>
            </div>
            
            {/* Cliente selecionado */}
            {orderType === 'delivery' && selectedCustomer && (
              <div className="flex items-center space-x-2 bg-green-50 px-3 py-2 rounded-lg">
                <UserIcon className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">{selectedCustomer.name}</span>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="text-green-600 hover:text-green-700"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Produtos */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Busca e Categorias */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative mb-4">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
            
            {/* Categorias */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category === 'todos' ? 'Todos' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Grid de Produtos */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <motion.button
                  key={product.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => addToCart(product)}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow text-left"
                >
                  {product.image ? (
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-32 object-cover rounded-lg mb-3"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center">
                      <ShoppingCartIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <h3 className="font-medium text-gray-900 mb-1">{product.name}</h3>
                  <p className="text-lg font-bold text-primary-600">{formatCurrency(product.price)}</p>
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Carrinho */}
        <div className="w-96 bg-gray-50 border-l border-gray-200 flex flex-col">
          {/* Header do Carrinho */}
          <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Carrinho</h2>
              <div className="flex items-center space-x-2">
                <ShoppingCartIcon className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">{cart.length} itens</span>
              </div>
            </div>
          </div>

          {/* Itens do Carrinho */}
          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCartIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Carrinho vazio</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-white rounded-lg p-3 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.name}</h4>
                        <p className="text-sm text-gray-600">{formatCurrency(item.price)}</p>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-12 text-center font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                          <PlusIcon className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer do Carrinho */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
              </div>
              
              {orderType === 'delivery' && !selectedCustomer && (
                <button
                  onClick={() => setShowCustomerModal(true)}
                  className="w-full py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 flex items-center justify-center"
                >
                  <UserIcon className="w-5 h-5 mr-2" />
                  Selecionar Cliente
                </button>
              )}
              
              <button
                onClick={finishOrder}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-lg font-medium transition-colors ${
                  cart.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
              >
                Finalizar Pedido
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Cliente */}
      {showCustomerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dados do Cliente</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                  <input
                    type="text"
                    placeholder="Nome do cliente"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
                  <input
                    type="tel"
                    placeholder="(00) 00000-0000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Endereço de Entrega</label>
                  <textarea
                    rows={3}
                    placeholder="Rua, número, bairro..."
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => setShowCustomerModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer({
                      id: Date.now(),
                      name: 'Cliente Teste',
                      phone: '(11) 99999-9999',
                      address: deliveryAddress
                    });
                    setShowCustomerModal(false);
                    setShowPaymentModal(true);
                  }}
                  className="flex-1 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Confirmar
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Pagamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Finalizar Pagamento</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between text-lg">
                  <span className="font-medium text-gray-700">Total a Pagar</span>
                  <span className="font-bold text-primary-600">{formatCurrency(calculateTotal())}</span>
                </div>
              </div>
              
              {/* Métodos de Pagamento */}
              <div className="space-y-2 mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pagamento
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setPaymentMethod('dinheiro')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'dinheiro'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <BanknotesIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Dinheiro</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cartao')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'cartao'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CreditCardIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">Cartão</span>
                  </button>
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-3 rounded-lg border-2 transition-colors ${
                      paymentMethod === 'pix'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <CheckCircleIcon className="w-6 h-6 mx-auto mb-1" />
                    <span className="text-sm">PIX</span>
                  </button>
                </div>
              </div>
              
              {/* Valor Recebido (apenas para dinheiro) */}
              {paymentMethod === 'dinheiro' && (
                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Valor Recebido
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        R$
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={receivedAmount}
                        onChange={(e) => setReceivedAmount(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="0,00"
                      />
                    </div>
                  </div>
                  
                  {receivedAmount && parseFloat(receivedAmount) >= calculateTotal() && (
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-900">Troco</span>
                        <span className="text-lg font-bold text-green-600">
                          {formatCurrency(calculateChange())}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex space-x-3">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={confirmPayment}
                  disabled={paymentMethod === 'dinheiro' && (!receivedAmount || parseFloat(receivedAmount) < calculateTotal())}
                  className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                    paymentMethod === 'dinheiro' && (!receivedAmount || parseFloat(receivedAmount) < calculateTotal())
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-primary-600 text-white hover:bg-primary-700'
                  }`}
                >
                  <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                  Confirmar Pagamento
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
} 