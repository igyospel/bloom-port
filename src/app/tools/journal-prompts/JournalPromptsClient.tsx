'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load JournalPrompts with SSR disabled
const JournalPrompts = dynamic(() => import('@/views/tools/JournalPrompts'), { ssr: false });

export default function JournalPromptsClient() {
  const router = useRouter();

  return (
    <JournalPrompts
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
