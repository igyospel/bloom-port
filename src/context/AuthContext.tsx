import React, { createContext, useContext, useState, useEffect } from 'react';

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string) => void;
  signup: (email: string, name: string) => void;
  logout: () => void;
  updateUserPfp: (pfpUrl: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('bloomport-user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('bloomport-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('bloomport-user');
    }
  }, [user]);

  const login = (email: string) => {
    // Generate a default display name based on email prefix
    const prefix = email.split('@')[0];
    const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    
    // Assign a beautiful default avatar from Unsplash
    const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80`;
    
    setUser({ email, name, avatarUrl });
  };

  const signup = (email: string, name: string) => {
    const avatarUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80`;
    setUser({ email, name, avatarUrl });
  };

  const logout = () => {
    setUser(null);
  };

  const updateUserPfp = (pfpUrl: string) => {
    setUser((prev) => prev ? { ...prev, avatarUrl: pfpUrl } : null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, updateUserPfp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
