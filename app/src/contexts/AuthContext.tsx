import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthUser {
  username: string;
  authenticated: boolean;
  timestamp: number;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (username: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Check localStorage for existing auth
    const stored = localStorage.getItem('marketplace_auth');
    if (stored) {
      try {
        const authData = JSON.parse(stored);
        // Check if auth is less than 24 hours old
        if (Date.now() - authData.timestamp < 24 * 60 * 60 * 1000) {
          setUser(authData);
        } else {
          localStorage.removeItem('marketplace_auth');
        }
      } catch (e) {
        localStorage.removeItem('marketplace_auth');
      }
    }
  }, []);

  const login = (username: string) => {
    const authData: AuthUser = {
      username,
      authenticated: true,
      timestamp: Date.now()
    };
    setUser(authData);
    localStorage.setItem('marketplace_auth', JSON.stringify(authData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('marketplace_auth');
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      logout
    }}>
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
