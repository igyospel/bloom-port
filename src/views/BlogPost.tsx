'use client';

import { useEffect } from 'react';
import { ArrowLeft, Clock, User, ChevronRight } from 'lucide-react';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';
import { Logo } from '../components/Logo';
import { getPostBySlug } from '../data/blogPosts';

interface BlogPostProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigateBlog: () => void;
  onNavigateApp: () => void;
}

export default function BlogPost({ slug, onNavigateHome, onNavigateBlog, onNavigateApp }: BlogPostProps) {
  const post = getPostBySlug(slug);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  if (!post) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Article Not Found</h1>
          <p className="text-white/60 mb-8">This article doesn&apos;t exist yet.</p>
          <button onClick={onNavigateBlog} className="px-6 py-3 bg-white text-black rounded-full font-semibold cursor-pointer">
            Back to Blog
          </button>
        </div>
      </div>
    );
  }

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    author: {
      '@type': 'Organization',
      name: post.author.name,
      url: 'https://bloomport.fun',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Bloomport',
      logo: {
        '@type': 'ImageObject',
        url: 'https://bloomport.fun/bloomportBlack.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://bloomport.fun/blog/${post.slug}`,
    },
    url: `https://bloomport.fun/blog/${post.slug}`,
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://bloomport.fun',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Blog',
        'item': 'https://bloomport.fun/blog',
      },
      {
        '@type': 'ListItem',
        'position': 3,
        'name': post.title,
        'item': `https://bloomport.fun/blog/${post.slug}`,
      }
    ]
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title={post.metaTitle}
        description={post.metaDescription}
        path={`/blog/${post.slug}`}
        type="article"
      />

      {/* Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {post.schema && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(post.schema) }} />
      )}

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer">
            <Logo className="h-5 w-auto" variant="dark" />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/60">
            <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button onClick={onNavigateBlog} className="hover:text-white transition-colors cursor-pointer">Blog</button>
            <button onClick={onNavigateApp} className="px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-bold hover:bg-white/90 transition-colors cursor-pointer">
              Try Free
            </button>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-6 pb-2">
        <nav className="flex items-center gap-1.5 text-[12px] text-white/40" aria-label="Breadcrumb">
          <button onClick={onNavigateHome} className="hover:text-white/70 transition-colors cursor-pointer">Home</button>
          <ChevronRight className="w-3 h-3" />
          <button onClick={onNavigateBlog} className="hover:text-white/70 transition-colors cursor-pointer">Blog</button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-white/60 truncate max-w-[200px]">{post.title}</span>
        </nav>
      </div>

      {/* Article */}
      <article className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Article Header */}
        <header className="mb-8 max-w-3xl">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] font-mono tracking-widest uppercase px-2.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-white/50">
                {tag}
              </span>
            ))}
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-4 leading-[1.1]">
            {post.title}
          </h1>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed mb-6">{post.excerpt}</p>
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-white/40 border-t border-white/10 pt-4">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readingTimeMinutes} min read</span>
            </div>
            <span>
              Published{' '}
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </header>

        {/* AD SLOT: after-intro */}
        <div className="my-8">
          <AdBanner layout="horizontal" />
        </div>

        {/* Article Body + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-12">
          {/* Main Content */}
          <div
            className="
              prose prose-invert prose-lg max-w-none
              prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
              prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:text-white/75 prose-p:leading-relaxed prose-p:mb-5
              prose-li:text-white/75 prose-li:mb-2
              prose-ol:text-white/75 prose-ul:text-white/75
              prose-strong:text-white prose-strong:font-semibold
              prose-a:text-white prose-a:underline prose-a:underline-offset-2
              prose-blockquote:border-l-2 prose-blockquote:border-white/20 prose-blockquote:text-white/60 prose-blockquote:pl-4
              prose-table:text-white/80
              prose-th:text-white prose-td:text-white/70
            "
            dangerouslySetInnerHTML={{ __html: post.content || '<p>Article content coming soon...</p>' }}
          />

          {/* Sidebar */}
          <aside className="hidden lg:block space-y-6">
            <div className="sticky top-24 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-bold text-white mb-2">Try Bloomport Free</h3>
                <p className="text-xs text-white/50 leading-relaxed mb-4">
                  AI journaling, focus sessions, and mindful chat — completely free, no credit card needed.
                </p>
                <button
                  onClick={onNavigateApp}
                  className="w-full py-2.5 px-4 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wide hover:bg-white/90 transition-colors cursor-pointer"
                >
                  Start for Free
                </button>
              </div>
              {/* AD SLOT: sidebar */}
              <AdBanner layout="sidebar" />
            </div>
          </aside>
        </div>

        {/* AD SLOT: mid-article */}
        <div className="my-10 max-w-3xl">
          <AdBanner layout="in-feed" />
        </div>

        {/* FAQ Section */}
        <section className="max-w-3xl mt-12 mb-10" aria-label="Frequently Asked Questions">
          <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {post.faq.map((item, i) => (
              <div key={i} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold text-white mb-2">{item.question}</h3>
                <p className="text-sm text-white/60 leading-relaxed">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* AD SLOT: before-conclusion */}
        <div className="my-8 max-w-3xl">
          <AdBanner layout="horizontal" />
        </div>

        {/* CTA */}
        <section className="max-w-3xl rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center my-10">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to calm your mind?</h2>
          <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xl mx-auto">
            Bloomport&apos;s AI journaling, focus sessions, and mindful chat are completely free. No credit card, no signup wall — just calm, intentional productivity.
          </p>
          <button
            onClick={onNavigateApp}
            className="px-8 py-3.5 bg-white text-black rounded-full font-bold text-sm uppercase tracking-wide hover:bg-white/90 active:scale-[0.98] transition-all cursor-pointer"
          >
            Try Bloomport Free →
          </button>
        </section>

        {/* AD SLOT: after-conclusion */}
        <div className="my-8 max-w-3xl">
          <AdBanner layout="horizontal" />
        </div>

        {/* Author */}
        <section className="max-w-3xl border-t border-white/10 pt-8 mt-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
              <span className="text-white text-lg font-bold">{post.author.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{post.author.name}</p>
              <p className="text-xs text-white/50">{post.author.role} at Bloomport</p>
            </div>
          </div>
        </section>

        {/* Internal Links */}
        <nav className="max-w-3xl mt-10 pt-8 border-t border-white/10" aria-label="More from Bloomport">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest mb-4">More from Bloomport</h3>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={onNavigateBlog}
              className="px-4 py-2 text-xs rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3 h-3" /> All Articles
            </button>
            <button
              onClick={onNavigateApp}
              className="px-4 py-2 text-xs rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              Free AI Chat
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'focustimer' }))}
              className="px-4 py-2 text-xs rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              Focus Timer
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'journalprompts' }))}
              className="px-4 py-2 text-xs rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/20 transition-all cursor-pointer"
            >
              Journal Prompts
            </button>
          </div>
        </nav>
      </article>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 mt-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/40">
          <p>© 2026 Bloomport. All rights reserved.</p>
          <p className="italic">Built for calm.</p>
        </div>
      </footer>
    </div>
  );
}
