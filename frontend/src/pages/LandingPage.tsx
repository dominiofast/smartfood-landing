import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

// Paleta personalizada
const primary = '#1B263B'; // Azul escuro
const secondary = '#FF6B6B'; // Coral
const bgLight = '#F7F9FB';
const textDark = '#232946';
const textGray = '#6B7280';
const white = '#fff';


const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F9FB] to-white" style={{fontFamily:'Inter, sans-serif', background: bgLight}}>
      {/* Header */}
      <header style={{background: white, borderBottom: `1px solid #e5e7eb`}} className="w-full sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <span style={{background: primary, color: white}} className="w-9 h-9 flex items-center justify-center rounded-lg font-bold text-xl mr-2">🍽️</span>
            <h1 className="text-2xl font-bold" style={{color: primary}}>DomínioTech</h1>
          </div>
          <nav className="hidden md:flex gap-8 items-center">
            <a href="#beneficios" className="hover:underline text-base" style={{color: primary}}>Benefícios</a>
            <a href="#clientes" className="hover:underline text-base" style={{color: primary}}>Clientes</a>
            <a href="#integracoes" className="hover:underline text-base" style={{color: primary}}>Integrações</a>
            <Link to="/login" className="px-5 py-2 rounded-md font-medium" style={{background: primary, color: white}}>Entrar</Link>
            <a href="#form-teste" className="px-5 py-2 rounded-md font-medium" style={{background: secondary, color: white}}>Teste Grátis</a>
          </nav>
        </div>
      </header>
      <main>
        {/* Hero + Formulário */}
        <section className="w-full py-16 md:py-24" style={{background: `linear-gradient(90deg, ${primary} 60%, ${secondary} 100%)`}}>
          <div className="container mx-auto px-4 grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">O Cardápio Digital mais completo para seu restaurante</h2>
              <p className="text-lg md:text-xl mb-8 opacity-90">Automatize seu atendimento, aumente suas vendas e gerencie seu negócio com uma solução tudo-em-um. Integração com WhatsApp, gestão, disparo de mensagens, fidelidade e mais!</p>
              <ul className="mb-8 space-y-2 text-base">
                <li className="flex items-center gap-2"><span className="text-2xl">✔️</span>Teste grátis sem compromisso</li>
                <li className="flex items-center gap-2"><span className="text-2xl">✔️</span>Cancelamento fácil e rápido</li>
              </ul>
            </div>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
              <div className="rounded-xl shadow-lg p-1" style={{background: white}}>
                <form id="form-teste" className="bg-white rounded-xl p-6 flex flex-col gap-4 w-full max-w-md mx-auto" autoComplete="off" onSubmit={e => {e.preventDefault(); alert('Solicitação enviada! Em breve entraremos em contato.')}}>
                  <h2 className="text-2xl font-bold mb-2 text-center" style={{color: primary}}>Teste grátis por 10 dias!</h2>
                  <p className="mb-4 text-center text-sm" style={{color: textGray}}>Preencha para experimentar todas as funcionalidades sem compromisso.</p>
                  <label className="text-sm font-medium" style={{color: textDark}}>Nome
                    <input type="text" name="nome" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B263B]" placeholder="Seu nome" />
                  </label>
                  <label className="text-sm font-medium" style={{color: textDark}}>E-mail
                    <input type="email" name="email" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B263B]" placeholder="seu@email.com" />
                  </label>
                  <label className="text-sm font-medium" style={{color: textDark}}>Telefone
                    <input type="tel" name="telefone" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B263B]" placeholder="(00) 00000-0000" />
                  </label>
                  <label className="text-sm font-medium" style={{color: textDark}}>Nome do Restaurante
                    <input type="text" name="restaurante" required className="mt-1 w-full px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1B263B]" placeholder="Nome do restaurante" />
                  </label>
                  <button type="submit" className="mt-2 font-bold py-3 px-6 rounded-lg shadow-lg transition-all" style={{background: secondary, color: white}}>Quero testar grátis por 10 dias</button>
                </form>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Benefícios */}
        <section id="beneficios" className="py-16" style={{background: bgLight}}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: primary}}>Tudo que seu negócio precisa em uma única solução</h2>
              <p className="text-lg" style={{color: textGray}}>Automatize seu atendimento, aumente vendas e gerencie seu negócio. Desde cardápios digitais até robôs de atendimento no WhatsApp com inteligência artificial.</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="text-4xl mb-4" style={{color: primary}}>🤖</div>
                <h3 className="text-xl font-semibold mb-2" style={{color: primary}}>Automação de Atendimento</h3>
                <p className="text-gray-600">Chatbot WhatsApp, cardápio digital, agendamento de pedidos para vender mais e errar menos.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="text-4xl mb-4" style={{color: secondary}}>💸</div>
                <h3 className="text-xl font-semibold mb-2" style={{color: secondary}}>Ferramentas de Vendas</h3>
                <p className="text-gray-600">Disparo de mensagens, programa de fidelidade, integrações com anúncios e recuperação de carrinho.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="text-4xl mb-4" style={{color: primary}}>📈</div>
                <h3 className="text-xl font-semibold mb-2" style={{color: primary}}>Sistema de Gestão</h3>
                <p className="text-gray-600">Controle de caixa, estoque, emissão de notas fiscais e integração com iFood.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                <div className="text-4xl mb-4" style={{color: secondary}}>🔗</div>
                <h3 className="text-xl font-semibold mb-2" style={{color: secondary}}>Integrações</h3>
                <p className="text-gray-600">Conecte seu negócio às principais ferramentas do mercado para escalar suas vendas.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Depoimentos */}
        <section id="clientes" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: primary}}>Veja alguns clientes satisfeitos</h2>
              <p className="text-lg" style={{color: textGray}}>Depoimentos reais de quem já aumentou as vendas com nossa solução.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <p className="text-gray-700 italic mb-4">“Até então, 100% dos meus pedidos são feitos pelo sistema digital, não faço pedidos por WhatsApp, a mão ou bloquinho de notas, nada disso. Sempre uso o cardápio digital!”</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background: primary}}>PB</div>
                  <div>
                    <div className="font-semibold" style={{color: primary}}>Patrick Bartholazi</div>
                    <div className="text-gray-500 text-sm">Dono do B3X Burger</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
                <p className="text-gray-700 italic mb-4">“A automação de atendimento reduziu drasticamente o tempo de resposta e aumentou a satisfação dos clientes no delivery.”</p>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold" style={{background: secondary}}>MC</div>
                  <div>
                    <div className="font-semibold" style={{color: secondary}}>Maria Clara</div>
                    <div className="text-gray-500 text-sm">Proprietária de Restaurante</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integrações */}
        <section id="integracoes" className="py-16" style={{background: bgLight}}>
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{color: primary}}>Integrações poderosas</h2>
              <p className="text-lg" style={{color: textGray}}>Conecte seu restaurante às melhores ferramentas do mercado: iFood, WhatsApp, Google, Meta Ads, e muito mais.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-8">
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: primary}}>iFood</span>
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: secondary}}>WhatsApp</span>
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: primary}}>Google</span>
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: secondary}}>Meta Ads</span>
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: primary}}>QR Code</span>
              <span className="bg-white border border-gray-100 rounded-lg px-6 py-3 text-lg font-semibold shadow-sm" style={{color: secondary}}>Disparo WhatsApp</span>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16" style={{background: `linear-gradient(90deg, ${primary} 60%, ${secondary} 100%)`}}>
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">Pronto para revolucionar seu restaurante?</h2>
            <p className="text-lg mb-8 text-white opacity-90">Junte-se a dezenas de clientes satisfeitos e transforme sua gestão com tecnologia de verdade.</p>
            <a href="#form-teste" className="inline-block px-10 py-4 rounded-lg font-bold text-lg shadow-lg transition-all" style={{background: white, color: primary}}>Quero meu teste grátis</a>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10" style={{background: primary}}>
          <div className="container mx-auto px-4 text-center">
            <div className="flex flex-col items-center mb-4">
              <span className="w-9 h-9 flex items-center justify-center rounded-lg font-bold text-xl mb-2" style={{background: white, color: primary}}>🍽️</span>
              <span className="text-xl font-bold" style={{color: white}}>DomínioTech</span>
            </div>
            <p className="text-gray-400 mb-2">A revolução da gestão de restaurantes com tecnologia.</p>
            <div className="text-gray-400 text-sm">© 2025 DomínioTech. Todos os direitos reservados.</div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default LandingPage;
