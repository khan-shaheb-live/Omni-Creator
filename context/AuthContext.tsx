import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import * as authService from '../services/authService';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (name: string, email: string, pass: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  usageCount: number;
  incrementUsage: () => void;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usageCount, setUsageCount] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    // Check for existing session
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
    
    // Load usage count
    const storedUsage = localStorage.getItem('omnicreator_guest_usage');
    if (storedUsage) {
      setUsageCount(parseInt(storedUsage, 10));
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    const user = authService.loginUser(email, pass);
    setUser(user);
    setShowAuthModal(false);
  };

  const register = async (name: string, email: string, pass: string) => {
    const user = authService.registerUser(name, email, pass);
    setUser(user);
    setShowAuthModal(false);
  };

  const logout = () => {
    authService.logoutUser();
    setUser(null);
  };

  const incrementUsage = () => {
    const newCount = usageCount + 1;
    setUsageCount(newCount);
    localStorage.setItem('omnicreator_guest_usage', newCount.toString());
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      isLoading,
      usageCount,
      incrementUsage,
      showAuthModal,
      setShowAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};