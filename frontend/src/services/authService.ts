import { User, LoginCredentials, AuthResponse } from '../types';

// Define a URL base da API de forma centralizada
// Em produção, as requisições serão relativas (ex: /api/auth/login)
// e o Netlify se encarregará do redirecionamento.
// Em desenvolvimento, o proxy do package.json (se houver) ou a configuração
// do axios deve apontar para o backend (ex: http://localhost:5000/api)
const API_BASE_URL = '/api';

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
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Ocorreu um erro na requisição.');
      }
      return data;
    } catch (error) {
      console.error(`Erro na requisição para ${url}:`, error);
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