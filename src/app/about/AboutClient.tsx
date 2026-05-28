'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the about page with SSR disabled to prevent browser globals errors during Next build
const AboutPage = dynamic(() => import('@/views/About'), { ssr: false });

export default function AboutClient() {
  const router = useRouter();

  return (
    <AboutPage
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
      onNavigateApi={() => router.push('/api')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
