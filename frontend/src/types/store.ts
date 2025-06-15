// Interface para Store
export interface Store {
  id: string;
  name: string;
  description?: string;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  whatsappApi?: {
    controlId?: string;
    host?: string;
    instanceKey?: string;
    token?: string;
    webhook?: string;
    isConnected?: boolean;
    lastConnection?: Date;
    qrCode?: string;
  };
  isActive: boolean;
  createdAt: string;
}

// Interface para formato legado da Store
export interface LegacyStore {
  id: string;
  name: string;
  description?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  logo_url?: string;
  is_active?: boolean;
  created_at?: string;
  contact_phone?: string;
  contact_email?: string;
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_zip_code?: string;
  images_logo?: string;
}

// Interface simplificada para Store
export interface SimpleStore extends LegacyStore {
  contact?: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  whatsappApi?: {
    controlId?: string;
    host?: string;
    instanceKey?: string;
    token?: string;
    webhook?: string;
    isConnected?: boolean;
    lastConnection?: Date;
    qrCode?: string;
  };
}

// Tipo para o formulário de edição de Store
export interface EditStoreFormData {
  name: string;
  description?: string;
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  address: {
    street: string;
    number?: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  whatsappApi: {
    controlId?: string;
    host?: string;
    instanceKey?: string;
    token?: string;
    webhook?: string;
  };
} 