'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load HabitTracker with SSR disabled
const HabitTracker = dynamic(() => import('@/views/tools/HabitTracker'), { ssr: false });

export default function HabitTrackerClient() {
  const router = useRouter();

  return (
    <HabitTracker
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
