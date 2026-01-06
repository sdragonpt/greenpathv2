import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState, AuthContextType, LoginCredentials, SignupCredentials } from '@/types/auth';
import { STORAGE_KEYS } from '@/lib/constants';
import { generateId } from '@/lib/utils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data for demo
const createMockUser = (email: string, name: string): User => ({
  id: generateId(),
  email,
  name,
  avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
  createdAt: new Date(),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser) as User;
        user.createdAt = new Date(user.createdAt);
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState({ user: null, isAuthenticated: false, isLoading: false });
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!credentials.email.includes('@') || credentials.password.length < 4) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error('Credenciais inválidas');
    }

    const user = createMockUser(credentials.email, credentials.email.split('@')[0]);
    
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const signup = async (credentials: SignupCredentials): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Mock validation
    if (!credentials.email.includes('@')) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error('Email inválido');
    }
    if (credentials.password.length < 6) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error('A password deve ter pelo menos 6 caracteres');
    }
    if (credentials.password !== credentials.confirmPassword) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw new Error('As passwords não coincidem');
    }

    const user = createMockUser(credentials.email, credentials.name);
    
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const loginWithGoogle = async (): Promise<void> => {
    setState((prev) => ({ ...prev, isLoading: true }));

    // Simulate Google OAuth
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const user = createMockUser('user@gmail.com', 'Utilizador Google');
    
    localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    setState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        signup,
        loginWithGoogle,
        logout,
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
