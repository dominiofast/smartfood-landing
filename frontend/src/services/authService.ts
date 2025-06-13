import api from '../api/axios';
import { User, LoginCredentials, AuthResponse } from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Verificar se estamos em produção (Netlify) ou desenvolvimento local
    const endpoint = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1' 
      ? '/.netlify/functions/auth-login' 
      : '/auth/login';
    
    const response = await api.post<AuthResponse>(endpoint, credentials);
    return response.data;
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    storeId?: string;
  }): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', userData);
    return response.data;
  }

  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; data: User }>('/auth/me');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put<{ success: boolean; data: User }>('/auth/updateprofile', data);
    return response.data.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await api.put('/auth/updatepassword', {
      currentPassword,
      newPassword,
    });
  }

  async logout(): Promise<void> {
    await api.get('/auth/logout');
  }

  async createSuperAdmin(): Promise<User> {
    const response = await api.post<{ success: boolean; data: User }>('/auth/create-superadmin');
    return response.data.data;
  }
}

export const authService = new AuthService(); 