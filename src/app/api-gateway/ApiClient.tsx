'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the API page with SSR disabled to prevent browser globals errors during Next build
const ApiPage = dynamic(() => import('@/views/ApiPage'), { ssr: false });

export default function ApiClient() {
  const router = useRouter();

  return (
    <ApiPage
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
