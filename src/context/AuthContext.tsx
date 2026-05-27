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
  /** Step 1 for OTP login: send OTP to email */
  sendLoginOtp: (email: string) => Promise<{ error: any }>;
  /** Step 2 for OTP login: verify the 6-digit code */
  verifyLoginOtp: (email: string, token: string) => Promise<{ error: any }>;
  /** Step 1 for OTP signup: send OTP to email with name metadata */
  sendSignupOtp: (email: string, name: string) => Promise<{ error: any }>;
  /** Step 2 for OTP signup: verify the 6-digit code */
  verifySignupOtp: (email: string, token: string, name: string) => Promise<{ error: any }>;
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
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    // Restore local-uploaded avatar (stored separately because data URLs are too large)
    const localPfp = localStorage.getItem('bp_settings_pfp');
    if (localPfp) parsed.avatarUrl = localPfp;
    return parsed;
  };

  useEffect(() => {
    if (!isConfigured) {
      setUser(loadMockUser());
    }
  }, []);

  // ── REAL SUPABASE AUTH SYSTEM ──
  useEffect(() => {
    if (!isConfigured) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name, avatar_url')
            .eq('id', session.user.id)
            .single();

          setUser({
            email: session.user.email || '',
            name: profile?.name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            avatarUrl: profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80',
          });
        } else {
          setUser(null);
        }
      }
    );

    return () => { subscription.unsubscribe(); };
  }, []);

  // ── OTP LOGIN: Step 1 — send OTP ──
  const sendLoginOtp = async (email: string) => {
    if (!isConfigured) {
      // Mock: pretend we sent it
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false }, // login only, don't auto-register
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  // ── OTP LOGIN: Step 2 — verify code ──
  const verifyLoginOtp = async (email: string, token: string) => {
    if (!isConfigured) {
      // Mock login
      const prefix = email.split('@')[0];
      const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80`;
      const newUser = { email, name, avatarUrl };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  // ── OTP SIGNUP: Step 1 — send OTP ──
  const sendSignupOtp = async (email: string, _name: string) => {
    if (!isConfigured) {
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: true, data: { name: _name } },
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  // ── OTP SIGNUP: Step 2 — verify code ──
  const verifySignupOtp = async (email: string, token: string, name: string) => {
    if (!isConfigured) {
      // Mock signup
      const avatarUrl = `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&q=80`;
      const newUser = { email, name, avatarUrl };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
      if (!error) {
        // Update profile name after verify
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase.from('profiles').upsert({ id: authUser.id, name, email });
        }
      }
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  const loginWithGoogle = async () => {
    if (!isConfigured) {
      const prefix = 'google.user@gmail.com'.split('@')[0];
      const name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
      const avatarUrl = `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80`;
      const newUser = { email: 'google.user@gmail.com', name, avatarUrl };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
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

    const updatedUser = {
      ...user,
      name,
      ...(pfpUrl !== undefined && pfpUrl !== '' ? { avatarUrl: pfpUrl } : {}),
    };
    setUser(updatedUser);

    if (!isConfigured) {
      const userToStore = { ...updatedUser };
      if (userToStore.avatarUrl?.startsWith('data:')) {
        const existing = localStorage.getItem('bloomport-user');
        const prev = existing ? JSON.parse(existing) : {};
        userToStore.avatarUrl = prev.avatarUrl || '';
      }
      localStorage.setItem('bloomport-user', JSON.stringify(userToStore));
      return { error: null };
    }

    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const updates: any = { name };
        if (pfpUrl && !pfpUrl.startsWith('data:')) {
          updates.avatar_url = pfpUrl;
        }
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
        sendLoginOtp,
        verifyLoginOtp,
        sendSignupOtp,
        verifySignupOtp,
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
