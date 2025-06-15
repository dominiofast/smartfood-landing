import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
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
  categoryId: number;
  isHighlight?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
}

interface Category {
  id: number;
  name: string;
  icon: string;
  description?: string;
}

interface StoreSettings {
  logo?: string;
  banners: Array<{
    id: number;
    image: string;
    title: string;
    description: string;
  }>;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  storeName: string;
}

export default function DigitalMenu() {
  const { storeId } = useParams<{ storeId?: string }>();
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [storeSettings, setStoreSettings] = useState<StoreSettings>({
    storeName: 'Minha Loja',
    logo: '',
    banners: [],
    colors: {
      primary: '#dc2626',
      secondary: '#1f2937',
      accent: '#f59e0b'
    }
  });

  // Carregar configurações e produtos da loja
  useEffect(() => {
    // Primeiro tenta pegar o ID da loja da URL, senão pega do localStorage
    const currentStoreId = storeId || localStorage.getItem('currentStoreId');
    
    if (currentStoreId) {
      const storeIdStr = String(currentStoreId); // Garantir que seja string
      
      // Carregar configurações visuais
      const settingsKey = `storeDigitalMenuSettings_${storeIdStr}`;
      const savedSettings = localStorage.getItem(settingsKey);
      
      console.log('Carregando menu para loja:', storeIdStr);
      console.log('Chave de configurações:', settingsKey);
      console.log('Configurações encontradas:', savedSettings ? 'Sim' : 'Não');
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          console.log('Configurações carregadas no menu:', settings);
          setStoreSettings(prev => ({
            ...prev,
            ...settings
          }));
        } catch (error) {
          console.error('Erro ao carregar configurações:', error);
        }
      }
      
      // Carregar produtos do menu
      const menuKey = `storeMenuData_${storeIdStr}`;
      const savedMenu = localStorage.getItem(menuKey);
      
      console.log('Chave de menu:', menuKey);
      console.log('Menu encontrado:', savedMenu ? 'Sim' : 'Não');
      
      if (savedMenu) {
        try {
          const menuData = JSON.parse(savedMenu);
          const loadedCategories: Category[] = [];
          const loadedItems: MenuItem[] = [];
          
          // Processar categorias e produtos
          menuData.categories.forEach((cat: any) => {
            if (cat.is_active) {
              loadedCategories.push({
                id: cat.id,
                name: cat.name,
                icon: cat.icon || '📦',
                description: cat.description
              });
              
              // Processar produtos da categoria
              cat.products.forEach((prod: any) => {
                if (prod.is_active) {
                  loadedItems.push({
                    id: prod.id,
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    image: prod.image,
                    category: cat.name,
                    categoryId: cat.id,
                    // TODO: Adicionar lógica para determinar badges baseado em dados reais
                    isHighlight: false,
                    isNew: false,
                    isBestSeller: false
                  });
                }
              });
            }
          });
          
          console.log('Categorias carregadas:', loadedCategories);
          console.log('Total de produtos carregados:', loadedItems.length);
          console.log('Produtos:', loadedItems);
          
          setCategories(loadedCategories);
          setMenuItems(loadedItems);
          
          // Por padrão, mostrar todos os produtos
          setActiveCategory(null);
        } catch (error) {
          console.error('Erro ao carregar menu:', error);
          loadDefaultData();
        }
      } else {
        loadDefaultData();
      }
    } else {
      loadDefaultData();
    }
  }, [storeId]);

  // Carregar dados padrão se não houver dados salvos
  const loadDefaultData = () => {
    const defaultCategories: Category[] = [
      { id: 1, name: 'Pizzas', icon: '🍕' },
      { id: 2, name: 'Entradas', icon: '🥗' },
      { id: 3, name: 'Bebidas', icon: '🥤' },
      { id: 4, name: 'Sobremesas', icon: '🍰' },
    ];
    
    const defaultItems: MenuItem[] = [
      {
        id: 1,
        name: 'Pizza Margherita',
        description: 'Molho de tomate, mussarela, manjericão e azeite',
        price: 35.90,
        category: 'Pizzas',
        categoryId: 1,
        image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=400&q=80',
        isBestSeller: true,
      },
      {
        id: 2,
        name: 'Refrigerante Lata',
        description: 'Coca-Cola, Guaraná ou Sprite',
        price: 6.90,
        category: 'Bebidas',
        categoryId: 3,
        image: 'https://images.unsplash.com/photo-1581098365948-6e5a5c1d7c73?w=400&q=80',
      }
    ];
    
    setCategories(defaultCategories);
    setMenuItems(defaultItems);
    setActiveCategory(null);
  };

  // Dados mockados - em produção viriam da API
  const defaultHighlights = [
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

  // Usar banners personalizados ou padrão
  const highlights = storeSettings.banners.length > 0 
    ? storeSettings.banners.map(banner => ({
        id: banner.id,
        name: banner.title,
        description: banner.description,
        image: banner.image,
        price: 0 // Banners personalizados não mostram preço
      }))
    : defaultHighlights;

  const filteredItems = activeCategory 
    ? menuItems.filter(item => item.categoryId === activeCategory)
    : menuItems;

  // Auto-play do carrossel
  useEffect(() => {
    if (highlights.length === 0) return;
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

  // CSS dinâmico com as cores personalizadas
  const dynamicStyles = `
    .btn-primary {
      background-color: ${storeSettings.colors.primary};
    }
    .btn-primary:hover {
      background-color: ${storeSettings.colors.primary}dd;
    }
    .text-primary {
      color: ${storeSettings.colors.primary};
    }
    .bg-primary {
      background-color: ${storeSettings.colors.primary};
    }
    .ring-primary {
      --tw-ring-color: ${storeSettings.colors.primary};
    }
    .badge-accent {
      background-color: ${storeSettings.colors.accent}20;
      color: ${storeSettings.colors.accent};
    }
  `;

  return (
    <div className="min-h-screen bg-gray-50">
      <style>{dynamicStyles}</style>
      
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              {storeSettings.logo && (
                <img
                  src={storeSettings.logo}
                  alt={storeSettings.storeName}
                  className="h-10 w-10 object-contain"
                />
              )}
              <h1 className="text-2xl font-bold" style={{ color: storeSettings.colors.secondary }}>
                {storeSettings.storeName}
              </h1>
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
      {highlights.length > 0 && (
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
                  {highlights[currentSlide].price > 0 && (
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-2xl md:text-3xl font-bold"
                    >
                      R$ {highlights[currentSlide].price.toFixed(2).replace('.', ',')}
                    </motion.p>
                  )}
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
      )}

      {/* Categories Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto py-0 scrollbar-hide">
            <button
              onClick={() => setActiveCategory(null)}
              className={`flex items-center space-x-2 px-0 py-4 border-b-2 transition-all ${
                activeCategory === null
                  ? 'border-primary-600 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-sm font-medium">Todos</span>
            </button>
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex items-center space-x-2 px-0 py-4 border-b-2 transition-all ${
                  activeCategory === category.id
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-sm font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeCategory === null ? (
          // Mostrar todos os produtos organizados por categoria
          <div className="space-y-12">
            {categories.map((category) => {
              const categoryItems = menuItems.filter(item => item.categoryId === category.id);
              
              if (categoryItems.length === 0) return null;
              
              return (
                <div key={category.id}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-3">{category.icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{category.name}</h2>
                    {category.description && (
                      <p className="text-gray-600 ml-4">{category.description}</p>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {categoryItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                          item.isHighlight ? 'ring-2 ring-primary' : ''
                        }`}
                        style={item.isHighlight ? { borderColor: storeSettings.colors.primary } : {}}
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
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium badge-accent">
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
                                    <span 
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                                      style={{ 
                                        backgroundColor: `${storeSettings.colors.accent}20`,
                                        color: storeSettings.colors.accent 
                                      }}
                                    >
                                      <FireIcon className="w-3 h-3 mr-1" />
                                      Destaque
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                              </div>
                            </div>
                            <div className="mt-3">
                              <p className="text-xl font-bold text-primary" style={{ color: storeSettings.colors.primary }}>
                                R$ {item.price.toFixed(2).replace('.', ',')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Mostrar apenas produtos da categoria selecionada
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-lg transition-shadow ${
                  item.isHighlight ? 'ring-2 ring-primary' : ''
                }`}
                style={item.isHighlight ? { borderColor: storeSettings.colors.primary } : {}}
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
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium badge-accent">
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
                            <span 
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                              style={{ 
                                backgroundColor: `${storeSettings.colors.accent}20`,
                                color: storeSettings.colors.accent 
                              }}
                            >
                              <FireIcon className="w-3 h-3 mr-1" />
                              Destaque
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <p className="text-xl font-bold text-primary" style={{ color: storeSettings.colors.primary }}>
                        R$ {item.price.toFixed(2).replace('.', ',')}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-white py-8 mt-16" style={{ backgroundColor: storeSettings.colors.secondary }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">© 2024 {storeSettings.storeName}. Todos os direitos reservados.</p>
          <p className="text-xs opacity-75 mt-2">Powered by DomínioTech</p>
        </div>
      </div>
    </div>
  );
} 