import { useState, type ElementType } from 'react';
import { Logo } from '../components/Logo';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import AdBanner from '../components/AdBanner';
import CreditIndicator from '../components/CreditIndicator';
import {
  Terminal,
  Zap,
  Key,
  Shield,
  Code,
  ChevronDown,
  ChevronRight,
  Search,
  Copy,
  Check,
  ArrowRight,
  Menu,
  X,
  Sparkles,
  Layers,
  GitBranch,
  Cpu,
  MessageSquare,
  Globe,
  Lock,
  Sliders,
  Users,
} from 'lucide-react';

interface DocSection {
  id: string;
  icon: ElementType;
  title: string;
  description: string;
}

interface DocTopic {
  id: string;
  icon: ElementType;
  title: string;
  description: string;
}

const docSections: DocSection[] = [
  { id: 'getting-started', icon: Rocket, title: 'Getting Started', description: 'Everything you need to begin integrating Bloomport into your applications.' },
  { id: 'core-concepts', icon: Cpu, title: 'Core Concepts', description: 'Understand the fundamental principles behind the Bloomport platform.' },
  { id: 'api-reference', icon: Code, title: 'API Reference', description: 'Complete API documentation including endpoints, parameters, and responses.' },
  { id: 'sdks', icon: Layers, title: 'SDKs & Clients', description: 'Official client libraries for popular programming languages and frameworks.' },
  { id: 'examples', icon: GitBranch, title: 'Examples & Guides', description: 'Real-world usage examples and step-by-step integration guides.' },
  { id: 'best-practices', icon: Shield, title: 'Best Practices', description: 'Recommended patterns for building reliable, production-ready applications.' },
];

const gettingStartedTopics: DocTopic[] = [
  { id: 'quickstart', icon: Zap, title: 'Quickstart', description: 'Make your first API call in under 5 minutes.' },
  { id: 'authentication', icon: Key, title: 'Authentication', description: 'How to securely authenticate with the Bloomport API.' },
  { id: 'installation', icon: Terminal, title: 'Installation', description: 'Set up the SDK in your preferred language.' },
  { id: 'first-request', icon: MessageSquare, title: 'Your First Request', description: 'Walk through a complete request-response cycle.' },
];

const coreConcepts: DocTopic[] = [
  { id: 'models', icon: Cpu, title: 'Models', description: 'Learn about available models and their capabilities.' },
  { id: 'tokens', icon: Zap, title: 'Tokens & Credits', description: 'How tokenization, pricing, and credit usage work.' },
  { id: 'context', icon: MessageSquare, title: 'Context Windows', description: 'Understanding context limits and management strategies.' },
  { id: 'streaming', icon: GitBranch, title: 'Streaming', description: 'Real-time response streaming for interactive experiences.' },
];

