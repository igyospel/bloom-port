'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load StressQuiz with SSR disabled
const StressQuiz = dynamic(() => import('@/views/tools/StressQuiz'), { ssr: false });

export default function StressQuizClient() {
  const router = useRouter();

  return (
    <StressQuiz
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
