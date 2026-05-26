import { useState, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Copy, Check, RefreshCw } from 'lucide-react';
import SEO from '../../components/SEO';
import AdBanner from '../../components/AdBanner';
import { Logo } from '../../components/Logo';

interface JournalPromptsProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
}

type Category = 'all' | 'gratitude' | 'mental-clarity' | 'stress-anxiety' | 'self-discovery' | 'focus-productivity';

interface Prompt {
  id: number;
  category: Exclude<Category, 'all'>;
  categoryLabel: string;
  text: string;
}

const prompts: Prompt[] = [
  // Gratitude
  { id: 1, category: 'gratitude', categoryLabel: 'Gratitude', text: 'What are three small moments from today that you\'re grateful for, even if they seem insignificant?' },
  { id: 2, category: 'gratitude', categoryLabel: 'Gratitude', text: 'Who in your life makes things easier, and have you told them recently?' },
  { id: 3, category: 'gratitude', categoryLabel: 'Gratitude', text: 'What challenge from the past year are you now grateful for?' },
  { id: 4, category: 'gratitude', categoryLabel: 'Gratitude', text: 'Describe a simple pleasure you often overlook. What would life feel like without it?' },
  { id: 5, category: 'gratitude', categoryLabel: 'Gratitude', text: 'What about your body or mind are you grateful for today?' },
  // Mental Clarity
  { id: 6, category: 'mental-clarity', categoryLabel: 'Mental Clarity', text: 'What thought has been taking up the most mental space this week? Write it out fully.' },
  { id: 7, category: 'mental-clarity', categoryLabel: 'Mental Clarity', text: 'If your mind were a room, what would need to be cleaned up right now?' },
  { id: 8, category: 'mental-clarity', categoryLabel: 'Mental Clarity', text: 'What decision are you postponing, and what would it feel like to make it today?' },
  { id: 9, category: 'mental-clarity', categoryLabel: 'Mental Clarity', text: 'What are you trying to control that might be better to release?' },
  { id: 10, category: 'mental-clarity', categoryLabel: 'Mental Clarity', text: 'Write down every worry on your mind. Now mark which ones you can actually act on.' },
  // Stress & Anxiety
  { id: 11, category: 'stress-anxiety', categoryLabel: 'Stress & Anxiety', text: 'What is making you feel most overwhelmed right now? Break it into smaller parts.' },
  { id: 12, category: 'stress-anxiety', categoryLabel: 'Stress & Anxiety', text: 'When did you last feel truly calm? What were the conditions?' },
  { id: 13, category: 'stress-anxiety', categoryLabel: 'Stress & Anxiety', text: 'What would you tell a close friend who was feeling exactly the way you feel right now?' },
  { id: 14, category: 'stress-anxiety', categoryLabel: 'Stress & Anxiety', text: 'What is one thing you could remove from your schedule this week to create more breathing room?' },
  { id: 15, category: 'stress-anxiety', categoryLabel: 'Stress & Anxiety', text: 'Write about a time you got through something hard. What helped you?' },
  // Self-Discovery
  { id: 16, category: 'self-discovery', categoryLabel: 'Self-Discovery', text: 'What value do you feel you\'ve been living out this week? What value have you been neglecting?' },
  { id: 17, category: 'self-discovery', categoryLabel: 'Self-Discovery', text: 'What kind of person do you want to be remembered as? Are your daily actions aligned with that?' },
  { id: 18, category: 'self-discovery', categoryLabel: 'Self-Discovery', text: 'What boundary do you need to set but have been afraid to?' },
  { id: 19, category: 'self-discovery', categoryLabel: 'Self-Discovery', text: 'When do you feel most like yourself? What does that version of you look like?' },
  { id: 20, category: 'self-discovery', categoryLabel: 'Self-Discovery', text: 'What would you do differently if you knew no one was watching or judging?' },
  // Focus & Productivity
  { id: 21, category: 'focus-productivity', categoryLabel: 'Focus & Productivity', text: 'What is the single most important thing you need to accomplish this week? What\'s stopping you?' },
  { id: 22, category: 'focus-productivity', categoryLabel: 'Focus & Productivity', text: 'What environment helps you do your best thinking? How can you recreate it more often?' },
  { id: 23, category: 'focus-productivity', categoryLabel: 'Focus & Productivity', text: 'What habit is quietly draining your energy each day?' },
  { id: 24, category: 'focus-productivity', categoryLabel: 'Focus & Productivity', text: 'What would \'enough\' look like today — not perfect, but enough?' },
  { id: 25, category: 'focus-productivity', categoryLabel: 'Focus & Productivity', text: 'At the end of this day, what would make you feel that it was time well spent?' },
];

