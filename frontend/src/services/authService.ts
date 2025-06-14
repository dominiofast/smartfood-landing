import api from '../api/axios';
import { User, LoginCredentials, AuthResponse } from '../types';

class AuthService {
  // Função para verificar se há token válido
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Função para obter o token
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      // Verificar se estamos usando Netlify Dev (porta 8888) ou desenvolvimento puro (porta 3000)
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      const endpoint = (isNetlifyDev || isProduction)
        ? '/.netlify/functions/auth-login' 
        : '/auth/login';
      
      console.log('Fazendo login em:', endpoint);
      console.log('Dados enviados:', credentials);
      console.log('Porta atual:', window.location.port);
      console.log('Hostname atual:', window.location.hostname);
      
      // Fazer a requisição diretamente para garantir que recebemos a resposta correta
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
      
      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', response.headers);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Resposta do login:', data);
      
      return data;
    } catch (error) {
      console.error('Erro no serviço de login:', error);
      throw error;
    }
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
    try {
      // Verificar se estamos usando Netlify Dev (porta 8888) ou desenvolvimento puro (porta 3000)
      const isNetlifyDev = window.location.port === '8888';
      const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      
      const endpoint = (isNetlifyDev || isProduction)
        ? '/.netlify/functions/auth-me' 
        : '/auth/me';
      
      console.log('Fazendo getMe em:', endpoint);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }
      
      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          throw new Error('Token inválido ou expirado');
        }
        const errorData = await response.json();
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('Resposta do getMe:', data);
      
      // Retornar o user dependendo da estrutura da resposta
      return data.data || data.user || data;
    } catch (error) {
      console.error('Erro no getMe:', error);
      throw error;
    }
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