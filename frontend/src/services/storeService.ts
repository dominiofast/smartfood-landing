import api from '../api/axios';

export interface Store {
  id: number;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip_code: string | null;
  phone: string | null;
  email: string | null;
  logo_url: string | null;
  manager_name: string | null;
  manager_email: string | null;
  manager_phone: string | null;
  opening_hours: string | null;
  description: string | null;
  status: 'active' | 'inactive' | 'pending';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  total_sales?: number;
  total_orders?: number;
  active_users?: number;
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
    // Verificar se estamos em produção (Netlify) ou desenvolvimento local
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? '/.netlify/functions/stores-crud' 
      : '/api/stores';
    
    const response = await api.get<StoresResponse>(endpoint);
    return response.data.stores;
  }

  async getStore(id: number): Promise<Store> {
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    const response = await api.get<StoreResponse>(endpoint);
    return response.data.store;
  }

  async createStore(storeData: Partial<Store>): Promise<Store> {
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? '/.netlify/functions/stores-crud' 
      : '/api/stores';
    
    const response = await api.post<StoreResponse>(endpoint, storeData);
    return response.data.store;
  }

  async updateStore(id: number, storeData: Partial<Store>): Promise<Store> {
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    const response = await api.put<StoreResponse>(endpoint, storeData);
    return response.data.store;
  }

  async deleteStore(id: number): Promise<void> {
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? `/.netlify/functions/stores-crud/${id}` 
      : `/api/stores/${id}`;
    
    await api.delete(endpoint);
  }
}

export const storeService = new StoreService();
