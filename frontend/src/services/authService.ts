import { User, LoginCredentials, AuthResponse } from '../types';

// Define a URL base da API usando a variável de ambiente do Vite
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
      'Accept': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      console.log(`Fazendo requisição para: ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include', // Importante para cookies de sessão
      });
      
      // Log da resposta para debug
      console.log(`Status da resposta: ${response.status}`);
      console.log(`Headers da resposta:`, Object.fromEntries(response.headers.entries()));

      // Verifica se a resposta é um erro de rede
      if (!response.ok) {
        // Tenta ler o corpo da resposta
        let errorData;
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { message: 'Erro desconhecido no servidor' };
        }

        // Tratamento específico por status
        switch (response.status) {
          case 401:
            throw new Error('Não autorizado. Por favor, faça login novamente.');
          case 403:
            throw new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
          case 404:
            throw new Error('Recurso não encontrado.');
          case 500:
            throw new Error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
          default:
            throw new Error(errorData.message || `Erro ${response.status}: ${response.statusText}`);
        }
      }

      // Verifica o Content-Type da resposta
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Resposta inválida do servidor. Esperava JSON.');
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error(`Erro na requisição para ${url}:`, error);
      
      // Se for um erro de rede (sem conexão)
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet.');
      }
      
      // Se for um erro de parsing JSON
      if (error instanceof SyntaxError) {
        throw new Error('Resposta inválida do servidor.');
      }
      
      // Propaga o erro original ou uma mensagem amigável
      throw error.message ? error : new Error('Ocorreu um erro inesperado.');
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Tentando fazer login com:', { email: credentials.email, password: '***' });
      
      const response = await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      });

      console.log('Resposta do login:', response);
      return response;
    } catch (error: any) {
      console.error('Erro durante o login:', error);
      throw error;
    }
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