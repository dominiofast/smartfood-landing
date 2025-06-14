import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LoginCredentials, AuthResponse } from '../types';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextData {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para salvar dados do usuário no localStorage
  const saveUserToStorage = (userData: User) => {
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // Função para recuperar dados do usuário do localStorage
  const getUserFromStorage = (): User | null => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Erro ao recuperar usuário do storage:', error);
      localStorage.removeItem('user');
      return null;
    }
  };

  const loadUser = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Token encontrado:', token ? 'Sim' : 'Não');
      
      if (token) {
        // Primeiro, tenta carregar o usuário do storage local como fallback
        const cachedUser = getUserFromStorage();
        if (cachedUser) {
          console.log('Usuário encontrado no cache local:', cachedUser);
          setUser(cachedUser);
        }
        
        // Depois tenta atualizar com dados do servidor
        try {
          console.log('Tentando carregar dados atualizados do usuário...');
          const userData = await authService.getMe();
          console.log('Dados do usuário carregados do servidor:', userData);
          setUser(userData);
          saveUserToStorage(userData); // Atualiza o cache
        } catch (serverError: any) {
          console.error('Erro ao carregar do servidor:', serverError);
          
          // Se falhou no servidor mas temos cache, usa o cache
          if (cachedUser) {
            console.log('Usando dados do cache devido ao erro do servidor');
            // Verifica apenas se o erro é relacionado ao token
            if (serverError.message?.includes('Token inválido') || serverError.message?.includes('401')) {
              console.log('Token inválido, removendo tudo do localStorage');
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setUser(null);
            }
          } else {
            // Sem cache e sem servidor, remove tudo
            console.log('Sem cache e erro no servidor, removendo token');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } else {
        console.log('Nenhum token encontrado, usuário não logado');
        // Remove dados antigos se não há token
        localStorage.removeItem('user');
      }
    } catch (error: any) {
      console.error('Erro geral ao carregar usuário:', error);
      // Em caso de erro geral, limpa tudo
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []); // useCallback

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      
      console.log('Resposta do login no contexto:', response);
      
      if (response && response.success) {
        // Garantir que o token seja armazenado corretamente
        if (response.token) {
          console.log('Armazenando token:', response.token.substring(0, 20) + '...');
          localStorage.setItem('token', response.token);
          
          // Verificar se o token foi armazenado corretamente
          const storedToken = localStorage.getItem('token');
          console.log('Token armazenado:', storedToken ? 'Sim' : 'Não');
        } else {
          console.error('Token não encontrado na resposta');
        }
        
        // Atualizar o estado do usuário e salvar no cache
        setUser(response.user);
        saveUserToStorage(response.user);
        
        // Redirect based on role
        if (response.user.role === 'superadmin') {
          console.log('Redirecionando para /superadmin');
          navigate('/superadmin');
        } else if (response.user.role === 'manager') {
          navigate('/manager');
        } else {
          navigate('/dashboard');
        }
        
        toast.success(`Bem-vindo, ${response.user.name}!`);
      } else {
        console.error('Resposta de login inválida:', response);
        toast.error('Resposta de login inválida');
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      toast.error(error.message || error.response?.data?.error || 'Erro ao fazer login');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    toast.success('Logout realizado com sucesso');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
      saveUserToStorage(updatedUser); // Atualiza o cache
      toast.success('Perfil atualizado com sucesso');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Erro ao atualizar perfil');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
}; 