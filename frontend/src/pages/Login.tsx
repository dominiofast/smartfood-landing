import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../contexts/AuthContext';
import { LoginCredentials } from '../types';
import { EyeIcon, EyeSlashIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { SparklesIcon, ChartBarIcon, CpuChipIcon, ShieldCheckIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/solid';

const schema = yup.object({
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  password: yup.string().min(6, 'Senha deve ter no mínimo 6 caracteres').required('Senha é obrigatória'),
});

export default function Login() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data: LoginCredentials) => {
    try {
      setIsLoading(true);
      await login(data);
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-primary-700 flex items-center justify-center p-4 md:p-0">
      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        {/* Lado esquerdo - Formulário de login */}
        <div className="w-full md:w-1/2 p-8 md:p-12">
          <div className="mb-8">
            <div className="flex items-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                className="flex items-center justify-center w-12 h-12 bg-primary-600 rounded-xl mr-4"
              >
                <SparklesIcon className="w-6 h-6 text-white" />
              </motion.div>
              <h1 className="text-2xl font-bold text-gray-800">DomínioTech</h1>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Bem-vindo de volta!</h2>
            <p className="text-gray-600">Acesse sua conta para gerenciar seu restaurante</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                placeholder="seu@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-600">Lembrar de mim</span>
              </label>
              <button type="button" className="text-sm text-primary-600 hover:text-primary-700">
                Esqueceu a senha?
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-medium text-white transition-all ${
                isLoading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-primary-600 to-secondary-500 hover:from-primary-700 hover:to-secondary-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  Entrar <ArrowRightIcon className="w-5 h-5 ml-2" />
                </span>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Recursos com IA</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto">
                  <ChartBarIcon className="w-6 h-6 text-primary-600" />
                </div>
                <p className="text-xs text-gray-600">Análise Inteligente</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto">
                  <CpuChipIcon className="w-6 h-6 text-secondary-600" />
                </div>
                <p className="text-xs text-gray-600">Chat com IA</p>
              </div>
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
                </div>
                <p className="text-xs text-gray-600">Insights em Tempo Real</p>
              </div>
            </div>
          </div>
        </div>

        {/* Lado direito - Design visual */}
        <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-primary-800 to-primary-900 p-12 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100" height="100" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 h-full flex flex-col justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-6">Gestão Inteligente para Restaurantes</h2>
              <p className="text-primary-100 mb-8">
                Otimize seu negócio com nossa plataforma alimentada por inteligência artificial. 
                Aumente suas vendas, reduza custos e melhore a experiência do cliente.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-secondary-500 rounded-lg p-2 mr-4">
                    <ChartBarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Análise de Dados</h3>
                    <p className="text-primary-100 text-sm">
                      Insights detalhados sobre vendas, estoque e preferências dos clientes
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-secondary-500 rounded-lg p-2 mr-4">
                    <DevicePhoneMobileIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Aplicativo Mobile</h3>
                    <p className="text-primary-100 text-sm">
                      Gerencie seu negócio de qualquer lugar com nosso aplicativo intuitivo
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="flex-shrink-0 bg-secondary-500 rounded-lg p-2 mr-4">
                    <CpuChipIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">Inteligência Artificial</h3>
                    <p className="text-primary-100 text-sm">
                      Recomendações personalizadas baseadas no comportamento dos clientes
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-auto">
              <p className="text-primary-200 text-sm">
                © 2025 DomínioTech. Todos os direitos reservados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
