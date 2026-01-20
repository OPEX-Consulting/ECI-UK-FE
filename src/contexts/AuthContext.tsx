import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, HARDCODED_USERS } from '@/types/incident';
import { getCurrentUser, setCurrentUser as storeUser } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const storedUser = getCurrentUser();
    if (storedUser) {
      setUser(storedUser);
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const foundUser = HARDCODED_USERS.find(
      u => u.email.toLowerCase() === email.toLowerCase()
    );

    if (!foundUser) {
      return { success: false, error: 'Invalid email address. Access denied.' };
    }

    // For MVP, any password works for hardcoded users
    if (password.length < 1) {
      return { success: false, error: 'Please enter a password.' };
    }

    setUser(foundUser);
    storeUser(foundUser);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    storeUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
