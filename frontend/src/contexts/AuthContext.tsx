import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const userData = await authService.getMe();
        setUser(userData);
      }
    } catch (error) {
      console.error('Error loading user:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

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
        
        // Atualizar o estado do usuário
        setUser(response.user);
        
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
    setUser(null);
    navigate('/login');
    toast.success('Logout realizado com sucesso');
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
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