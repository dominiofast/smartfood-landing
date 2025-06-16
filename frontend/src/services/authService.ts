import { User, LoginCredentials, AuthResponse } from '../types';

// Define a URL base da API usando a variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class AuthService {
  // Função para verificar se há token válido
  isAuthenticated(): boolean {
    const token = localStorage.getItem('token');
    return !!token;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = this.getToken();

    const headers: { [key: string]: string } = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, { ...options, headers });
      
      // Verifica o Content-Type da resposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Servidor retornou uma resposta inválida. Por favor, tente novamente.');
      }

      const data = await response.json();

      if (!response.ok) {
        // Se o servidor retornou um erro em formato JSON
        throw new Error(data.error || data.message || 'Ocorreu um erro na requisição.');
      }
      return data;
    } catch (error: any) {
      console.error(`Erro na requisição para ${url}:`, error);
      
      // Se o erro for de parsing JSON, significa que recebemos HTML ou outro formato
      if (error instanceof SyntaxError) {
        throw new Error('Não foi possível conectar ao servidor. Por favor, verifique sua conexão.');
      }
      
      throw error;
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async getMe(): Promise<User> {
    try {
      const response = await this.request<{ success: boolean; data: User }>('/auth/me');
      return response.data;
    } catch (error) {
      // Se a sessão for inválida, limpa o localStorage para evitar loops.
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      throw error;
    }
  }

  async register(userData: any): Promise<AuthResponse> {
    return this.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
    });
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.request<{ success: boolean; data: User }>('/auth/updateprofile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.request('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async logout(): Promise<void> {
    // A rota de logout pode não existir ou não ser necessária se o logout for só no frontend
    try {
        await this.request('/auth/logout', { method: 'GET' });
    } catch (error) {
        console.warn("Chamada para /auth/logout falhou (isso pode ser esperado).", error);
    }
  }

  async createSuperAdmin(): Promise<User> {
    const response = await this.request<{ success: boolean, data: User }>('/auth/create-superadmin', { method: 'POST' });
    return response.data;
  }
}

export const authService = new AuthService(); 