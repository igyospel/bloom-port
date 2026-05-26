import { Clock, ArrowRight, Tag } from 'lucide-react';
import SEO from '../components/SEO';
import AdBanner from '../components/AdBanner';
import { Logo } from '../components/Logo';
import { blogPosts } from '../data/blogPosts';

interface BlogIndexProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
  onNavigatePost: (slug: string) => void;
}

export default function BlogIndex({ onNavigateHome, onNavigateApp, onNavigatePost }: BlogIndexProps) {
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="Bloomport Blog — Mindfulness, Focus & Free AI Guides"
        description="Explore articles on mindful productivity, how to stop overthinking, free AI tools for mental health, and focus techniques. Written for calm, intentional living."
        path="/blog"
      />

      {/* Blog Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Bloomport Blog',
            description: 'Mindfulness, focus, and free AI guides for mental clarity and intentional productivity.',
            url: 'https://bloomport.fun/blog',
            publisher: {
              '@type': 'Organization',
              name: 'Bloomport',
              logo: 'https://bloomport.fun/bloomportBlack.png',
            },
          }),
        }}
      />

      {/* Header */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <button onClick={onNavigateHome} className="flex items-center gap-2 cursor-pointer">
            <Logo className="h-5 w-auto" variant="dark" />
          </button>
          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-white/60">
            <button onClick={onNavigateHome} className="hover:text-white transition-colors cursor-pointer">Home</button>
            <button className="text-white border-b border-white pb-0.5 cursor-default">Blog</button>
            <button onClick={onNavigateApp} className="px-4 py-1.5 bg-white text-black rounded-full text-[12px] font-bold hover:bg-white/90 transition-colors cursor-pointer">
              Try Free
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <span className="text-[10px] font-mono tracking-widest uppercase px-3 py-1 rounded-full border border-white/10 bg-white/[0.02] text-white/50 mb-4 inline-block">
            Bloomport Blog
          </span>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mt-4 mb-4 leading-[1.1]">
            Mindfulness, Focus &amp; Free AI Guides
          </h1>
          <p className="text-white/55 text-base sm:text-lg leading-relaxed">
            Practical guides on mindful productivity, mental clarity, and how free AI tools can help you stop overthinking and find focus — written for calm, intentional living.
          </p>
        </div>
      </section>

      {/* AD SLOT: blog-top */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 mb-8">
        <AdBanner layout="horizontal" />
      </div>

      {/* Article Grid */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <article
              key={post.slug}
              className="rounded-2xl border border-white/[0.07] bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03] transition-all duration-300 p-6 flex flex-col group cursor-pointer"
              onClick={() => onNavigatePost(post.slug)}
            >
              <div className="flex flex-wrap gap-1.5 mb-4">
                {post.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full border border-white/10 text-white/40">
                    <Tag className="w-2.5 h-2.5" />{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-base font-bold text-white mb-2 leading-snug group-hover:text-white/90 transition-colors">
                {post.title}
              </h2>
              <p className="text-xs text-white/50 leading-relaxed mb-4 flex-grow">{post.excerpt}</p>
              <div className="flex items-center justify-between text-[11px] text-white/30 border-t border-white/[0.06] pt-3 mt-auto">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  <span>{post.readingTimeMinutes} min read</span>
                </div>
                <div className="flex items-center gap-1 text-white/50 group-hover:text-white transition-colors">
                  <span>Read</span>
                  <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* AD SLOT: blog-bottom */}
        <div className="mt-12">
          <AdBanner layout="horizontal" />
        </div>

        {/* SEO Text Block */}
        <div className="mt-16 pt-12 border-t border-white/10 max-w-3xl">
          <h2 className="text-xl font-bold text-white mb-4">About Bloomport's Mindfulness Blog</h2>
          <p className="text-white/55 text-sm leading-relaxed mb-4">
            Our blog covers evidence-based techniques for mental clarity, mindful productivity, and using free AI tools to support your wellbeing. Every article is written with a calm, grounded voice — no hustle culture, no quick fixes, just intentional guidance.
          </p>
          <p className="text-white/55 text-sm leading-relaxed">
            Bloomport is completely free to use. Our AI journaling, focus timer, and mindful chat are available to everyone — no credit card, no paywall. We earn revenue through non-intrusive ads so you never have to pay.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={onNavigateApp}
              className="px-5 py-2.5 bg-white text-black rounded-full text-xs font-bold uppercase tracking-wide hover:bg-white/90 transition-colors cursor-pointer flex items-center gap-2"
            >
              Try Bloomport Free <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'focustimer' }))}
              className="px-5 py-2.5 border border-white/10 bg-white/[0.02] text-white/70 rounded-full text-xs font-medium hover:text-white hover:border-white/20 transition-colors cursor-pointer"
            >
              Free Focus Timer
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-[12px] text-white/40">
          <p>© 2026 Bloomport. All rights reserved.</p>
          <p className="italic">Built for calm.</p>
        </div>
      </footer>
    </div>
  );
}
