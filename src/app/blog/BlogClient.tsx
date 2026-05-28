'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the blog index page with SSR disabled to prevent Node compilation errors
const BlogIndex = dynamic(() => import('@/views/BlogIndex'), { ssr: false });

export default function BlogClient() {
  const router = useRouter();

  return (
    <BlogIndex
      onNavigateHome={() => router.push('/')}
      onNavigateApp={() => router.push('/app')}
      onNavigatePost={(slug: string) => router.push(`/blog/${slug}`)}
    />
  );
}
