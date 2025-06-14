import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  FireIcon,
  CheckCircleIcon,
  TruckIcon,
  HomeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

// Tipos
interface Order {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  items: string;
  total: number;
  status: 'waiting' | 'kitchen' | 'ready' | 'delivering' | 'delivered';
  created_at: string;
  updated_at: string;
  delivery_address?: string;
  notes?: string;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: Order['status'];
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

// Colunas do Kanban
const kanbanColumns: KanbanColumn[] = [
  {
    id: 'waiting',
    title: 'Aguardando',
    status: 'waiting',
    icon: ClockIcon,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50'
  },
  {
    id: 'kitchen',
    title: 'Cozinha',
    status: 'kitchen',
    icon: FireIcon,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50'
  },
  {
    id: 'ready',
    title: 'Pronto',
    status: 'ready',
    icon: CheckCircleIcon,
    color: 'text-green-600',
    bgColor: 'bg-green-50'
  },
  {
    id: 'delivering',
    title: 'Saiu para Entrega',
    status: 'delivering',
    icon: TruckIcon,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50'
  },
  {
    id: 'delivered',
    title: 'Entregue',
    status: 'delivered',
    icon: HomeIcon,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50'
  }
];

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);

  // Dados mockados para demonstração
  useEffect(() => {
    // Simular carregamento de pedidos
    setTimeout(() => {
      const mockOrders: Order[] = [
        {
          id: 1,
          order_number: '#001',
          customer_name: 'João Silva',
          customer_phone: '(69) 99999-9999',
          items: '1x Pizza Margherita, 1x Coca-Cola',
          total: 45.90,
          status: 'waiting',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivery_address: 'Rua das Flores, 123',
          notes: 'Sem cebola'
        },
        {
          id: 2,
          order_number: '#002',
          customer_name: 'Maria Santos',
          customer_phone: '(69) 98888-8888',
          items: '2x Pizza Calabresa, 1x Guaraná',
          total: 89.90,
          status: 'kitchen',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivery_address: 'Av. Principal, 456'
        },
        {
          id: 3,
          order_number: '#003',
          customer_name: 'Pedro Oliveira',
          customer_phone: '(69) 97777-7777',
          items: '1x Pizza Portuguesa',
          total: 42.90,
          status: 'ready',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          delivery_address: 'Rua do Comércio, 789'
        }
      ];
      setOrders(mockOrders);
      setLoading(false);
    }, 1000);
  }, []);

  // Funções de drag and drop
  const handleDragStart = (e: React.DragEvent, order: Order) => {
    setDraggedOrder(order);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, newStatus: Order['status']) => {
    e.preventDefault();
    
    if (draggedOrder) {
      const updatedOrders = orders.map(order => 
        order.id === draggedOrder.id 
          ? { ...order, status: newStatus, updated_at: new Date().toISOString() }
          : order
      );
      setOrders(updatedOrders);
      setDraggedOrder(null);
      
      // Aqui você faria a chamada para a API para atualizar o status
      console.log(`Pedido ${draggedOrder.order_number} movido para ${newStatus}`);
    }
  };

  // Filtrar pedidos por status
  const getOrdersByStatus = (status: Order['status']) => {
    return orders.filter(order => order.status === status);
  };

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Formatar hora
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
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
            <h1 className="text-2xl font-bold text-gray-900">Pedidos</h1>
            <p className="text-gray-600 mt-1">
              Gerencie os pedidos da sua loja
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Novo Pedido
          </motion.button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {kanbanColumns.map((column) => {
          const columnOrders = getOrdersByStatus(column.status);
          const Icon = column.icon;
          
          return (
            <div
              key={column.id}
              className={`${column.bgColor} rounded-lg p-4`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.status)}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Icon className={`w-5 h-5 ${column.color} mr-2`} />
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                </div>
                <span className="bg-white px-2 py-1 rounded-full text-sm font-medium text-gray-700">
                  {columnOrders.length}
                </span>
              </div>

              {/* Orders */}
              <div className="space-y-3">
                {columnOrders.map((order) => (
                  <div
                    key={order.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, order)}
                    className="bg-white rounded-lg p-4 shadow-sm cursor-move hover:shadow-md transition-shadow transform hover:scale-[1.02] active:scale-[0.98] transition-transform"
                  >
                    {/* Order Header */}
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-900">{order.order_number}</span>
                      <span className="text-xs text-gray-500">{formatTime(order.created_at)}</span>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-3">
                      <p className="font-medium text-gray-900">{order.customer_name}</p>
                      <p className="text-sm text-gray-600">{order.customer_phone}</p>
                    </div>

                    {/* Items */}
                    <div className="mb-3">
                      <p className="text-sm text-gray-700">{order.items}</p>
                      {order.notes && (
                        <p className="text-xs text-gray-500 mt-1 italic">Obs: {order.notes}</p>
                      )}
                    </div>

                    {/* Delivery Address */}
                    {order.delivery_address && (
                      <div className="mb-3">
                        <p className="text-xs text-gray-500">Entregar em:</p>
                        <p className="text-sm text-gray-700">{order.delivery_address}</p>
                      </div>
                    )}

                    {/* Total */}
                    <div className="border-t pt-2">
                      <p className="font-bold text-lg text-primary-600">
                        {formatCurrency(order.total)}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Empty State */}
                {columnOrders.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="text-sm">Nenhum pedido</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
} 