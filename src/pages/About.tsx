import { useState } from 'react';
import { Logo } from '../components/Logo';
import { UnifiedProfileControl } from '../components/ui/unified-profile-control';
import { useAuth } from '../context/AuthContext';
import SEO from '../components/SEO';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';
import { 
  ArrowLeft, 
  Cpu, 
  Globe, 
  HelpCircle, 
  Info, 
  Layers, 
  Lock, 
  Menu, 
  Rocket, 
  Shield, 
  Sparkles, 
  Users, 
  X,
  CheckCircle,
  Zap
} from 'lucide-react';

interface AboutProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
  onNavigateApi: () => void;
  onNavigateDocs: () => void;
}

export default function About({
  onNavigateHome,
  onNavigateApp,
  onNavigateApi,
  onNavigateDocs,
}: AboutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const faqItems = [
    {
      id: 'faq-1',
      question: 'Is Bloomport really a free LLM platform?',
      answer: 'Yes, absolutely. Bloomport is designed to be a fully accessible, free language model gateway. Every new user instantly receives 10,000 free compute credits upon registration, with zero credit card requirements. We also provide daily free top-ups and allow users to earn more credits by participating in Web3 and developer actions.'
    },
    {
      id: 'faq-2',
      question: 'How is Bloomport a viable free ChatGPT alternative?',
      answer: 'Unlike many commercial chatbot tools that limit you to basic models or lock advanced reasoning behind expensive monthly subscriptions, Bloomport grants direct access to state-of-the-art models like bloomport-v1 and light variations completely free. There are no monthly paywalls, meaning developers, students, and general users can access advanced conversational AI without a $20/month subscription.'
    },
    {
      id: 'faq-3',
      question: 'How does Bloomport keep its platform free without ads spoiling the UI?',
      answer: 'We leverage a decentralized and optimized inference pipeline that reduces computing overhead. To support server costs, we integrate optional non-intrusive rewarded ads (which you can choose to watch to support the creators and earn additional credits) and offer enterprise tiers for heavy developer usage. This keeps the core consumer experience 100% free.'
    },
    {
      id: 'faq-4',
      question: 'Can I use Bloomport for writing code and building applications?',
      answer: 'Yes! Bloomport is built for developers. You can generate custom API keys, monitor real-time query metrics, and review comprehensive audit logs right from the Settings dashboard. Our developer documentation provides copy-pasteable examples in Python, JavaScript, TypeScript, and Go.'
    },
    {
      id: 'faq-5',
      question: 'Is my conversational data private and secure?',
      answer: 'Privacy is our top priority. All communications are fully encrypted in transit and at rest. We never share your chat sessions, journal reflections, or custom workflows with external advertising networks. Additionally, we do not train our primary models on your conversational data unless you explicitly opt in.'
    }
  ];

  return (
    <div className="bg-[#050505] text-white font-sans min-h-screen flex flex-col selection:bg-white/10">
      <SEO 
        title="Bloomport — The Free LLM for Everyone" 
        description="Learn about Bloomport, a free LLM platform and ChatGPT alternative. Explore our mission, vision, key features, and advanced conversational developer tools."
        path="/about"
      />

      {/* Header */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-md text-white shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
            className="md:hidden p-2 -ml-1 text-white/50 hover:text-white cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo className="h-5 w-auto" variant="dark" />
          <span className="text-[9px] font-semibold text-white/50 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95 origin-left">
            About
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium font-sans">
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApp(); }}>Models</a>
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }}>API</a>
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }}>Docs</a>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <UnifiedProfileControl />
          ) : (
            <>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'signin' }))}
                className="text-[13px] font-semibold text-white/60 hover:text-white transition-colors cursor-pointer px-1 py-1"
              >
                Log In
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'signup' }))}
                className="text-[13px] font-semibold bg-white text-black hover:bg-white/90 transition-all cursor-pointer px-4 py-2 rounded-full font-sans"
              >
                Sign Up
              </button>
            </>
          )}
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 h-full w-[280px] bg-[#0a0a0a] border-r border-white/10 p-5 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Logo className="h-5 w-auto" variant="dark" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4 font-medium text-sm">
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateHome(); setMobileMenuOpen(false); }}>Home</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateApp(); setMobileMenuOpen(false); }}>AI Chat</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateApi(); setMobileMenuOpen(false); }}>Developer API</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateDocs(); setMobileMenuOpen(false); }}>Documentation</a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Container */}
      <main className="flex-1 max-w-4xl mx-auto px-6 py-12 sm:py-20 select-text">
        {/* Breadcrumb / Back button */}
        <button
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-xs font-mono text-white/40 hover:text-white/80 transition-colors uppercase tracking-wider mb-8 cursor-pointer group"
        >
          <ArrowLeft className="w-3.5 h-3.5 transform group-hover:-translate-x-0.5 transition-transform" />
          Back to Home
        </button>

        {/* Hero Section */}
        <section className="mb-16">
          <h1 className="text-4xl sm:text-5xl font-serif font-semibold tracking-tight text-white mb-6 leading-tight">
            Bloomport — The Free LLM for Everyone
          </h1>
          <p className="text-lg sm:text-xl text-white/60 font-sans leading-relaxed max-w-3xl">
            Bloomport is a premium, high-performance artificial intelligence platform designed to democratize access to advanced language models, autonomous workspace agents, and developer integrations. No paywalls, no monthly fees, and no compromises.
          </p>
        </section>

        <hr className="border-white/[0.08] my-12" />

        {/* Section 1: What is Bloomport */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Info className="w-5 h-5 text-white/50" /> What is Bloomport?
          </h2>
          <div className="text-white/50 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              In today's digital landscape, accessing state-of-the-art artificial intelligence often requires high subscription prices. Bloomport was built to shatter this barrier. We provide a state-of-the-art **free language model** client and orchestration suite that gives anyone access to premium AI computing power instantly.
            </p>
            <p>
              Whether you are engaging in everyday text generation, planning mindful schedules, tracking personal habits, or requesting complex coding completions, Bloomport's unified dashboard brings all of these features together under an ultra-premium, dark glassmorphic design that matches the aesthetics of modern developer platforms like Vercel and OpenAI.
            </p>
          </div>
        </section>

        {/* Section 2: Why it is free */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Globe className="w-5 h-5 text-white/50" /> Why is it free?
          </h2>
          <div className="text-white/50 text-sm sm:text-base leading-relaxed space-y-4">
            <p>
              Our core mission is straightforward: **AI should be a public utility, not a gated garden**. We believe that access to powerful language processing tools should be available to every developer, researcher, and student, regardless of their financial capabilities.
            </p>
            <p>
              To maintain this vision without filling our dashboard with intrusive advertisements, we operate on a hybrid ecosystem:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/40">
              <li><strong>Decentralized Infrastructure:</strong> We minimize resource waste by routing compute parameters through optimized inference gateways.</li>
              <li><strong>Optional Rewarded Ads:</strong> Users who want to support the project can choose to watch quick rewarded video ads to earn extra compute credits.</li>
              <li><strong>Enterprise API Access:</strong> Heavy industrial and production users can subscribe to dedicated infrastructure pools, which directly funds the free tier for everyone else.</li>
            </ul>
          </div>
        </section>

        {/* Section 3: Who built it */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-white/50" /> Who built Bloomport & Why?
          </h2>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed">
            Bloomport was founded by a global group of software engineers, open-source advocates, and digital designers who were frustrated by the rapid commercialization of foundational AI models. We noticed that high-quality tools were becoming increasingly expensive and restricted by complex terms. By shipping Bloomport, we wanted to build a secure space that stands as a reliable, privacy-first, and **free ChatGPT alternative**.
          </p>
        </section>

        {/* Section 4: Key Differentiators */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Layers className="w-5 h-5 text-white/50" /> Bloomport vs. Paid Alternatives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.01]">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" /> Free Tier
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Zero paywalls. No hidden credit card fields. Access advanced chat, dynamic daily credits, and standard API keys without spending a cent.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.01]">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-white/60" /> Privacy & Security
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Your data stays Yours. No advertising trackers, no sales of conversation content, and zero model training on your private chats.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.01]">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white/60" /> Mindful Integration
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Built-in features like a mindful Focus Timer, AI Journal prompts, and an interactive Wellness Quiz to help you manage cognitive overload.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.01]">
              <h3 className="font-semibold text-white mb-2 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-white/60" /> Open Developer Gateways
              </h3>
              <p className="text-xs text-white/40 leading-relaxed">
                Need more than just a chat page? View our <a href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }} className="text-white/60 underline hover:text-white">Developer Docs</a> to integrate model completions directly using custom API keys.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: How it works */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Zap className="w-5 h-5 text-white/50" /> Technical Overview
          </h2>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed">
            Bloomport works by aggregating state-of-the-art open-weights models and routing user queries through highly-optimized cloud infrastructure. By applying smart caching, token aggregation, and efficient payload compression, we cut average model inference latency in half compared to basic setups. This setup ensures that you get supercharged speeds on a **free language model** interface.
          </p>
        </section>

        {/* Section 6: Target Audience */}
        <section className="space-y-6 mb-16">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <Users className="w-5 h-5 text-white/50" /> Who is Bloomport For?
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-white/70 mt-1">
                <Rocket className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Students & Academic Researchers</h3>
                <p className="text-xs text-white/40 leading-relaxed mt-1">
                  Draft papers, analyze reference materials, and summarize long chapters without running out of free queries or hitting daily constraints.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-white/70 mt-1">
                <Cpu className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Software Developers & Builders</h3>
                <p className="text-xs text-white/40 leading-relaxed mt-1">
                  Test prompt workflows, test API request-response structures, and build automated agents with a simple key management console.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-white/5 text-white/70 mt-1">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Mindful Creators & Productivity Enthusiasts</h3>
                <p className="text-xs text-white/40 leading-relaxed mt-1">
                  Declutter mind fog, map daily habits with beautiful grids, and reflect on thoughts with responsive AI journal guides.
                </p>
              </div>
            </div>
          </div>
        </section>

        <hr className="border-white/[0.08] my-12" />

        {/* FAQ Section */}
        <section className="space-y-6">
          <h2 className="text-2xl font-serif font-medium text-white flex items-center gap-2.5">
            <HelpCircle className="w-5 h-5 text-white/50" /> Frequently Asked Questions
          </h2>
          
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((faq) => (
              <AccordionItem key={faq.id} value={faq.id} className="border-b border-white/10">
                <AccordionTrigger className="text-white hover:text-white/80 font-medium text-sm sm:text-base text-left py-4 hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-white/40 text-xs sm:text-sm leading-relaxed pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.08] bg-black/40 py-8 text-center text-xs text-white/30 shrink-0">
        <div className="max-w-4xl mx-auto px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2026 Bloomport. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }} className="hover:text-white">Home</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }} className="hover:text-white">Documentation</a>
            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }} className="hover:text-white">API Dashboard</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
