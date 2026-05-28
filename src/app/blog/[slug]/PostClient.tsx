'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

// Lazy-load the blog post page with SSR disabled to prevent browser globals errors during Next build
const BlogPost = dynamic(() => import('@/views/BlogPost'), { ssr: false });

export default function PostClient({ slug }: { slug: string }) {
  const router = useRouter();

  return (
    <BlogPost
      slug={slug}
      onNavigateHome={() => router.push('/')}
      onNavigateBlog={() => router.push('/blog')}
      onNavigateApp={() => router.push('/app')}
    />
  );
}
