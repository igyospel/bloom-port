'use client';

import { useRouter } from 'next/navigation';
import Landing from '@/views/Landing';

export default function HomeClient() {
  const router = useRouter();

  return (
    <Landing
      viewType="pseo-landing-page-gen"
      onNavigate={() => router.push('/app')}
      onNavigateApi={() => router.push('/api')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
