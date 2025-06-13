// User Types
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager' | 'employee';
  store?: Store;
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
}

// Store Types
export interface Store {
  id: string;
  name: string;
  slug: string;
  description?: string;
  address: Address;
  contact: ContactInfo;
  businessInfo: BusinessInfo;
  settings: StoreSettings;
  subscription: Subscription;
  stats: StoreStats;
  images: StoreImages;
  socialMedia?: SocialMedia;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number?: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface ContactInfo {
  phone: string;
  whatsapp?: string;
  email: string;
}

export interface BusinessInfo {
  cnpj?: string;
  type: 'restaurant' | 'bar' | 'cafe' | 'bakery' | 'pizzeria' | 'other';
  operatingHours: OperatingHour[];
  tables?: number;
  capacity?: number;
}

export interface OperatingHour {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

export interface StoreSettings {
  currency: string;
  timezone: string;
  language: string;
  acceptsOnlineOrders: boolean;
  acceptsReservations: boolean;
  deliveryEnabled: boolean;
  deliveryRadius?: number;
  minimumOrderValue?: number;
}

export interface Subscription {
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  status: 'active' | 'inactive' | 'suspended' | 'cancelled';
  startDate: Date;
  endDate?: Date;
  features: string[];
}

export interface StoreStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  activeUsers?: number;
}

export interface StoreImages {
  logo?: string;
  cover?: string;
  gallery?: string[];
}

export interface SocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

// AI Types
export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    intent?: string;
    confidence?: number;
    suggestions?: string[];
  };
}

export interface AIAnalysis {
  id: string;
  type: 'sales' | 'inventory' | 'customer' | 'financial' | 'operational';
  title: string;
  summary: string;
  insights: AIInsight[];
  recommendations: AIRecommendation[];
  data?: any;
  createdAt: Date;
}

export interface AIInsight {
  id: string;
  title: string;
  description: string;
  impact: 'high' | 'medium' | 'low';
  metric?: {
    value: number;
    unit: string;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface AIRecommendation {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  estimatedImpact?: string;
  actionItems: string[];
}

// Dashboard Types
export interface DashboardStats {
  overview: {
    totalStores: number;
    activeStores: number;
    totalUsers: number;
    activeUsers: number;
    totalRevenue?: number;
    averageRating?: number;
  };
  charts: {
    salesTrend: ChartData[];
    storesByPlan: PieChartData[];
    userActivity: ChartData[];
  };
  recentActivities: Activity[];
}

export interface ChartData {
  date: string;
  value: number;
  label?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  percentage?: number;
}

export interface Activity {
  id: string;
  type: 'store_created' | 'user_added' | 'order_placed' | 'ai_analysis';
  description: string;
  timestamp: Date;
  user?: string;
  metadata?: any;
}

// Report Types
export interface Report {
  id: string;
  type: 'sales' | 'inventory' | 'financial' | 'operational' | 'custom';
  title: string;
  description?: string;
  period: {
    start: Date;
    end: Date;
  };
  data: any;
  aiAnalysis?: AIAnalysis;
  createdAt: Date;
  createdBy: string;
} 