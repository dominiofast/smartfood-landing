import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  PhotoIcon,
  TagIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ArrowUpTrayIcon
} from '@heroicons/react/24/outline';

// Tipos
interface Additional {
  id: number;
  name: string;
  price: number;
  order: number;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
  category_id: number;
  additionals?: Additional[];
  is_active: boolean;
  order: number;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  products: Product[];
  is_active: boolean;
  order: number;
  expanded?: boolean;
}

export default function MenuManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedItem, setDraggedItem] = useState<{type: 'category' | 'product' | 'additional', item: any} | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showAdditionalModal, setShowAdditionalModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [newAdditionals, setNewAdditionals] = useState<{name: string, price: number}[]>([{ name: '', price: 0 }]);
  const [productImage, setProductImage] = useState<string>('');

  // Dados mockados para demonstração
  useEffect(() => {
    setTimeout(() => {
      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'Pizzas Tradicionais',
          description: 'Nossas pizzas clássicas',
          icon: '🍕',
          is_active: true,
          order: 1,
          expanded: true,
          products: [
            {
              id: 1,
              name: 'Pizza Margherita',
              description: 'Molho de tomate, mussarela, manjericão e azeite',
              price: 35.90,
              category_id: 1,
              is_active: true,
              order: 1,
              additionals: [
                { id: 1, name: 'Borda Recheada', price: 8.00, order: 1 },
                { id: 2, name: 'Extra Queijo', price: 5.00, order: 2 }
              ]
            },
            {
              id: 2,
              name: 'Pizza Calabresa',
              description: 'Molho de tomate, mussarela, calabresa e cebola',
              price: 38.90,
              category_id: 1,
              is_active: true,
              order: 2,
              additionals: []
            }
          ]
        },
        {
          id: 2,
          name: 'Bebidas',
          description: 'Refrigerantes e sucos',
          icon: '🥤',
          is_active: true,
          order: 2,
          expanded: false,
          products: [
            {
              id: 3,
              name: 'Coca-Cola 2L',
              description: 'Refrigerante Coca-Cola 2 litros',
              price: 12.00,
              category_id: 2,
              is_active: true,
              order: 1,
              additionals: []
            }
          ]
        }
      ];
      setCategories(mockCategories);
      setLoading(false);
    }, 1000);
  }, []);

  // Funções de drag and drop
  const handleDragStart = (e: React.DragEvent, type: 'category' | 'product' | 'additional', item: any) => {
    setDraggedItem({ type, item });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: string, targetId: number, targetOrder: number) => {
    e.preventDefault();
    
    if (!draggedItem) return;

    const newCategories = [...categories];

    if (draggedItem.type === 'category' && targetType === 'category') {
      // Reordenar categorias
      const draggedIndex = newCategories.findIndex(c => c.id === draggedItem.item.id);
      const targetIndex = newCategories.findIndex(c => c.id === targetId);
      
      if (draggedIndex !== -1 && targetIndex !== -1) {
        const [removed] = newCategories.splice(draggedIndex, 1);
        newCategories.splice(targetIndex, 0, removed);
        
        // Atualizar ordem
        newCategories.forEach((cat, index) => {
          cat.order = index + 1;
        });
      }
    } else if (draggedItem.type === 'product' && targetType === 'product') {
      // Reordenar produtos dentro da mesma categoria
      const categoryIndex = newCategories.findIndex(c => c.id === draggedItem.item.category_id);
      if (categoryIndex !== -1) {
        const products = [...newCategories[categoryIndex].products];
        const draggedIndex = products.findIndex(p => p.id === draggedItem.item.id);
        const targetIndex = products.findIndex(p => p.id === targetId);
        
        if (draggedIndex !== -1 && targetIndex !== -1) {
          const [removed] = products.splice(draggedIndex, 1);
          products.splice(targetIndex, 0, removed);
          
          // Atualizar ordem
          products.forEach((prod, index) => {
            prod.order = index + 1;
          });
          
          newCategories[categoryIndex].products = products;
        }
      }
    }

    setCategories(newCategories);
    setDraggedItem(null);
  };

  // Toggle expandir/colapsar categoria
  const toggleCategory = (categoryId: number) => {
    setCategories(categories.map(cat => 
      cat.id === categoryId ? { ...cat, expanded: !cat.expanded } : cat
    ));
  };

  // Formatar valor em reais
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
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
            <h1 className="text-2xl font-bold text-gray-900">Gestor de Cardápio</h1>
            <p className="text-gray-600 mt-1">
              Gerencie categorias, produtos e adicionais do seu cardápio
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCategoryModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Nova Categoria
          </motion.button>
        </div>
      </div>

      {/* Lista de Categorias */}
      <div className="space-y-4">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
            draggable
            onDragStart={(e) => handleDragStart(e, 'category', category)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, 'category', category.id, category.order)}
          >
            {/* Header da Categoria */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center flex-1">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="mr-3 text-gray-500 hover:text-gray-700"
                >
                  {category.expanded ? (
                    <ChevronDownIcon className="w-5 h-5" />
                  ) : (
                    <ChevronRightIcon className="w-5 h-5" />
                  )}
                </button>
                <Bars3Icon className="w-5 h-5 text-gray-400 mr-3 cursor-move" />
                <span className="text-2xl mr-3">{category.icon}</span>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                  {category.description && (
                    <p className="text-sm text-gray-600">{category.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500 mr-4">
                  {category.products.length} produtos
                </span>
                <button
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setShowProductModal(true);
                  }}
                  className="text-primary-600 hover:text-primary-700"
                  title="Adicionar produto"
                >
                  <PlusIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => {
                    setEditingCategory(category);
                    setShowCategoryModal(true);
                  }}
                  className="text-gray-600 hover:text-gray-700"
                  title="Editar categoria"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-700"
                  title="Excluir categoria"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Lista de Produtos */}
            <AnimatePresence>
              {category.expanded && category.products.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-gray-200"
                >
                  <div className="p-4 space-y-3">
                    {category.products.map((product) => (
                      <div
                        key={product.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'product', product)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'product', product.id, product.order)}
                        className="bg-gray-50 rounded-lg p-4 cursor-move hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start flex-1">
                            <Bars3Icon className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                            {product.image ? (
                              <img 
                                src={product.image} 
                                alt={product.name}
                                className="w-16 h-16 rounded-lg object-cover mr-4"
                              />
                            ) : (
                              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mr-4">
                                <PhotoIcon className="w-8 h-8 text-gray-400" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <p className="text-sm text-gray-600 mt-1">{product.description}</p>
                              <p className="text-lg font-semibold text-primary-600 mt-2">
                                {formatCurrency(product.price)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-4">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setSelectedCategoryId(product.category_id);
                                setProductImage(product.image || '');
                                setShowProductModal(true);
                              }}
                              className="text-gray-600 hover:text-gray-700"
                              title="Editar produto"
                            >
                              <PencilIcon className="w-5 h-5" />
                            </button>
                            <button
                              className="text-red-600 hover:text-red-700"
                              title="Excluir produto"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Seção de Adicionais */}
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">Adicionais</p>
                            <button
                              onClick={() => {
                                setSelectedProductId(product.id);
                                setNewAdditionals([{ name: '', price: 0 }]);
                                setShowAdditionalModal(true);
                              }}
                              className="text-primary-600 hover:text-primary-700 flex items-center text-sm"
                            >
                              <PlusIcon className="w-4 h-4 mr-1" />
                              Adicionar
                            </button>
                          </div>
                          {product.additionals && product.additionals.length > 0 ? (
                            <div className="space-y-2">
                              {product.additionals.map((additional) => (
                                <div
                                  key={additional.id}
                                  className="flex items-center justify-between bg-white rounded-lg px-3 py-2"
                                >
                                  <div className="flex items-center">
                                    <TagIcon className="w-4 h-4 text-gray-400 mr-2" />
                                    <span className="text-sm text-gray-700">{additional.name}</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-sm font-medium text-gray-900">
                                      +{formatCurrency(additional.price)}
                                    </span>
                                    <button className="text-red-500 hover:text-red-600">
                                      <TrashIcon className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">Nenhum adicional cadastrado</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Modal de Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
              </h3>
              <button
                onClick={() => {
                  setShowCategoryModal(false);
                  setEditingCategory(null);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ex: Pizzas Especiais"
                    defaultValue={editingCategory?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Descrição da categoria (opcional)"
                    defaultValue={editingCategory?.description}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ícone</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ex: 🍕"
                    defaultValue={editingCategory?.icon}
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  {editingCategory ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Produto */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-gray-900">
                {editingProduct ? 'Editar Produto' : 'Novo Produto'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setEditingProduct(null);
                  setProductImage('');
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    placeholder="Ex: Pizza Margherita"
                    defaultValue={editingProduct?.name}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Descrição</label>
                  <textarea
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    rows={3}
                    placeholder="Ingredientes e detalhes do produto"
                    defaultValue={editingProduct?.description}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Preço</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">R$</span>
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      className="pl-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                      placeholder="0,00"
                      defaultValue={editingProduct?.price}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Imagem do Produto</label>
                  <div className="flex items-center space-x-4">
                    {productImage ? (
                      <img 
                        src={productImage} 
                        alt="Preview" 
                        className="w-24 h-24 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <PhotoIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProductImage(reader.result as string);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="product-image-upload"
                      />
                      <label
                        htmlFor="product-image-upload"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                        Escolher Imagem
                      </label>
                      {productImage && (
                        <button
                          type="button"
                          onClick={() => setProductImage('')}
                          className="ml-2 text-sm text-red-600 hover:text-red-700"
                        >
                          Remover
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setEditingProduct(null);
                    setProductImage('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  {editingProduct ? 'Salvar' : 'Criar'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de Adicional */}
      {showAdditionalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center border-b border-gray-200 px-6 py-4 sticky top-0 bg-white">
              <h3 className="text-lg font-medium text-gray-900">
                Adicionar Adicionais
              </h3>
              <button
                onClick={() => {
                  setShowAdditionalModal(false);
                  setSelectedProductId(null);
                  setNewAdditionals([{ name: '', price: 0 }]);
                }}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <form className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Adicione múltiplos adicionais de uma vez. Ex: Borda Recheada, Extra Queijo, etc.
                </p>
                
                {newAdditionals.map((additional, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Adicional {index + 1}</h4>
                      {newAdditionals.length > 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setNewAdditionals(newAdditionals.filter((_, i) => i !== index));
                          }}
                          className="text-red-600 hover:text-red-700"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Nome</label>
                        <input
                          type="text"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                          placeholder="Ex: Borda Recheada"
                          value={additional.name}
                          onChange={(e) => {
                            const updated = [...newAdditionals];
                            updated[index].name = e.target.value;
                            setNewAdditionals(updated);
                          }}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Preço</label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">R$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            className="pl-12 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                            placeholder="0,00"
                            value={additional.price}
                            onChange={(e) => {
                              const updated = [...newAdditionals];
                              updated[index].price = parseFloat(e.target.value) || 0;
                              setNewAdditionals(updated);
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={() => {
                    setNewAdditionals([...newAdditionals, { name: '', price: 0 }]);
                  }}
                  className="w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-md text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700"
                >
                  <PlusIcon className="w-5 h-5 mx-auto" />
                  Adicionar Mais Um
                </button>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAdditionalModal(false);
                    setSelectedProductId(null);
                    setNewAdditionals([{ name: '', price: 0 }]);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700"
                >
                  Salvar Adicionais
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
} 