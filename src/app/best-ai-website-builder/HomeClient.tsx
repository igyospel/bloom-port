'use client';

import { useRouter } from 'next/navigation';
import Landing from '@/views/Landing';

export default function HomeClient() {
  const router = useRouter();

  return (
    <Landing
      viewType="pseo-best-builder"
      onNavigate={() => router.push('/app')}
      onNavigateApi={() => router.push('/api')}
      onNavigateDocs={() => router.push('/docs')}
    />
  );
}
