import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '../lib/supabaseClient';

interface CreditContextType {
  credits: number;
  addCredits: (amount: number) => Promise<void>;
  consumeCredits: (amount: number) => Promise<void>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const { user, isMock } = useAuth();
  const [credits, setCredits] = useState<number>(10000);

  // 1. Initial load from LocalStorage (for guests or fallback)
  useEffect(() => {
    const saved = localStorage.getItem('bloomport-credits');
    if (saved !== null) {
      setCredits(parseInt(saved, 10));
    }
  }, []);

  // 2. Fetch credits from Supabase if user is logged in
  useEffect(() => {
    if (isMock || !user) {
      // If user logged out or is guest, restore from localStorage
      const saved = localStorage.getItem('bloomport-credits');
      setCredits(saved !== null ? parseInt(saved, 10) : 10000);
      return;
    }

    const fetchDBCredits = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('credits')
          .eq('id', authUser.id)
          .single();

        if (profile) {
          setCredits(profile.credits);
          localStorage.setItem('bloomport-credits', profile.credits.toString());
        }
      }
    };

    fetchDBCredits();
  }, [user, isMock]);

  const addCredits = async (amount: number) => {
    const nextCredits = credits + amount;
    setCredits(nextCredits);
    localStorage.setItem('bloomport-credits', nextCredits.toString());

    if (!isMock && user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('profiles')
          .update({ credits: nextCredits })
          .eq('id', authUser.id);
      }
    }
  };

  const consumeCredits = async (amount: number) => {
    const nextCredits = Math.max(0, credits - amount);
    setCredits(nextCredits);
    localStorage.setItem('bloomport-credits', nextCredits.toString());

    if (!isMock && user) {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        await supabase
          .from('profiles')
          .update({ credits: nextCredits })
          .eq('id', authUser.id);
      }
    }
  };

  return (
    <CreditContext.Provider value={{ credits, addCredits, consumeCredits }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
