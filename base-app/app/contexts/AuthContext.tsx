'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  userAddress: string | null;
  login: (address: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing authentication on mount
    const storedAuth = localStorage.getItem('calimero-auth');
    if (storedAuth) {
      try {
        const authData = JSON.parse(storedAuth);
        if (authData.address && authData.timestamp) {
          // Check if auth is not expired (24 hours)
          const isExpired = Date.now() - authData.timestamp > 24 * 60 * 60 * 1000;
          if (!isExpired) {
            setIsAuthenticated(true);
            setUserAddress(authData.address);
          } else {
            localStorage.removeItem('calimero-auth');
          }
        }
      } catch (error) {
        console.error('Error parsing stored auth:', error);
        localStorage.removeItem('calimero-auth');
      }
    }
  }, []);

  const login = (address: string) => {
    setIsAuthenticated(true);
    setUserAddress(address);
    localStorage.setItem('calimero-auth', JSON.stringify({
      address,
      timestamp: Date.now()
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUserAddress(null);
    localStorage.removeItem('calimero-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, userAddress, login, logout }}>
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
