'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the chat view with SSR disabled to prevent Node compilation errors
const AppView = dynamic(() => import('@/views/AppView'), { ssr: false });

export default function AppClient() {
  const router = useRouter();

  return (
    <AppView
      onNavigate={() => router.push('/')}
      onNavigateApi={() => router.push('/api')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
