'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Landing from '@/views/Landing';

export default function HomeClient() {
  const router = useRouter();

  useEffect(() => {
    // Prefetch critical routes immediately after initial render so button clicks are instant
    router.prefetch('/app');
    router.prefetch('/api-gateway');
    router.prefetch('/docs');
    router.prefetch('/signin');
    router.prefetch('/signup');
  }, [router]);

  return (
    <Landing
      viewType="landing"
      onNavigate={() => router.push('/app')}
      onNavigateApi={() => router.push('/api-gateway')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