const categories: { value: Category; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'gratitude', label: 'Gratitude' },
  { value: 'mental-clarity', label: 'Mental Clarity' },
  { value: 'stress-anxiety', label: 'Stress & Anxiety' },
  { value: 'self-discovery', label: 'Self-Discovery' },
  { value: 'focus-productivity', label: 'Focus & Productivity' },
];

const categoryColors: Record<Exclude<Category, 'all'>, string> = {
  'gratitude': 'bg-white/10 text-white border-white/20',
  'mental-clarity': 'bg-white/10 text-white border-white/20',
  'stress-anxiety': 'bg-white/10 text-white border-white/20',
  'self-discovery': 'bg-white/10 text-white border-white/20',
  'focus-productivity': 'bg-white/10 text-white border-white/20',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is AI journal prompts?',
      acceptedAnswer: { '@type': 'Answer', text: "AI journal prompts are thoughtful questions generated to help you reflect, process emotions, and gain mental clarity through writing. Bloomport's prompts cover gratitude, anxiety, focus, and self-discovery." },
    },
    {
      '@type': 'Question',
      name: 'How often should I journal?',
      acceptedAnswer: { '@type': 'Answer', text: 'Even 5-10 minutes of daily journaling has measurable benefits. Research from Cambridge University shows that expressive writing reduces intrusive thoughts and improves working memory.' },
    },
    {
      '@type': 'Question',
      name: 'Are these prompts free?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, all Bloomport journal prompts are completely free with no signup required.' },
    },
    {
      '@type': 'Question',
      name: 'Can journaling reduce anxiety?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes. Multiple studies, including research from the University of Texas, show that expressive journaling reduces anxiety, stress, and depressive symptoms by helping process difficult emotions.' },
    },
    {
      '@type': 'Question',
      name: 'What should I write about in my journal?',
      acceptedAnswer: { '@type': 'Answer', text: "Start with how you feel right now, what's taking up mental space, or what you're grateful for. Bloomport's AI journal prompts provide guided starting points across gratitude, stress, focus, and self-reflection." },
    },
  ],
};

