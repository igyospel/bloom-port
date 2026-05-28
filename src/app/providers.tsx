'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SolanaWalletProvider } from '@/components/SolanaWalletProvider';
import { AuthProvider } from '@/context/AuthContext';
import { CreditProvider } from '@/context/CreditContext';
import { SessionProvider } from '@/context/SessionContext';

function NavigationListener() {
  const router = useRouter();

  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const view = (e as CustomEvent).detail as string;
      if (!view) return;

      if (view === 'landing') {
        router.push('/');
      } else if (view === 'app') {
        router.push('/app');
      } else if (view === 'api') {
        router.push('/api');
      } else if (view === 'docs') {
        router.push('/docs');
      } else if (view === 'about') {
        router.push('/about');
      } else if (view === 'signin') {
        router.push('/signin');
      } else if (view === 'signup') {
        router.push('/signup');
      } else if (view === 'blog') {
        router.push('/blog');
      } else if (view === 'focustimer') {
        router.push('/tools/focus-timer');
      } else if (view === 'journalprompts') {
        router.push('/tools/journal-prompts');
      } else if (view === 'stressquiz') {
        router.push('/tools/stress-quiz');
      } else if (view === 'habittracker') {
        router.push('/tools/habit-tracker');
      } else if (view.startsWith('blog/')) {
        router.push('/' + view);
      } else {
        router.push('/' + view);
      }
    };

    window.addEventListener('bloomport-navigate', handleNavigation);
    return () => window.removeEventListener('bloomport-navigate', handleNavigation);
  }, [router]);

  return null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SolanaWalletProvider>
      <AuthProvider>
        <CreditProvider>
          <SessionProvider>
            <NavigationListener />
            {children}
          </SessionProvider>
        </CreditProvider>
      </AuthProvider>
    </SolanaWalletProvider>
  );
}
