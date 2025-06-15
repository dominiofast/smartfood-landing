import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  PhotoIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  PlusIcon,
  SwatchIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

interface Banner {
  id: number;
  image: string;
  title: string;
  description: string;
}

interface BrandColors {
  primary: string;
  secondary: string;
  accent: string;
}

export default function DigitalMenuSettings() {
  const { user } = useAuth();
  const [logo, setLogo] = useState<string>('');
  const [banners, setBanners] = useState<Banner[]>([]);
  const [brandColors, setBrandColors] = useState<BrandColors>({
    primary: '#dc2626',
    secondary: '#1f2937',
    accent: '#f59e0b'
  });
  const [saved, setSaved] = useState(false);

  // Carregar configurações salvas ao montar o componente
  useEffect(() => {
    if (!user?.store?.id) return;
    
    const storeId = String(user.store.id); // Garantir que seja string
    const storageKey = `storeDigitalMenuSettings_${storeId}`;
    const savedSettings = localStorage.getItem(storageKey);
    
    console.log('Carregando configurações para loja:', storeId);
    console.log('Chave de storage:', storageKey);
    console.log('Configurações encontradas:', savedSettings ? 'Sim' : 'Não');
    
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        console.log('Configurações carregadas:', settings);
        if (settings.logo) setLogo(settings.logo);
        if (settings.banners) setBanners(settings.banners);
        if (settings.colors) setBrandColors(settings.colors);
      } catch (error) {
        console.error('Erro ao carregar configurações:', error);
      }
    }
  }, [user]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && banners.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newBanner: Banner = {
          id: Date.now(),
          image: reader.result as string,
          title: '',
          description: ''
        };
        setBanners([...banners, newBanner]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBanner = (id: number, field: 'title' | 'description', value: string) => {
    setBanners(banners.map(banner => 
      banner.id === id ? { ...banner, [field]: value } : banner
    ));
  };

  const removeBanner = (id: number) => {
    setBanners(banners.filter(banner => banner.id !== id));
  };

  const handleSave = () => {
    if (!user?.store?.id) {
      console.error('Usuário não tem loja associada');
      return;
    }
    
    const storeId = String(user.store.id); // Garantir que seja string
    
    // Salvar no localStorage com ID da loja
    const settings = {
      logo,
      banners,
      colors: brandColors,
      storeId: storeId,
      storeName: user.store.name || 'Minha Loja',
      updatedAt: new Date().toISOString()
    };
    
    const storageKey = `storeDigitalMenuSettings_${storeId}`;
    localStorage.setItem(storageKey, JSON.stringify(settings));
    
    // Também salvar uma chave geral para o cardápio digital público
    localStorage.setItem('currentStoreId', storeId);
    
    console.log('Salvando configurações para loja:', storeId);
    console.log('Chave de storage:', storageKey);
    console.log('Configurações salvas:', settings);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const predefinedColors = [
    { name: 'Vermelho', value: '#dc2626' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Roxo', value: '#9333ea' },
    { name: 'Laranja', value: '#f59e0b' },
    { name: 'Rosa', value: '#ec4899' },
    { name: 'Cinza', value: '#6b7280' },
    { name: 'Preto', value: '#000000' }
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Configurações do Cardápio Digital</h1>
          <p className="text-gray-600 mt-1">
            Personalize a aparência do seu cardápio digital
          </p>
        </div>

        {/* Logo Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Logo da Marca</h2>
          <div className="flex items-center space-x-6">
            <div className="flex-shrink-0">
              {logo ? (
                <img
                  src={logo}
                  alt="Logo"
                  className="w-32 h-32 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                  <PhotoIcon className="w-12 h-12 text-gray-400" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
                id="logo-upload"
              />
              <label
                htmlFor="logo-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <ArrowUpTrayIcon className="w-5 h-5 mr-2" />
                {logo ? 'Alterar Logo' : 'Enviar Logo'}
              </label>
              <p className="text-sm text-gray-500 mt-2">
                Recomendado: Imagem quadrada, mínimo 512x512px
              </p>
            </div>
          </div>
        </div>

        {/* Banners Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Banners do Carrossel</h2>
            <span className="text-sm text-gray-500">{banners.length}/3 banners</span>
          </div>

          <div className="space-y-4">
            {banners.map((banner) => (
              <div key={banner.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start space-x-4">
                  <img
                    src={banner.image}
                    alt="Banner"
                    className="w-40 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1 space-y-3">
                    <input
                      type="text"
                      placeholder="Título do banner"
                      value={banner.title}
                      onChange={(e) => updateBanner(banner.id, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                    <textarea
                      placeholder="Descrição do banner"
                      value={banner.description}
                      onChange={(e) => updateBanner(banner.id, 'description', e.target.value)}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <button
                    onClick={() => removeBanner(banner.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}

            {banners.length < 3 && (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBannerUpload}
                  className="hidden"
                  id="banner-upload"
                />
                <label
                  htmlFor="banner-upload"
                  className="cursor-pointer flex flex-col items-center"
                >
                  <PlusIcon className="w-12 h-12 text-gray-400 mb-2" />
                  <span className="text-sm font-medium text-gray-700">Adicionar Banner</span>
                  <span className="text-xs text-gray-500 mt-1">Recomendado: 1920x600px</span>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Brand Colors Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Cores da Marca</h2>
          
          <div className="space-y-6">
            {/* Cor Primária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Primária (Botões e destaques)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={brandColors.primary}
                  onChange={(e) => setBrandColors({ ...brandColors, primary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <div className="flex space-x-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBrandColors({ ...brandColors, primary: color.value })}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 relative"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {brandColors.primary === color.value && (
                        <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cor Secundária */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor Secundária (Textos e fundos)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={brandColors.secondary}
                  onChange={(e) => setBrandColors({ ...brandColors, secondary: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <div className="flex space-x-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBrandColors({ ...brandColors, secondary: color.value })}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 relative"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {brandColors.secondary === color.value && (
                        <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Cor de Destaque */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cor de Destaque (Badges e alertas)
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={brandColors.accent}
                  onChange={(e) => setBrandColors({ ...brandColors, accent: e.target.value })}
                  className="h-10 w-20 rounded cursor-pointer"
                />
                <div className="flex space-x-2">
                  {predefinedColors.map((color) => (
                    <button
                      key={color.value}
                      onClick={() => setBrandColors({ ...brandColors, accent: color.value })}
                      className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400 relative"
                      style={{ backgroundColor: color.value }}
                      title={color.name}
                    >
                      {brandColors.accent === color.value && (
                        <CheckIcon className="w-4 h-4 text-white absolute inset-0 m-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-3">Pré-visualização</p>
            <div className="flex items-center space-x-4">
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: brandColors.primary }}
              >
                Botão Primário
              </button>
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: brandColors.secondary }}
              >
                Botão Secundário
              </button>
              <span
                className="px-3 py-1 rounded-full text-white text-sm font-medium"
                style={{ backgroundColor: brandColors.accent }}
              >
                Destaque
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 flex items-center"
          >
            {saved ? (
              <>
                <CheckIcon className="w-5 h-5 mr-2" />
                Salvo com Sucesso
              </>
            ) : (
              <>
                <SwatchIcon className="w-5 h-5 mr-2" />
                Salvar Configurações
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  );
}