export default function JournalPrompts({ onNavigateHome, onNavigateApp }: JournalPromptsProps) {
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [currentPromptIndex, setCurrentPromptIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const filteredPrompts = selectedCategory === 'all'
    ? prompts
    : prompts.filter((p) => p.category === selectedCategory);

  const currentPrompt = filteredPrompts[currentPromptIndex] ?? filteredPrompts[0];

  const handleNewPrompt = useCallback(() => {
    const available = filteredPrompts.filter((_, i) => i !== currentPromptIndex);
    if (available.length === 0) return;
    const randomIndex = Math.floor(Math.random() * available.length);
    const newPrompt = available[randomIndex];
    setCurrentPromptIndex(filteredPrompts.indexOf(newPrompt));
  }, [filteredPrompts, currentPromptIndex]);

  const handleCategoryChange = (cat: Category) => {
    setSelectedCategory(cat);
    setCurrentPromptIndex(0);
  };

  const handleCopy = async () => {
    if (!currentPrompt) return;
    try {
      await navigator.clipboard.writeText(currentPrompt.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="AI Journal Prompts Generator — Free Daily Prompts"
        description="Generate free AI journal prompts for self-reflection, gratitude, anxiety, and mental clarity. 25 rotating prompts. No signup needed. Start journaling now."
        path="/tools/journal-prompts"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <header className="w-full flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/80 backdrop-blur-sm sticky top-0 z-40">
        <button onClick={onNavigateHome} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors cursor-pointer" aria-label="Back to home">
          <ArrowLeft className="w-4 h-4" />
          <Logo className="h-5 w-auto" variant="dark" />
        </button>
        <button onClick={onNavigateApp} className="text-xs font-semibold bg-white text-black px-4 py-2 rounded-full hover:bg-white/90 transition-all cursor-pointer">
          Try Bloomport AI
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-12 flex flex-col items-center">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">AI Journal Prompts</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Free daily journal prompts for self-reflection, gratitude, anxiety relief, and mental clarity. 25 thoughtful prompts — no signup needed.
          </p>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-2 justify-center mb-8">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryChange(cat.value)}
              className={`text-xs font-semibold px-4 py-1.5 rounded-full border transition-all cursor-pointer ${
                selectedCategory === cat.value
                  ? 'bg-white text-black border-white'
                  : 'bg-white/[0.04] text-white/60 border-white/10 hover:bg-white/10 hover:text-white hover:border-white/20'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Prompt Card */}
        {currentPrompt && (
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10 flex flex-col gap-5">
            {/* Category badge + progress */}
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold tracking-[0.18em] px-3 py-1 rounded-full border uppercase ${categoryColors[currentPrompt.category]}`}>
                {currentPrompt.categoryLabel}
              </span>
              <span className="text-white/30 text-xs font-mono">
                {currentPromptIndex + 1} / {filteredPrompts.length}
              </span>
            </div>

            {/* Prompt Text */}
            <blockquote className="text-white text-lg sm:text-xl font-medium leading-relaxed tracking-tight min-h-[80px]">
              "{currentPrompt.text}"
            </blockquote>

            {/* Controls */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleNewPrompt}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-black font-semibold text-sm hover:bg-white/90 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                New Prompt
              </button>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/10 text-white/60 hover:text-white hover:border-white/25 transition-all cursor-pointer text-sm font-medium"
                aria-label="Copy prompt to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        )}

        {/* Progress dots */}
        <div className="flex flex-wrap gap-1.5 justify-center mt-5 max-w-xs">
          {filteredPrompts.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPromptIndex(i)}
              className={`w-2 h-2 rounded-full transition-all cursor-pointer ${i === currentPromptIndex ? 'bg-white' : 'bg-white/15 hover:bg-white/35'}`}
              aria-label={`Go to prompt ${i + 1}`}
            />
          ))}
        </div>

        {/* Ad Banner */}
        <div className="w-full mt-10"><AdBanner layout="horizontal" /></div>

        {/* Why Journal section */}
        <section className="w-full mt-12">
          <h2 className="text-xl font-bold mb-4 tracking-tight">Why Daily Journaling Changes Your Mental Health</h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            <strong className="text-white/80">AI journal prompts</strong> remove the blank-page paralysis that stops most people from writing. Research consistently shows that expressive journaling reduces stress hormones, improves working memory, and helps process difficult emotions. Even 5 minutes of prompted writing daily creates measurable shifts in mental clarity and emotional resilience.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { title: 'Reduces anxiety', desc: 'Writing externalizes worries, making them feel more manageable.' },
              { title: 'Builds self-awareness', desc: 'Regular reflection reveals patterns in thought and behavior.' },
              { title: 'Improves focus', desc: 'A cleared mind concentrates better and makes sharper decisions.' },
              { title: 'Processes emotions', desc: 'Expressive writing helps integrate difficult experiences.' },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <div className="text-sm font-semibold mb-1.5">{item.title}</div>
                <div className="text-white/45 text-xs leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* In-feed Ad */}
        <div className="w-full mt-10"><AdBanner layout="in-feed" /></div>

        {/* FAQ */}
        <section className="w-full mt-12">
          <h2 className="text-xl font-bold mb-6 tracking-tight">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((faq, i) => (
              <div key={i} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5">
                <h3 className="text-sm font-semibold mb-2 text-white">{faq.name}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{faq.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="w-full mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <h2 className="text-xl font-bold mb-2 tracking-tight">Go Deeper with AI-Guided Journaling</h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Bloomport's AI responds to your journal entries with thoughtful follow-up questions and insights, helping you uncover patterns and grow with every session.
          </p>
          <button
            onClick={onNavigateApp}
            className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.15)]"
          >
            Start AI Journaling Free <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        <p className="text-white/20 text-xs mt-10 text-center">© {new Date().getFullYear()} Bloomport · Free journal prompts · No signup required</p>
      </main>
    </div>
  );
}
