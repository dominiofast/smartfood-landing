import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-emerald-600">DomínioTech</h1>
          </div>
          <nav>
            <Link 
              to="/login" 
              className="px-5 py-2 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Entrar
            </Link>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Gestão Inteligente para Restaurantes com IA
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Transforme seu restaurante com análises avançadas, insights em tempo real e assistência de IA para maximizar seus resultados.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  to="/login" 
                  className="px-6 py-3 bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-center font-medium"
                >
                  Começar agora
                </Link>
                <a 
                  href="#features" 
                  className="px-6 py-3 bg-white border border-emerald-600 text-emerald-600 rounded-md hover:bg-emerald-50 transition-colors text-center font-medium"
                >
                  Saiba mais
                </a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="hidden md:block"
            >
              <div className="rounded-lg bg-gradient-to-br from-green-600 to-purple-600 p-1">
                <form className="bg-white rounded-xl shadow-lg p-6 md:p-8 flex flex-col gap-4 w-full max-w-md mx-auto" style={{minWidth:'260px'}} autoComplete="off" onSubmit={e => {e.preventDefault(); alert('Solicitação enviada! Em breve entraremos em contato.')}}>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Teste grátis por 10 dias!</h2>
                  <p className="text-gray-600 mb-4 text-center">Preencha para experimentar todas as funcionalidades sem compromisso.</p>
                  <label className="text-gray-700 font-medium">Nome
                    <input type="text" name="nome" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Seu nome" />
                  </label>
                  <label className="text-gray-700 font-medium">E-mail
                    <input type="email" name="email" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="seu@email.com" />
                  </label>
                  <label className="text-gray-700 font-medium">Telefone
                    <input type="tel" name="telefone" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="(00) 00000-0000" />
                  </label>
                  <label className="text-gray-700 font-medium">Nome do Restaurante
                    <input type="text" name="restaurante" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500" placeholder="Nome do restaurante" />
                  </label>
                  <button type="submit" className="mt-2 bg-gradient-to-r from-green-600 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:from-green-700 hover:to-purple-700 transition-all shadow-lg">
                    Quero testar grátis por 10 dias
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Recursos Principais</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Análise de Vendas</h3>
                <p className="text-gray-600">Visualize suas vendas em tempo real e identifique tendências para tomar decisões estratégicas.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Assistente de IA</h3>
                <p className="text-gray-600">Receba insights e recomendações personalizadas baseadas nos dados do seu restaurante.</p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">Gestão de Equipe</h3>
                <p className="text-gray-600">Gerencie sua equipe, defina permissões e acompanhe o desempenho de cada colaborador.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h2 className="text-xl font-bold">DomínioTech</h2>
              <p className="text-gray-400">© 2025 Todos os direitos reservados</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-emerald-400 transition-colors">Termos</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Privacidade</a>
              <a href="#" className="hover:text-emerald-400 transition-colors">Contato</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