const codeSnippets = {
  curl: `curl -X POST https://api.bloomport.ai/v1/chat/completions \\\
  -H "Authorization: Bearer $BLOOMPORT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "bloomport-v1",
    "messages": [
      {"role": "system", "content": "You are a calm, mindful assistant."},
      {"role": "user", "content": "Help me plan my day with intention."}
    ],
    "temperature": 0.7,
    "max_tokens": 512
  }'`,
  python: `import bloomport

client = bloomport.Client(api_key="YOUR_API_KEY")

response = client.chat.completions.create(
    model="bloomport-v1",
    messages=[
        {"role": "system", "content": "You are a calm, mindful assistant."},
        {"role": "user", "content": "Help me plan my day with intention."}
    ],
    temperature=0.7,
    max_tokens=512
)

print(response.choices[0].message.content)`,
  javascript: `import Bloomport from 'bloomport-sdk';

const client = new Bloomport({
  apiKey: process.env.BLOOMPORT_API_KEY,
});

const response = await client.chat.completions.create({
  model: 'bloomport-v1',
  messages: [
    { role: 'system', content: 'You are a calm, mindful assistant.' },
    { role: 'user', content: 'Help me plan my day with intention.' },
  ],
  temperature: 0.7,
  max_tokens: 512,
});

console.log(response.choices[0].message.content);`,
  typescript: `import Bloomport from 'bloomport-sdk';
import type { ChatCompletionParams } from 'bloomport-sdk/types';

const client = new Bloomport({
  apiKey: process.env.BLOOMPORT_API_KEY!,
});

const params: ChatCompletionParams = {
  model: 'bloomport-v1',
  messages: [
    { role: 'system', content: 'You are a calm, mindful assistant.' },
    { role: 'user', content: 'Help me plan my day with intention.' },
  ],
  temperature: 0.7,
  max_tokens: 512,
};

async function generate() {
  const response = await client.chat.completions.create(params);
  return response.choices[0].message.content;
}`,
  go: `package main

import (
  "context"
  "fmt"
  "log"

  bloomport "github.com/bloomport-ai/go-sdk"
)

func main() {
  client := bloomport.NewClient("YOUR_API_KEY")

  resp, err := client.Chat.Completions.Create(
    context.Background(),
    &bloomport.ChatCompletionParams{
      Model: "bloomport-v1",
      Messages: []bloomport.Message{
        {Role: "system", Content: "You are a calm, mindful assistant."},
        {Role: "user", Content: "Help me plan my day with intention."},
      },
      Temperature: 0.7,
      MaxTokens:   512,
    },
  )
  if err != nil {
    log.Fatal(err)
  }
  fmt.Println(resp.Choices[0].Message.Content)
}`,
};

const faqItems = [
  {
    q: 'What is an API credit?',
    a: 'An API credit is the unit of measurement for usage of the Bloomport API. Each credit roughly corresponds to ~1,000 tokens processed (input + output). Different models may have different credit multipliers based on their computational requirements.',
  },
  {
    q: 'How do I get an API key?',
    a: 'Navigate to the API page, click "Generate New Key", and copy your key immediately. Keys are shown only once at creation — though you can reveal or regenerate them from your dashboard at any time.',
  },
  {
    q: 'Do credits expire?',
    a: 'No. Purchased credits never expire. They remain in your account until used, regardless of your subscription tier or payment cycle.',
  },
  {
    q: 'What kind of rate limits do you have?',
    a: 'Rate limits vary by tier. Starter plans get 60 requests/minute, Pro plans get 300 requests/minute, and Enterprise plans get custom rate limits with dedicated infrastructure.',
  },
  {
    q: 'Is my data private?',
    a: 'Yes. We take data privacy seriously. API data is encrypted in transit and at rest. We do not train on production API traffic unless you explicitly opt in. Enterprise plans support on-premise deployments and custom data retention policies.',
  },
  {
    q: 'Do you offer a free tier?',
    a: 'Yes! New users receive 10,000 free credits to explore the platform. No credit card required. This gives you plenty of room to build and test your integration before committing to a paid plan.',
  },
];

// Custom Rocket icon since we don't have it
function Rocket({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  );
}

