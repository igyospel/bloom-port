import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

export interface User {
  email: string;
  name: string;
  avatarUrl: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  /** Step 1: Send 6-digit OTP to email for login */
  sendLoginOtp: (email: string) => Promise<{ error: any }>;
  /** Step 2: Verify OTP code for login */
  verifyLoginOtp: (email: string, token: string) => Promise<{ error: any }>;
  /** Step 1: Send 6-digit OTP to email for signup */
  sendSignupOtp: (email: string, name: string) => Promise<{ error: any }>;
  /** Step 2: Verify OTP code for signup */
  verifySignupOtp: (email: string, token: string, name: string) => Promise<{ error: any }>;
  loginWithGoogle: () => Promise<{ error: any }>;
  logout: () => Promise<void>;
  updateUserPfp: (pfpUrl: string) => Promise<void>;
  updateProfile: (name: string, pfpUrl?: string) => Promise<{ error: any }>;
  isMock: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase credentials are real (not placeholders)
const supabaseUrl = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL)) || '';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY)) || '';

const isConfigured =
  !!supabaseUrl &&
  !!supabaseAnonKey &&
  !supabaseUrl.includes('your-project-id');

// Default avatar
const DEFAULT_AVATAR = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ── MOCK SYSTEM (If Supabase is not configured) ──────────────────────────
  const loadMockUser = () => {
    try {
      const saved = localStorage.getItem('bloomport-user');
      if (!saved) return null;
      const parsed = JSON.parse(saved);
      const localPfp = localStorage.getItem('bp_settings_pfp');
      if (localPfp) parsed.avatarUrl = localPfp;
      return parsed;
    } catch (e) {
      console.warn('Failed to parse mock user from localStorage', e);
      return null;
    }
  };

  useEffect(() => {
    if (!isConfigured) {
      setUser(loadMockUser());
      setIsLoading(false);
    }
  }, []);

  // ── REAL SUPABASE AUTH LISTENER ──────────────────────────────────────────
  useEffect(() => {
    if (!isConfigured) return;

    let isMounted = true;

    // Fallback timer: if getSession hangs (e.g. due to Brave Shields or corrupted indexedDB), force load completion
    const fallbackTimer = setTimeout(() => {
      if (isMounted && isLoading) {
        console.warn("AuthContext getSession timed out, forcing load completion to prevent infinite loading");
        setIsLoading(false);
      }
    }, 2000);

    // Explicitly fetch session on mount to prevent the 'logged out' flash
    // while onAuthStateChange takes time to fire INITIAL_SESSION
    supabase.auth.getSession().then(({ data, error }) => {
      clearTimeout(fallbackTimer);
      if (!isMounted) return;
      
      const session = data?.session;
      if (session?.user) {
        // We just need a basic user object immediately to prevent UI flash
        setUser({
          email: session.user.email || '',
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          avatarUrl: session.user.user_metadata?.avatar_url || DEFAULT_AVATAR,
        });
      } else {
        setUser(null);
      }
      setIsLoading(false);
    }).catch((err) => {
      clearTimeout(fallbackTimer);
      console.error("AuthContext getSession error:", err);
      if (isMounted) {
        setUser(null);
        setIsLoading(false);
      }
    });

    console.log('Registering onAuthStateChange listener');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('onAuthStateChange triggered:', event, session?.user?.email);
        
        // If we are inside a popup, we close the window after successful sign in
        if (event === 'SIGNED_IN' && typeof window !== 'undefined' && window.opener) {
          setTimeout(() => window.close(), 500);
        }

        // Defer all database calls/async operations inside onAuthStateChange 
        // to prevent client-side deadlock in supabase-js (which blocks verifyOtp)
        setTimeout(async () => {
          try {
            if (session?.user) {
              let profileName = '';
              let profileAvatar = '';

              try {
                const { data: profile, error: profileError } = await supabase
                  .from('profiles')
                  .select('name, avatar_url')
                  .eq('id', session.user.id)
                  .single();

                if (profileError || !profile) {
                  console.warn('onAuthStateChange: Profile not found for user. Creating a client-side fallback profile...', profileError);
                  profileName = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
                  profileAvatar = session.user.user_metadata?.avatar_url || DEFAULT_AVATAR;

                  const { error: upsertError } = await supabase
                    .from('profiles')
                    .upsert({
                      id: session.user.id,
                      name: profileName,
                      avatar_url: profileAvatar,
                      email: session.user.email?.toLowerCase() || null,
                      credits: 10000,
                    });

                  if (upsertError) {
                    console.error('onAuthStateChange: Failed to upsert fallback profile:', upsertError);
                  } else {
                    console.log('onAuthStateChange: Successfully created client-side fallback profile.');
                  }
                } else {
                  profileName = profile.name;
                  profileAvatar = profile.avatar_url;
                }
              } catch (err) {
                console.error('Error fetching/creating profile in auth state change:', err);
              }

              const localPfp = localStorage.getItem('bp_settings_pfp');
              setUser({
                email: session.user.email || '',
                name: profileName || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                avatarUrl: localPfp || profileAvatar || DEFAULT_AVATAR,
              });
            } else {
              setUser(null);
            }
          } catch (err) {
            console.error('Fatal error in onAuthStateChange callback:', err);
            // Fallback to minimal user object to prevent blackouts
            if (session?.user) {
              setUser({
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
                avatarUrl: DEFAULT_AVATAR,
              });
            } else {
              setUser(null);
            }
          }
          if (isMounted) setIsLoading(false);
        }, 0);
      }
    );

    return () => { 
      isMounted = false;
      subscription.unsubscribe(); 
    };
  }, []);

  // ── HELPER: Call our Bloomport API routes ─────────────────────────────────
  const callApi = async (path: string, body: object) => {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) return { data: null, error: new Error(data.error || 'Request failed') };
    return { data, error: null };
  };

  // ── MOCK: Fake OTP flow for dev/demo mode ─────────────────────────────────
  const mockSendOtp = async (_email: string) => {
    // In mock mode pretend we sent it (code is always "123456" for testing)
    return { error: null };
  };

  const mockVerifyOtp = async (email: string, code: string, name?: string) => {
    // In mock mode accept any 6-digit code
    if (code.length !== 6) return { error: new Error('Invalid code') };
    const prefix = name || email.split('@')[0];
    const userName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
    const newUser = { email, name: userName, avatarUrl: DEFAULT_AVATAR };
    setUser(newUser);
    localStorage.setItem('bloomport-user', JSON.stringify(newUser));
    return { error: null };
  };

  // ── OTP LOGIN: Step 1 ─────────────────────────────────────────────────────
  const sendLoginOtp = async (email: string) => {
    if (!isConfigured) return mockSendOtp(email);

    const { error } = await callApi('/api/send-otp', { email, purpose: 'login' });
    return { error };
  };

  // ── OTP LOGIN: Step 2 ─────────────────────────────────────────────────────
  const verifyLoginOtp = async (email: string, token: string) => {
    if (!isConfigured) return mockVerifyOtp(email, token);

    console.log('verifyLoginOtp: starting for', email);
    try {
      const { data, error } = await callApi('/api/verify-otp', { email, code: token, purpose: 'login' });
      console.log('verifyLoginOtp API response:', { data, error });
      if (error || !data) return { error: error || new Error('Invalid verification response') };

      // Exchange hashed_token for a real Supabase session
      console.log('verifyLoginOtp: exchanging token_hash with type: magiclink');
      let { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.hashed_token,
        type: 'magiclink',
      });

      if (sessionError) {
        console.warn('verifyLoginOtp: magiclink type verification failed, trying email type...', sessionError);
        const emailVerify = await supabase.auth.verifyOtp({
          token_hash: data.hashed_token,
          type: 'email',
        });
        sessionError = emailVerify.error;
      }

      console.log('verifyLoginOtp supabase verifyOtp result:', { error: sessionError });
      return { error: sessionError };
    } catch (err: any) {
      console.error('verifyLoginOtp catch block error:', err);
      return { error: err };
    }
  };

  // ── OTP SIGNUP: Step 1 ────────────────────────────────────────────────────
  const sendSignupOtp = async (email: string, name: string) => {
    if (!isConfigured) return mockSendOtp(email);

    const { error } = await callApi('/api/send-otp', { email, name, purpose: 'signup' });
    return { error };
  };

  // ── OTP SIGNUP: Step 2 ────────────────────────────────────────────────────
  const verifySignupOtp = async (email: string, token: string, name: string) => {
    if (!isConfigured) return mockVerifyOtp(email, token, name);

    console.log('verifySignupOtp: starting for', email, name);
    try {
      const { data, error } = await callApi('/api/verify-otp', { email, code: token, purpose: 'signup', name });
      console.log('verifySignupOtp API response:', { data, error });
      if (error || !data) return { error: error || new Error('Invalid verification response') };

      console.log('verifySignupOtp: exchanging token_hash with type: magiclink');
      let { error: sessionError } = await supabase.auth.verifyOtp({
        token_hash: data.hashed_token,
        type: 'magiclink',
      });

      if (sessionError) {
        console.warn('verifySignupOtp: magiclink type verification failed, trying email type...', sessionError);
        const emailVerify = await supabase.auth.verifyOtp({
          token_hash: data.hashed_token,
          type: 'email',
        });
        sessionError = emailVerify.error;
      }

      console.log('verifySignupOtp supabase verifyOtp result:', { error: sessionError });
      return { error: sessionError };
    } catch (err: any) {
      console.error('verifySignupOtp catch block error:', err);
      return { error: err };
    }
  };

  // ── GOOGLE SIGN-IN ────────────────────────────────────────────────────────
  const loginWithGoogle = async () => {
    if (!isConfigured) {
      const newUser = { email: 'google.user@gmail.com', name: 'Google User', avatarUrl: DEFAULT_AVATAR };
      setUser(newUser);
      localStorage.setItem('bloomport-user', JSON.stringify(newUser));
      return { error: null };
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { 
          redirectTo: `${window.location.origin}/auth/callback?next=/app`
        },
      });
      return { error };
    } catch (e) {
      return { error: e };
    }
  };

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = async () => {
    if (!isConfigured) {
      setUser(null);
      localStorage.removeItem('bloomport-user');
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
  };

  // ── UPDATE PFP ────────────────────────────────────────────────────────────
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
      await supabase.from('profiles').update({ avatar_url: pfpUrl }).eq('id', authUser.id);
    }
  };

  // ── UPDATE PROFILE ────────────────────────────────────────────────────────
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
        if (pfpUrl && !pfpUrl.startsWith('data:')) updates.avatar_url = pfpUrl;
        const { error } = await supabase.from('profiles').update(updates).eq('id', authUser.id);
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
        isLoading,
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
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
