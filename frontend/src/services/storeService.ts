import api from '../api/axios';

export interface Store {
  id: string; // UUID
  name: string;
  slug: string;
  description?: string | null;
  
  // Address
  address_street?: string | null;
  address_number?: string | null;
  address_complement?: string | null;
  address_neighborhood?: string | null;
  address_city?: string | null;
  address_state?: string | null;
  address_zip_code?: string | null;
  
  // Contact
  contact_phone: string;
  contact_whatsapp?: string | null;
  contact_email: string;
  
  // Business
  business_cnpj?: string | null;
  business_type: string;
  
  // Images
  images_logo?: string | null;
  images_cover?: string | null;
  
  // Status
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  
  // Campos de compatibilidade (mapeados dos campos do banco)
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip_code?: string | null;
  phone?: string | null;
  email?: string | null;
  logo_url?: string | null;
}

export interface StoreResponse {
  success: boolean;
  store: Store;
}

export interface StoresResponse {
  success: boolean;
  stores: Store[];
}

class StoreService {
  async getStores(): Promise<Store[]> {
    // Verificar se estamos usando Netlify Dev (porta 8888) ou desenvolvimento puro (porta 3000)
    const isNetlifyDev = window.location.port === '8888';
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    const endpoint = (isNetlifyDev || isProduction)
      ? '/.netlify/functions/stores-crud' 
      : '/api/stores';
    
    const response = await api.get<StoresResponse>(endpoint);
    return response.data.stores;
  }

  async getStore(id: string): Promise<Store> {
    const isNetlifyDev = window.location.port === '8888';
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    const endpoint = (isNetlifyDev || isProduction)
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    const response = await api.get<StoreResponse>(endpoint);
    return response.data.store;
  }

  async createStore(storeData: { name: string; phone: string; email: string } | Partial<Store>): Promise<Store> {
    const isNetlifyDev = window.location.port === '8888';
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    const endpoint = (isNetlifyDev || isProduction)
      ? '/.netlify/functions/stores-crud' 
      : '/api/stores';
    
    // Se for dados básicos, expandir para incluir campos obrigatórios
    let dataToSend = storeData;
    if ('name' in storeData && 'phone' in storeData && 'email' in storeData && Object.keys(storeData).length === 3) {
      dataToSend = {
        name: storeData.name,
        phone: storeData.phone,
        email: storeData.email,
        address: '',
        city: '',
        state: 'SP',
        zip_code: '00000-000',
        logo_url: null
      };
    }
    
    console.log('Enviando dados para API:', dataToSend);
    
    const response = await api.post<StoreResponse>(endpoint, dataToSend);
    return response.data.store;
  }

  async updateStore(id: string, storeData: Partial<Store>): Promise<Store> {
    const isNetlifyDev = window.location.port === '8888';
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    const endpoint = (isNetlifyDev || isProduction)
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    const response = await api.put<StoreResponse>(endpoint, storeData);
    return response.data.store;
  }

  async deleteStore(id: string): Promise<void> {
    const isNetlifyDev = window.location.port === '8888';
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    
    const endpoint = (isNetlifyDev || isProduction)
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    await api.delete(endpoint);
  }
}

export const storeService = new StoreService();
