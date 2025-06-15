import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  BuildingStorefrontIcon,
  UsersIcon,
  SparklesIcon,
  ChartBarIcon,
  ChatBubbleBottomCenterTextIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  BellIcon,
  ShoppingBagIcon,
  ClipboardDocumentListIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  UserGroupIcon,
  ComputerDesktopIcon,
} from '@heroicons/react/24/outline';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);

  const getMenuItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: user?.role === 'superadmin' ? '/superadmin' : '/manager',
        icon: HomeIcon,
      },
    ];

    if (user?.role === 'superadmin') {
      return [
        ...baseItems,
        { name: 'Pedidos', href: '/superadmin/orders', icon: ShoppingBagIcon },
        { name: 'Pedidos PDV', href: '/manager/pdv', icon: ComputerDesktopIcon },
        { name: 'Gestor de Cardápio', href: '/superadmin/menu', icon: ClipboardDocumentListIcon },
        { name: 'Gestão de Lojas', href: '/superadmin/stores', icon: BuildingStorefrontIcon },
        { name: 'Usuários', href: '/superadmin/users', icon: UsersIcon },
        { name: 'Assistente IA', href: '/superadmin/ai-assistant', icon: SparklesIcon },
        { name: 'Relatórios', href: '/superadmin/reports', icon: ChartBarIcon },
      ];
    }

    return [
      { name: 'Pedidos', href: '/manager/orders', icon: ShoppingBagIcon },
      { name: 'Pedidos PDV', href: '/manager/pdv', icon: ComputerDesktopIcon },
      { name: 'PDV', href: '/manager/pdv', icon: ComputerDesktopIcon },
      { name: 'Gestor de Cardápio', href: '/manager/menu', icon: ClipboardDocumentListIcon },
      { name: 'Minha Loja', href: '/manager/store', icon: BuildingStorefrontIcon },
      { name: 'Meus Clientes', href: '/manager/customers', icon: UserGroupIcon },
      { name: 'Equipe', href: '/manager/users', icon: UsersIcon },
      { name: 'Assistente IA', href: '/manager/ai-assistant', icon: SparklesIcon },
      { name: 'Relatórios', href: '/manager/reports', icon: ChartBarIcon },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -256 }}
              animate={{ x: 0 }}
              exit={{ x: -256 }}
              transition={{ type: 'tween' }}
              className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:hidden"
            >
              <div className="p-4">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                      <SparklesIcon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">DomínioTech</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <XMarkIcon className="w-6 h-6" />
                  </button>
                </div>
                <nav className="space-y-1">
                  {menuItems.map((item) => {
                    const isActive = location.pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        to={item.href}
                        onClick={() => setSidebarOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-primary-100 text-primary-700'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}
                  
                  {/* Configurações com submenu */}
                  <div className="mt-4">
                    <button
                      onClick={() => setSettingsExpanded(!settingsExpanded)}
                      className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <Cog6ToothIcon className="w-5 h-5" />
                        <span>Configurações</span>
                      </div>
                      {settingsExpanded ? (
                        <ChevronDownIcon className="w-4 h-4" />
                      ) : (
                        <ChevronRightIcon className="w-4 h-4" />
                      )}
                    </button>
                    {settingsExpanded && (
                      <div className="mt-1 ml-8 space-y-1">
                        <Link
                          to={user?.role === 'superadmin' ? '/superadmin/settings/digital-menu' : '/manager/settings/digital-menu'}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            location.pathname.includes('/settings/digital-menu')
                              ? 'bg-primary-100 text-primary-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          }`}
                        >
                          Cardápio Digital
                        </Link>
                      </div>
                    )}
                  </div>
                </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-grow flex-col overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center justify-center h-16 px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-purple-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">DomínioTech</span>
            </div>
          </div>
          <nav className="flex-1 px-4 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            {/* Configurações com submenu */}
            <div className="mt-4">
              <button
                onClick={() => setSettingsExpanded(!settingsExpanded)}
                className="w-full flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <Cog6ToothIcon className="w-5 h-5" />
                  <span>Configurações</span>
                </div>
                {settingsExpanded ? (
                  <ChevronDownIcon className="w-4 h-4" />
                ) : (
                  <ChevronRightIcon className="w-4 h-4" />
                )}
              </button>
              {settingsExpanded && (
                <div className="mt-1 ml-8 space-y-1">
                  <Link
                    to={user?.role === 'superadmin' ? '/superadmin/settings/digital-menu' : '/manager/settings/digital-menu'}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                      location.pathname.includes('/settings/digital-menu')
                        ? 'bg-primary-100 text-primary-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Cardápio Digital
                  </Link>
                </div>
              )}
            </div>
          </nav>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4">
              <UserCircleIcon className="w-10 h-10 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.role}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 text-sm"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 bg-white border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <button
                onClick={() => setSidebarOpen(true)}
                className="text-gray-500 hover:text-gray-700 lg:hidden"
              >
                <Bars3Icon className="w-6 h-6" />
              </button>

              <div className="flex-1 flex items-center justify-end space-x-4">
                {/* Botão Cardápio Digital */}
                {user && (
                  <a
                    href={user.store?.id ? `/menu/${user.store.id}` : '/menu'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                  >
                    <DocumentTextIcon className="w-5 h-5 mr-2" />
                    Cardápio Digital
                  </a>
                )}

                {/* AI Status Indicator */}
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>IA Online</span>
                </div>

                {/* Notifications */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative text-gray-500 hover:text-gray-700"
                  >
                    <BellIcon className="w-6 h-6" />
                    <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 transform translate-x-1/2 -translate-y-1/2"></span>
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
                      >
                        <div className="p-4 border-b border-gray-200">
                          <h3 className="text-sm font-medium text-gray-900">Notificações</h3>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          <div className="p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <SparklesIcon className="w-5 h-5 text-primary-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">Nova análise de IA disponível</p>
                                <p className="text-xs text-gray-500 mt-1">Há 5 minutos</p>
                              </div>
                            </div>
                          </div>
                          <div className="p-4 hover:bg-gray-50 cursor-pointer">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <ChatBubbleBottomCenterTextIcon className="w-5 h-5 text-purple-600" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900">Novo insight sobre vendas</p>
                                <p className="text-xs text-gray-500 mt-1">Há 15 minutos</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* User Menu */}
                <div className="hidden lg:flex items-center space-x-3">
                  <UserCircleIcon className="w-8 h-8 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout; 