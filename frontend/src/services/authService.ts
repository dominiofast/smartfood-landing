import axios, { AxiosInstance } from 'axios';
import { User, LoginCredentials, AuthResponse } from '../types';

// Define a URL base da API usando a variável de ambiente do Vite
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

class AuthService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000, // 10 segundos
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true, // Importante para cookies de sessão
    });

    // Interceptor para adicionar o token em todas as requisições
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar erros de resposta
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('Erro na requisição:', error);

        if (!error.response) {
          // Erro de rede ou timeout
          throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.');
        }

        const { status, data } = error.response;

        switch (status) {
          case 401:
            // Limpa dados de autenticação e redireciona para login
            this.clearAuthData();
            throw new Error('Sessão expirada. Por favor, faça login novamente.');
          case 403:
            throw new Error('Acesso negado. Você não tem permissão para acessar este recurso.');
          case 404:
            throw new Error('Recurso não encontrado.');
          case 500:
            throw new Error('Erro interno do servidor. Por favor, tente novamente mais tarde.');
          default:
            throw new Error(data?.message || `Erro ${status}: Ocorreu um problema inesperado.`);
        }
      }
    );
  }

  // Função para verificar se há token válido
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    // Verifica se o token está expirado
    const tokenExpiry = localStorage.getItem('tokenExpiry');
    if (tokenExpiry) {
      const expiryDate = new Date(tokenExpiry);
      if (expiryDate < new Date()) {
        this.clearAuthData();
        return false;
      }
    }

    return true;
  }

  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  private clearAuthData(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
    localStorage.removeItem('user');
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('Tentando fazer login com:', { email: credentials.email });
      
      const { data } = await this.api.post<AuthResponse>('/auth/login', credentials);
      
      if (data.token) {
        localStorage.setItem('token', data.token);
        
        // Salva data de expiração (90 dias)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 90);
        localStorage.setItem('tokenExpiry', expiryDate.toISOString());
        
        // Salva dados do usuário
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      console.log('Login bem-sucedido:', data);
      return data;
    } catch (error) {
      console.error('Erro durante o login:', error);
      throw error;
    }
  }

  async getMe(): Promise<User> {
    try {
      const { data } = await this.api.get<{ success: boolean; data: User }>('/auth/me');
      return data.data;
    } catch (error) {
      this.clearAuthData();
      throw error;
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    const { data } = await this.api.put<{ success: boolean; data: User }>('/auth/updateprofile', userData);
    return data.data;
  }

  async logout(): Promise<void> {
    try {
      await this.api.post('/auth/logout');
    } catch (error) {
      console.warn('Erro ao fazer logout no servidor:', error);
    } finally {
      this.clearAuthData();
    }
  }

  async register(userData: any): Promise<AuthResponse> {
    return this.api.post('/auth/register', userData);
  }

  async updatePassword(currentPassword: string, newPassword: string): Promise<void> {
    await this.api.put('/auth/updatepassword', { currentPassword, newPassword });
  }

  async createSuperAdmin(): Promise<User> {
    const { data } = await this.api.post<{ success: boolean; data: User }>('/auth/create-superadmin');
    return data.data;
  }
}

export const authService = new AuthService(); 