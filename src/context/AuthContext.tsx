import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<{ error: any }>;
  signup: (email: string, name: string, password?: string) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUserPfp: (pfpUrl: string) => Promise<void>;
  updateProfile: (name: string, pfpUrl?: string) => Promise<{ error: any }>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if credentials are placeholders
const isConfigured = 
  import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-id');

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // ── MOCK SYSTEM FALLBACKS (If Supabase is not configured yet) ──
  const loadMockUser = () => {
    const saved = localStorage.getItem('bloomport-user');
    return saved ? JSON.parse(saved) : null;
  };

  useEffect(() => {
    if (!isConfigured) {
      setUser(loadMockUser());
    }
  }, []);

  // ── REAL SUPABASE AUTH SYSTEM ──
  useEffect(() => {
    if (!isConfigured) return;

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Fetch additional profile data
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', session.user.id)
            .single();

          setUser({
            email: session.user.email || '',
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            avatarUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string) => {
    if (!isConfigured) {
      // Mock Login
      const prefix = email.split('@')[0];
      const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80`;
      const newUser = { email, name, avatarUrl };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: password || '',
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const signup = async (email: string, name: string, password?: string) => {
    if (!isConfigured) {
      // Mock Signup
      const avatarUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80`;
      const newUser = { email, name, avatarUrl };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password: password || '',
        options: {
          data: {
            name,
          },
        },
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const loginWithGoogle = async () => {
    if (!isConfigured) {
      // Mock Google Login
      return login('google.user@gmail.com');
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const logout = async () => {
    if (!isConfigured) {
      setUser(null);
      localStorage.removeItem('bloomport-user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateUserPfp = async (pfpUrl: string) => {
    if (!user) return;
    
    const updatedUser = { ...user, avatarUrl: pfpUrl };
    setUser(updatedUser);

    if (!isConfigured) {
      localStorage.setItem('bloomport-user', JSON.stringify(updatedUser));
      return;
    }

    const { data: { user: authUser } } = await supabase.auth.getUser();
    if (authUser) {
      await supabase
        .from('profiles')
        .update({ avatar_url: pfpUrl })
        .eq('id', authUser.id);
    }
  };

  const updateProfile = async (name: string, pfpUrl?: string) => {
    if (!user) return { error: new Error('User not logged in') };
    
    const updatedUser = { ...user, name, ...(pfpUrl ? { avatarUrl: pfpUrl } : {}) };
    setUser(updatedUser);

    if (!isConfigured) {
      localStorage.setItem('bloomport-user', JSON.stringify(updatedUser));
      return { error: null };
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const updates: any = { name };
        if (pfpUrl) updates.avatar_url = pfpUrl;
        
        const { error } = await supabase
          .from('profiles')
          .update(updates)
          .eq('id', authUser.id);
        
        if (error) throw error;
      }
      return { error: null };
    } catch (e) {
      return { error: e };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateUserPfp,
        updateProfile,
        isMock: !isConfigured,
      }}
    >
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