function CodeBlock({ code, language }: { code: string; language: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="relative bg-[#0d0d0d] border border-white/10 rounded-xl overflow-hidden group">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-white/40" />
          <span className="text-xs font-medium text-white/50 uppercase tracking-wider">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer opacity-0 group-hover:opacity-100"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-white/60" />
              <span className="text-white/60">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 sm:p-5 overflow-x-auto">
        <code className="text-xs sm:text-sm font-mono text-white/70 leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function LanguageTabs({ activeTab, onTabChange }: { activeTab: string; onTabChange: (tab: string) => void }) {
  const tabs = [
    { id: 'curl', label: 'cURL' },
    { id: 'python', label: 'Python' },
    { id: 'javascript', label: 'JavaScript' },
    { id: 'typescript', label: 'TypeScript' },
    { id: 'go', label: 'Go' },
  ];

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer',
            activeTab === tab.id
              ? 'bg-white/10 text-white border border-white/20'
              : 'text-white/50 hover:text-white/70 border border-transparent hover:border-white/10'
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

function SidebarNav({
  activeSection,
  onSectionChange,
  isOpen,
  onClose,
  onNavigateHome,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onNavigateHome: () => void;
}) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden" onClick={onClose} />
      )}

      <aside
        className={cn(
          'fixed md:sticky top-0 left-0 z-50 md:z-0 h-screen md:h-auto w-[280px] md:w-64 shrink-0 bg-[#0d0d0d] md:bg-transparent border-r border-white/10 overflow-y-auto transition-transform duration-300 pt-4 pb-8',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className="px-4 pb-4 border-b border-white/10 md:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2" onClick={() => { onSectionChange('getting-started'); onClose(); }}>
              <Logo className="h-6 w-auto" variant="dark" />
              <span className="text-lg font-bold tracking-tight">Docs</span>
            </div>
            <button onClick={onClose} className="text-white/50 hover:text-white cursor-pointer p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <nav className="px-3 pt-4 md:pt-0 space-y-1">
          {docSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => { onSectionChange(section.id); onClose(); }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-left transition-all cursor-pointer',
                  isActive
                    ? 'bg-white/10 text-white font-medium border border-white/10'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{section.title}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-6 px-3">
          <div className="h-px bg-white/10 mb-4" />
          <button
            onClick={() => { onNavigateHome(); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all cursor-pointer text-left"
          >
            <Globe className="w-4 h-4" />
            <span>Back to Website</span>
          </button>
        </div>
      </aside>
    </>
  );
}

export default function DocsPage({
  onNavigateHome,
  onNavigateApp,
  onNavigateApi,
}: {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
  onNavigateApi: () => void;
}) {
  const [activeSection, setActiveSection] = useState('getting-started');
  const [activeLanguage, setActiveLanguage] = useState('curl');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="bg-[#0a0a0a] text-white font-body-md min-h-screen flex flex-col">
      {/* Header */}
      <header className="w-full z-30 flex items-center justify-between px-6 py-3.5 bg-black border-b border-white/10 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <button
            onClick={() => setSidebarOpen(true)}
            className="md:hidden text-white/50 hover:text-white cursor-pointer p-1 -ml-1"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo className="h-5 w-auto" variant="dark" />
          <span className="text-[9px] font-semibold text-white/50 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95 origin-left">
            Docs
          </span>
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium font-sans text-white/50">
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApp(); }}>Models</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }}>API</a>
          <a className="text-white transition-colors border-b border-white pb-0.5" href="#" onClick={(e) => { e.preventDefault(); }}>Docs</a>
        </nav>

        <div className="flex items-center gap-4">
          <CreditIndicator variant="dark" />
          <WalletDropdown variant="app" />
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar */}
        <SidebarNav
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onNavigateHome={onNavigateHome}
        />

        {/* Main Content */}
        <main className="flex-1 min-w-0 overflow-y-auto bg-[linear-gradient(to_right,rgba(255,255,255,0.008)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.008)_1px,transparent_1px)] bg-[size:40px_40px]">
          {/* Search Bar */}
          <div className="sticky top-0 z-20 bg-[#0a0a0a]/95 backdrop-blur-sm border-b border-white/10 px-4 sm:px-8 py-3">
            <div className="max-w-4xl mx-auto relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/[0.06] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white/80 placeholder:text-white/30 focus:outline-none focus:border-white/20 focus:bg-white/[0.08] transition-all"
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-white/10 text-[10px] font-mono text-white/40">
                <span>⌘</span>K
              </kbd>
            </div>
          </div>

          <div className="px-4 sm:px-8 py-8 sm:py-12">
            <div className="max-w-4xl mx-auto">
              {/* Section Header */}
              {docSections.map((section) => {
                if (section.id !== activeSection) return null;
                const Icon = section.icon;
                return (
                  <div key={section.id} className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-white/[0.06] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-white/70" />
                      </div>
                      <div>
                        <h1 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight">
                          {section.title}
                        </h1>
                      </div>
                    </div>
                    <p className="text-white/50 text-base sm:text-lg max-w-2xl">
                      {section.description}
                    </p>
                  </div>
                );
              })}

              {/* Getting Started Section */}
              {activeSection === 'getting-started' && (
                <div className="space-y-12">
                  {/* Quick Links */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gettingStartedTopics.map((topic) => {
                      const Icon = topic.icon;
                      return (
                        <a
                          key={topic.id}
                          href={`#${topic.id}`}
                          className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all group"
                        >
                          <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0 group-hover:bg-white/[0.1] transition-colors">
                            <Icon className="w-5 h-5 text-white/60 group-hover:text-white transition-colors" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white/90 mb-1 group-hover:text-white transition-colors">
                              {topic.title}
                            </h3>
                            <p className="text-xs text-white/40 leading-relaxed">{topic.description}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/50 shrink-0 mt-1 ml-auto transition-all group-hover:translate-x-0.5" />
                        </a>
                      );
                    })}
                  </div>

                  {/* Quickstart */}
                  <section id="quickstart" className="scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <Zap className="w-5 h-5 text-white/70" />
                      Quickstart
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                      Get started with the Bloomport API in minutes. Follow these steps to make your first API call.
                    </p>

                    <div className="space-y-8">
                      <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">1</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1.5">Get your API key</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Navigate to the{' '}
                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }} className="text-white/70 hover:underline">
                              API dashboard
                            </a>{' '}
                            and generate a new key. Store it securely as an environment variable.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">2</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1.5">Choose your language</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Select your preferred language from the tabs below and copy the example code.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-bold text-white">3</span>
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1.5">Make your first request</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Run the code to generate a response. Your first 10,000 credits are free — no credit card needed.
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <LanguageTabs activeTab={activeLanguage} onTabChange={setActiveLanguage} />
                      <CodeBlock code={codeSnippets[activeLanguage as keyof typeof codeSnippets]} language={activeLanguage === 'curl' ? 'cURL' : activeLanguage === 'javascript' ? 'JavaScript' : activeLanguage === 'typescript' ? 'TypeScript' : activeLanguage === 'go' ? 'Go' : 'Python'} />
                    </div>
                  </section>

                  {/* Authentication */}
                  <section id="authentication" className="scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <Key className="w-5 h-5 text-white/70" />
                      Authentication
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                      All API requests require authentication via a bearer token in the <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header.
                    </p>

                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 space-y-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-white/70 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-white/90 mb-1">Bearer Authentication</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Include your API key in the <code className="text-white/70 bg-white/[0.06] px-1.5 py-0.5 rounded text-xs font-mono">Authorization</code> header as a Bearer token.
                            Never expose your API key in client-side code.
                          </p>
                        </div>
                      </div>
                      <CodeBlock
                        code={`# Set your API key as an environment variable
export BLOOMPORT_API_KEY="bp_live_your_key_here"

# Or pass it directly in the header
curl -X POST https://api.bloomport.ai/v1/chat/completions \\\
  -H "Authorization: Bearer $BLOOMPORT_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"model": "bloomport-v1", "messages": [{"role": "user", "content": "Hello"}]}'`}
                        language="Shell"
                      />
                    </div>

                    <div className="mt-6 p-4 rounded-xl bg-white/[0.05] border border-white/10">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-white/60 shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-semibold text-white/80 mb-1">Security Best Practice</h3>
                          <p className="text-sm text-white/50 leading-relaxed">
                            Always store API keys in environment variables or a secrets manager. Never hardcode keys in source
                            code or expose them in client-side JavaScript.
                          </p>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Installation */}
                  <section id="installation" className="scroll-mt-24">
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-white/70" />
                      Installation
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                      Install the official Bloomport SDK for your preferred programming language.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white/90 mb-3">Python</h3>
                        <CodeBlock code="pip install bloomport-sdk" language="Bash" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white/90 mb-3">Node.js / TypeScript</h3>
                        <CodeBlock code="npm install bloomport-sdk" language="Bash" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white/90 mb-3">Go</h3>
                        <CodeBlock code="go get github.com/bloomport-ai/go-sdk" language="Bash" />
                      </div>
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                        <h3 className="text-sm font-semibold text-white/90 mb-3">Rust</h3>
                        <CodeBlock code="cargo add bloomport-sdk" language="Bash" />
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {/* Core Concepts */}
              {activeSection === 'core-concepts' && (
                <div className="space-y-12">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {coreConcepts.map((topic) => {
                      const Icon = topic.icon;
                      return (
                        <div
                          key={topic.id}
                          className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all group"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                              <Icon className="w-4.5 h-4.5 text-white/60 group-hover:text-white transition-colors" />
                            </div>
                            <h3 className="text-sm font-semibold text-white/90">{topic.title}</h3>
                          </div>
                          <p className="text-xs text-white/40 leading-relaxed">{topic.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Models */}
                  <section>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <Cpu className="w-5 h-5 text-white/70" />
                      Available Models
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                      Bloomport offers a range of models optimized for different use cases — from quick reflection prompts
                      to deep therapeutic conversations.
                    </p>
                    <div className="overflow-x-auto rounded-xl border border-white/10">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.03]">
                            <th className="py-3.5 px-5 text-xs font-semibold text-white/40 uppercase tracking-wider">Model</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-white/40 uppercase tracking-wider">Context</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">Pricing</th>
                            <th className="py-3.5 px-5 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Best For</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { name: 'bloomport-v1', context: '8K', pricing: '1 credit / 1K tokens', bestFor: 'General purpose' },
                            { name: 'bloomport-v1-16k', context: '16K', pricing: '2 credits / 1K tokens', bestFor: 'Long-form conversations' },
                            { name: 'bloomport-v1-32k', context: '32K', pricing: '4 credits / 1K tokens', bestFor: 'Deep sessions' },
                            { name: 'bloomport-light', context: '4K', pricing: '0.5 credits / 1K tokens', bestFor: 'Quick check-ins' },
                          ].map((model) => (
                            <tr key={model.name} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                              <td className="py-3.5 px-5 font-mono text-sm text-white/80">{model.name}</td>
                              <td className="py-3.5 px-5 text-white/60">{model.context}</td>
                              <td className="py-3.5 px-5 text-white/60 hidden sm:table-cell">{model.pricing}</td>
                              <td className="py-3.5 px-5 text-white/60 hidden md:table-cell">{model.bestFor}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {/* Tokens & Credits */}
                  <section>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <Zap className="w-5 h-5 text-white/70" />
                      Tokens & Credits
                    </h2>
                    <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-4">
                      Bloomport uses a token-based pricing system. Input and output text is broken into tokens —
                      roughly 4 characters or ~0.75 words per token — and each API call consumes credits based on the
                      total tokens processed and the model used.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      {[
                        { label: 'Input tokens', desc: 'Tokens in your prompt and messages' },
                        { label: 'Output tokens', desc: 'Tokens in the generated response' },
                        { label: 'Total credits', desc: 'Input + output × model multiplier' },
                      ].map((item) => (
                        <div key={item.label} className="p-4 rounded-xl bg-white/[0.03] border border-white/10">
                          <h3 className="text-sm font-semibold text-white/90 mb-1">{item.label}</h3>
                          <p className="text-xs text-white/40">{item.desc}</p>
                        </div>
                      ))}
                    </div>

                    <CodeBlock
                      code={`// Example: Estimating credit usage
// Prompt: 150 tokens × 1 credit = 150 credits
// Response: 200 tokens × 1 credit = 200 credits
// Total: 350 credits for this request`}
                      language="Comment"
                    />
                  </section>
                </div>
              )}

              {/* API Reference */}
              {activeSection === 'api-reference' && (
                <div className="space-y-12">
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                    The Bloomport API is organized around RESTful principles. Our API accepts JSON-encoded request bodies
                    and returns JSON-encoded responses. All requests must be made over HTTPS.
                  </p>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4">Base URL</h2>
                    <CodeBlock code="https://api.bloomport.ai/v1" language="Text" />
                  </div>

                  <div>
                    <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-4 flex items-center gap-3">
                      <MessageSquare className="w-5 h-5 text-white/70" />
                      Chat Completions
                    </h2>

                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5 mb-6">
                      <div className="flex items-center gap-3 mb-3">
                        <Badge className="bg-white/10 text-white/70 border-0 text-xs font-mono">POST</Badge>
                        <code className="text-sm font-mono text-white/80">/chat/completions</code>
                      </div>
                      <p className="text-sm text-white/50 leading-relaxed">
                        Creates a model response for a given chat conversation. Supports streaming via Server-Sent Events (SSE).
                      </p>
                    </div>

                    <h3 className="text-base font-semibold text-white/90 mb-3">Request Body Parameters</h3>
                    <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="border-b border-white/10 bg-white/[0.03]">
                            <th className="py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Parameter</th>
                            <th className="py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Type</th>
                            <th className="py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Required</th>
                            <th className="py-3 px-4 text-xs font-semibold text-white/40 uppercase tracking-wider">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { param: 'model', type: 'string', required: 'Yes', desc: 'ID of the model to use. See Available Models.' },
                            { param: 'messages', type: 'array', required: 'Yes', desc: 'Array of message objects with role and content.' },
                            { param: 'temperature', type: 'number', required: 'No', desc: 'Sampling temperature (0-2). Default: 0.7.' },
                            { param: 'max_tokens', type: 'integer', required: 'No', desc: 'Maximum tokens to generate. Default: 256.' },
                            { param: 'stream', type: 'boolean', required: 'No', desc: 'Whether to stream responses. Default: false.' },
                            { param: 'top_p', type: 'number', required: 'No', desc: 'Nucleus sampling threshold. Default: 1.0.' },
                          ].map((row) => (
                            <tr key={row.param} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                              <td className="py-3 px-4 font-mono text-xs text-white/80">{row.param}</td>
                              <td className="py-3 px-4 text-xs text-white/50">{row.type}</td>
                              <td className="py-3 px-4 text-xs text-white/50">{row.required}</td>
                              <td className="py-3 px-4 text-xs text-white/50">{row.desc}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <h3 className="text-base font-semibold text-white/90 mb-3">Example Request</h3>
                    <CodeBlock code={codeSnippets.curl} language="cURL" />

                    <h3 className="text-base font-semibold text-white/90 mb-3 mt-6">Example Response</h3>
                    <CodeBlock
                      code={`{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1715000000,
  "model": "bloomport-v1",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "Good morning. Let's start by taking three deep breaths together..."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 120,
    "total_tokens": 165
  }
}`}
                      language="JSON"
                    />
                  </div>
                </div>
              )}

              {/* SDKs & Clients */}
              {activeSection === 'sdks' && (
                <div className="space-y-12">
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                    Use our official client libraries to integrate Bloomport into your application. All SDKs are
                    open-source and support the full API surface.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { icon: Terminal, name: 'Python SDK', desc: 'Full-featured Python client with async support.', code: 'pip install bloomport-sdk' },
                      { icon: Code, name: 'Node.js / TypeScript SDK', desc: 'First-class TypeScript support with ESM and CJS.', code: 'npm install bloomport-sdk' },
                      { icon: Globe, name: 'Go SDK', desc: 'Native Go client with zero dependencies.', code: 'go get github.com/bloomport-ai/go-sdk' },
                      { icon: Layers, name: 'Rust SDK', desc: 'Safe, fast Rust bindings with async/await.', code: 'cargo add bloomport-sdk' },
                    ].map((sdk) => {
                      const Icon = sdk.icon;
                      return (
                        <div key={sdk.name} className="p-5 rounded-xl bg-white/[0.03] border border-white/10 hover:border-white/20 hover:bg-white/[0.05] transition-all group">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 rounded-lg bg-white/[0.06] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                              <Icon className="w-4.5 h-4.5 text-white/60 group-hover:text-white transition-all" />
                            </div>
                            <h3 className="text-sm font-semibold text-white/90">{sdk.name}</h3>
                          </div>
                          <p className="text-xs text-white/40 mb-3 leading-relaxed">{sdk.desc}</p>
                          <CodeBlock code={sdk.code} language="Bash" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Examples */}
              {activeSection === 'examples' && (
                <div className="space-y-12">
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                    Explore real-world examples to see Bloomport in action. Each example includes complete, runnable code.
                  </p>

                  <div className="space-y-6">
                    {[
                      {
                        icon: MessageSquare,
                        title: 'Mindful Morning Routine',
                        desc: 'A daily check-in that guides users through a brief mindfulness exercise.',
                        system: 'You are a gentle morning guide. Help the user set a calm intention for their day ahead.',
                        user: 'I have a busy day ahead with back-to-back meetings. Help me find a moment of calm.',
                      },
                      {
                        icon: Users,
                        title: 'Focus Assistant',
                        desc: 'Help users break down overwhelming tasks into manageable, mindful steps.',
                        system: 'You are a focus coach. Help users identify priorities and break down tasks mindfully.',
                        user: 'I feel overwhelmed by my project. Can you help me find clarity?',
                      },
                      {
                        icon: Sliders,
                        title: 'Streaming Chat',
                        desc: 'Real-time response streaming for interactive conversational experiences.',
                        system: 'You are a calm, present conversational partner.',
                        user: 'Walk me through a 60-second breathing exercise.',
                      },
                    ].map((example) => {
                      const Icon = example.icon;
                      return (
                        <div key={example.title} className="p-5 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="flex items-center gap-3 mb-3">
                            <Icon className="w-5 h-5 text-white/70" />
                            <h3 className="text-base font-semibold text-white/90">{example.title}</h3>
                          </div>
                          <p className="text-sm text-white/50 mb-4">{example.desc}</p>
                          <div className="space-y-2 mb-4">
                            <div className="flex items-start gap-2">
                              <Badge className="bg-white/10 text-white/70 border-0 text-[10px] shrink-0 mt-0.5">System</Badge>
                              <p className="text-xs text-white/50 italic">"{example.system}"</p>
                            </div>
                            <div className="flex items-start gap-2">
                              <Badge className="bg-white/10 text-white/60 border-0 text-[10px] shrink-0 mt-0.5">User</Badge>
                              <p className="text-xs text-white/50 italic">"{example.user}"</p>
                            </div>
                          </div>
                          <button
                            onClick={() => setActiveLanguage('python')}
                            className="text-xs text-white/70 hover:underline cursor-pointer"
                          >
                            View code example →
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Best Practices */}
              {activeSection === 'best-practices' && (
                <div className="space-y-12">
                  <p className="text-white/60 text-sm sm:text-base leading-relaxed mb-6">
                    Follow these guidelines to build reliable, secure, and efficient applications with the Bloomport API.
                  </p>

                  <div className="space-y-6">
                    {[
                      {
                        icon: Lock,
                        title: 'Secure Your API Keys',
                        desc: 'Never expose API keys in client-side code, version control, or logs. Use environment variables or a secrets manager.',
                      },
                      {
                        icon: GitBranch,
                        title: 'Implement Retry Logic',
                        desc: 'Network failures and rate limits are inevitable. Implement exponential backoff with jitter for resilient applications.',
                      },
                      {
                        icon: Zap,
                        title: 'Optimize Token Usage',
                        desc: 'Keep system prompts concise and include only necessary context. Use the minimal model that meets your needs to reduce costs.',
                      },
                      {
                        icon: MessageSquare,
                        title: 'Stream for Better UX',
                        desc: 'Enable streaming for chat interfaces to provide real-time feedback and reduce perceived latency.',
                      },
                      {
                        icon: Shield,
                        title: 'Validate Responses',
                        desc: 'Always validate API responses and handle errors gracefully. Implement timeouts to prevent hanging requests.',
                      },
                      {
                        icon: Sliders,
                        title: 'Tune Temperature Carefully',
                        desc: 'Lower temperatures (0.1-0.5) for focused, deterministic output. Higher temperatures (0.7-1.0) for creative responses.',
                      },
                    ].map((practice) => {
                      const Icon = practice.icon;
                      return (
                        <div key={practice.title} className="flex items-start gap-4 p-5 rounded-xl bg-white/[0.03] border border-white/10">
                          <div className="w-10 h-10 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                            <Icon className="w-5 h-5 text-white/70" />
                          </div>
                          <div>
                            <h3 className="text-sm font-semibold text-white/90 mb-1">{practice.title}</h3>
                            <p className="text-sm text-white/50 leading-relaxed">{practice.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* FAQ */}
              <section className="mt-16 pt-12 border-t border-white/10">
                <h2 className="text-xl sm:text-2xl font-serif font-semibold tracking-tight mb-2 flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-white/70" />
                  Frequently Asked Questions
                </h2>
                <p className="text-white/50 text-sm sm:text-base mb-8 max-w-2xl">
                  Quick answers to common questions about the Bloomport API and platform.
                </p>
                <div className="space-y-3">
                  {faqItems.map((item) => (
                    <details
                      key={item.q}
                      className="group rounded-xl bg-white/[0.03] border border-white/10 overflow-hidden [&[open]]:bg-white/[0.05] transition-all"
                    >
                      <summary className="flex items-center justify-between px-5 py-4 cursor-pointer text-sm font-medium text-white/80 hover:text-white list-none transition-colors">
                        <span>{item.q}</span>
                        <ChevronDown className="w-4 h-4 text-white/30 group-open:rotate-180 transition-transform shrink-0 ml-4" />
                      </summary>
                      <div className="px-5 pb-4">
                        <p className="text-sm text-white/50 leading-relaxed">{item.a}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>

              {/* CTA */}
              <section className="mt-16 pt-12 border-t border-white/10 relative overflow-hidden">
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.03),transparent_70%)]"
                />
                <div className="relative text-center">
                  <h2 className="text-2xl sm:text-3xl font-serif font-semibold tracking-tight mb-3">
                    Ready to build with <span className="italic text-white/70">Bloomport?</span>
                  </h2>
                  <p className="text-white/50 text-sm sm:text-base mb-8 max-w-lg mx-auto">
                    Start with 10,000 free credits. No credit card required.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => { onNavigateApp(); }}
                      className="bg-white text-black px-6 py-3 rounded-full flex items-center space-x-2 text-sm font-medium hover:bg-white/90 transition-all group cursor-pointer w-full sm:w-auto justify-center"
                    >
                      <span>Start Building</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </button>
                    <a
                      href="#getting-started"
                      onClick={(e) => { e.preventDefault(); setActiveSection('getting-started'); }}
                      className="border border-white/20 px-6 py-3 rounded-full text-sm font-medium hover:bg-white/5 transition-all w-full sm:w-auto justify-center inline-flex items-center"
                    >
                      Back to Top
                    </a>
                  </div>
                </div>
              </section>

              {/* Ad Placements */}
              <div className="mt-16 w-full max-w-4xl mx-auto">
                <AdBanner layout="horizontal" />
              </div>

              {/* Footer */}
              <footer className="mt-16 pt-8 border-t border-white/10">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/40">
                  <p>© 2024 Bloomport. All rights reserved.</p>
                  <div className="flex items-center gap-4">
                    <a href="#" className="hover:text-white/60 transition-colors">Privacy Policy</a>
                    <a href="#" className="hover:text-white/60 transition-colors">Terms of Service</a>
                    <a href="#" className="hover:text-white/60 transition-colors">Contact</a>
                  </div>
                </div>
              </footer>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
