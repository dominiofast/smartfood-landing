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
  const [user, setUser] = useState<User | null>(() => {
    // Tenta carregar o usuário do localStorage na inicialização.
    // Isso evita o "piscar" da tela de login ao recarregar a página.
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Falha ao parsear usuário do localStorage:', error);
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Função para salvar dados do usuário no localStorage
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Erro ao salvar usuário no storage:', error);
    }
  };

  // Efeito para verificar o token e carregar/validar dados do usuário na inicialização.
  useEffect(() => {
    const validateUserSession = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        // Se já não estiver na página de login, redireciona
        if (window.location.pathname !== '/login') {
            // navigate('/login'); // Opcional: descomente para forçar redirect
        }
        return;
      }

      try {
        // Tenta buscar os dados mais recentes do usuário.
        // O interceptador da API (se houver) ou a rota protegida
        // devem lidar com um token inválido e deslogar.
        const freshUserData = await authService.getMe();
        setUser(freshUserData);
        saveUserToStorage(freshUserData);
      } catch (error: any) {
        // Se a busca falhar (ex: token expirado), desloga o usuário.
        console.error('Falha ao validar sessão, deslogando:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    validateUserSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      
      console.log('Resposta do login no contexto:', response);
      
      if (response && response.success) {
        // Garantir que o token seja armazenado corretamente
        if (response.token) {
          console.log('Armazenando token:', response.token.substring(0, 20) + '...');
          localStorage.setItem('token', response.token);
          
          // Salvar data de expiração (90 dias a partir de agora)
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + 90);
          localStorage.setItem('tokenExpiry', expiryDate.toISOString());
          
          // Verificar se o token foi armazenado corretamente
          const storedToken = localStorage.getItem('token');
          const storedExpiry = localStorage.getItem('tokenExpiry');
          console.log('Token armazenado:', storedToken ? 'Sim' : 'Não');
          console.log('Data de expiração:', storedExpiry);
          
          if (!storedToken || !storedExpiry) {
            throw new Error('Falha ao armazenar token ou data de expiração');
          }
        } else {
          console.error('Token não encontrado na resposta');
          throw new Error('Token não encontrado na resposta');
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
      // Limpar dados em caso de erro
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
      localStorage.removeItem('user');
      toast.error(error.message || error.response?.data?.error || 'Erro ao fazer login');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('tokenExpiry');
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