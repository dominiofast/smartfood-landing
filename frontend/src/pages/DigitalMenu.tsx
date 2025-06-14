import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  StarIcon,
  FireIcon,
  SparklesIcon
} from '@heroicons/react/24/solid';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category: string;
  isHighlight?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

export default function DigitalMenu() {
  const [activeCategory, setActiveCategory] = useState('pizzas');
  const [currentSlide, setCurrentSlide] = useState(0);

  // Dados mockados - em produção viriam da API
  const highlights = [
    {
      id: 1,
      name: 'Pizza Margherita Especial',
      description: 'Molho de tomate San Marzano, mussarela de búfala, manjericão fresco e azeite trufado',
      price: 45.90,
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80',
    },
    {
      id: 2,
      name: 'Pizza Quattro Formaggi Premium',
      description: 'Blend exclusivo de queijos: gorgonzola, parmesão, mussarela e catupiry',
      price: 52.90,
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
    },
    {
      id: 3,
      name: 'Pizza Calabresa Artesanal',
      description: 'Calabresa defumada, cebola roxa caramelizada, pimentões e azeitonas pretas',
      price: 48.90,
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&q=80',
    },
  ];

  const categories: Category[] = [
    { id: 'pizzas', name: 'Pizzas', icon: '🍕' },
    { id: 'entradas', name: 'Entradas', icon: '🥗' },
    { id: 'bebidas', name: 'Bebidas', icon: '🥤' },
    { id: 'sobremesas', name: 'Sobremesas', icon: '🍰' },
  ];

  const menuItems: MenuItem[] = [
    // Pizzas
    {
      id: 1,
      name: 'Pizza Margherita',
      description: 'Molho de tomate, mussarela, manjericão e azeite',
      price: 35.90,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
      isBestSeller: true,
    },
    {
      id: 2,
      name: 'Pizza Calabresa',
      description: 'Molho de tomate, mussarela, calabresa e cebola',
      price: 38.90,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=400&q=80',
    },
    {
      id: 3,
      name: 'Pizza Portuguesa',
      description: 'Molho de tomate, mussarela, presunto, ovos, cebola, azeitonas e orégano',
      price: 42.90,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80',
      isNew: true,
    },
    {
      id: 4,
      name: 'Pizza Frango com Catupiry',
      description: 'Molho de tomate, mussarela, frango desfiado e catupiry',
      price: 40.90,
      category: 'pizzas',
      image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&q=80',
      isHighlight: true,
    },
    // Entradas
    {
      id: 5,
      name: 'Bruschetta Italiana',
      description: 'Pão italiano, tomate, manjericão, alho e azeite',
      price: 22.90,
      category: 'entradas',
      image: 'https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?w=400&q=80',
    },
    {
      id: 6,
      name: 'Carpaccio de Carne',
      description: 'Finas fatias de carne, rúcula, parmesão e molho mostarda',
      price: 34.90,
      category: 'entradas',
      image: 'https://images.unsplash.com/photo-1599921841143-819065a55cc6?w=400&q=80',
      isHighlight: true,
    },
    // Bebidas
    {
      id: 7,
      name: 'Suco Natural de Laranja',
      description: 'Suco de laranja natural, feito na hora',
      price: 12.90,
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
    },
    {
      id: 8,
      name: 'Refrigerante Lata',
      description: 'Coca-Cola, Guaraná ou Sprite',
      price: 6.90,
      category: 'bebidas',
      image: 'https://images.unsplash.com/photo-1581098365948-6e5a5c1d7c73?w=400&q=80',
    },
    // Sobremesas
    {
      id: 9,
      name: 'Tiramisù',
      description: 'Tradicional sobremesa italiana com café, mascarpone e cacau',
      price: 18.90,
      category: 'sobremesas',
      image: 'https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=400&q=80',
      isBestSeller: true,
    },
    {
      id: 10,
      name: 'Panna Cotta',
      description: 'Creme de leite com calda de frutas vermelhas',
      price: 16.90,
      category: 'sobremesas',
      image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80',
    },
  ];

  const filteredItems = menuItems.filter(item => item.category === activeCategory);

  // Auto-play do carrossel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % highlights.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [highlights.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % highlights.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + highlights.length) % highlights.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Pizzaria Bella Italia</h1>
            </div>
            <div className="text-sm text-gray-600">
              <span className="inline-flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Aberto agora
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Carousel */}
      <div className="relative h-[400px] md:h-[500px] overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.5 }}
            className="absolute inset-0"
          >
            <div className="relative h-full">
              <img
                src={highlights[currentSlide].image}
                alt={highlights[currentSlide].name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl md:text-5xl font-bold mb-3"
                >
                  {highlights[currentSlide].name}
                </motion.h2>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-lg md:text-xl mb-4 max-w-2xl"
                >
                  {highlights[currentSlide].description}
                </motion.p>
                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-2xl md:text-3xl font-bold"
                >
                  R$ {highlights[currentSlide].price.toFixed(2).replace('.', ',')}
                </motion.p>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronLeftIcon className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-sm text-white p-2 rounded-full hover:bg-white/30 transition-colors"
        >
          <ChevronRightIcon className="w-6 h-6" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {highlights.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentSlide ? 'bg-white w-8' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Categories Navigation */}
      <div className="sticky top-16 z-30 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-4 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === category.id
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="text-xl">{category.icon}</span>
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                item.isHighlight ? 'ring-2 ring-primary-500' : ''
              }`}
            >
              <div className="flex">
                {item.image && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="flex-1 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        {item.isBestSeller && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                            <StarIcon className="w-3 h-3 mr-1" />
                            Mais Vendido
                          </span>
                        )}
                        {item.isNew && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <SparklesIcon className="w-3 h-3 mr-1" />
                            Novo
                          </span>
                        )}
                        {item.isHighlight && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            <FireIcon className="w-3 h-3 mr-1" />
                            Destaque
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xl font-bold text-primary-600">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 Pizzaria Bella Italia. Todos os direitos reservados.</p>
          <p className="text-xs text-gray-400 mt-2">Powered by DomínioTech</p>
        </div>
      </div>
    </div>
  );
} 