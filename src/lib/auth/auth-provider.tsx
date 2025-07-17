'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, LoginForm, RegisterForm } from '@/types';
import { authApi } from './auth-api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: LoginForm) => Promise<void>;
  register: (userData: RegisterForm) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginForm) => {
    try {
      const response = await authApi.login(credentials);
      console.log('Réponse login:', response);
      console.log('Setting user:', response.user);
      setUser(response.user);
      
      // Sauvegarder le token si présent
      if (response.token) {
        console.log('Saving token:', response.token);
        // Utiliser localStorage pour le dev
        localStorage.setItem('auth-token', response.token);
      }
      
      console.log('Attempting redirect to /');
      // Utiliser window.location en fallback si router.push ne marche pas
      setTimeout(() => {
        if (window.location.pathname.includes('/auth')) {
          console.log('Router.push failed, using window.location');
          window.location.href = '/';
        }
      }, 100);
      
      router.push('/');
    } catch (error) {
      console.error('Erreur login:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterForm) => {
    try {
      const response = await authApi.register(userData);
      console.log('Réponse register:', response);
      console.log('Setting user:', response.user);
      setUser(response.user);
      
      // Sauvegarder le token si présent
      if (response.token) {
        console.log('Saving token:', response.token);
        localStorage.setItem('auth-token', response.token);
      }
      
      console.log('Attempting redirect to /');
      // Utiliser window.location en fallback si router.push ne marche pas
      setTimeout(() => {
        if (window.location.pathname.includes('/auth')) {
          console.log('Router.push failed, using window.location');
          window.location.href = '/';
        }
      }, 100);
      
      router.push('/');
    } catch (error) {
      console.error('Erreur register:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
      setUser(null);
      router.push('/auth/login');
    } catch (error) {
      // Even if logout fails, clear local state
      setUser(null);
      router.push('/auth/login');
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.me();
      setUser(userData);
    } catch (error) {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}