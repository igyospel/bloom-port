'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load FocusTimer with SSR disabled to prevent browser globals errors
const FocusTimer = dynamic(() => import('@/views/tools/FocusTimer'), { ssr: false });

export default function FocusTimerClient() {
  const router = useRouter();

  return (
    <FocusTimer
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
