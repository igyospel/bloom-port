'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const ImageToPdf = dynamic(() => import('@/views/tools/ImageToPdf'), { ssr: false });

export default function ImageToPdfClient() {
  const router = useRouter();

  return (
    <ImageToPdf
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
