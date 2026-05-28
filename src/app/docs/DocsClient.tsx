'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the docs page with SSR disabled to prevent Node compilation errors
const DocsPage = dynamic(() => import('@/views/DocsPage'), { ssr: false });

export default function DocsClient() {
  const router = useRouter();

  return (
    <DocsPage
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
      onNavigateApi={() => router.push('/api')}
    />
  );
}
