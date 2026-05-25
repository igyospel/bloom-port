import React, { createContext, useContext, useState, useEffect } from 'react';

interface CreditContextType {
  credits: number;
  addCredits: (amount: number) => void;
  consumeCredits: (amount: number) => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: React.ReactNode }) {
  const [credits, setCredits] = useState<number>(() => {
    const saved = localStorage.getItem('bloomport-credits');
    return saved !== null ? parseInt(saved, 10) : 10000;
  });

  useEffect(() => {
    localStorage.setItem('bloomport-credits', credits.toString());
  }, [credits]);

  const addCredits = (amount: number) => {
    setCredits((prev) => prev + amount);
  };

  const consumeCredits = (amount: number) => {
    setCredits((prev) => Math.max(0, prev - amount));
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
