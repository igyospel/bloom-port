import { useState, useCallback } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../components/ui/dialog';
import {
  Key,
  Copy,
  Check,
  Zap,
  Shield,
  Terminal,
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
} from 'lucide-react';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
}

const pricingTiers = [
  {
    name: 'Starter',
    price: '$9',
    period: '/month',
    description: 'Perfect for individuals and small projects.',
    credits: '50,000',
    features: [
      '50,000 API credits / month',
      'Standard response speed',
      'Community support',
      'Basic analytics',
    ],
    cta: 'Get Started',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams with higher volume needs.',
    credits: '250,000',
    features: [
      '250,000 API credits / month',
      'Priority response speed',
      'Email support',
      'Advanced analytics',
      'Custom model tuning',
    ],
    cta: 'Upgrade to Pro',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Dedicated infrastructure for large-scale deployments.',
    credits: 'Unlimited',
    features: [
      'Unlimited API credits',
      'Dedicated infrastructure',
      '24/7 priority support',
      'SLA guarantee',
      'Custom contracts',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    highlighted: false,
  },
];

const codeExample = `curl -X POST https://api.bloomport.ai/v1/generate \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "bloomport-v1",
    "prompt": "Help me find focus for the day ahead.",
    "max_tokens": 512
  }'`;

export default function ApiPage({
  onNavigateHome,
  onNavigateApp,
  onNavigateDocs,
}: {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
  onNavigateDocs: () => void;
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-1',
      name: 'Production Key',
      key: 'bp_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456',
      createdAt: 'May 15, 2026',
      lastUsed: '2 hours ago',
    },
  ]);
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const generateKey = useCallback(() => {
    const randomKey = 'bp_live_' + Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))
    ).join('');

    setApiKeys((prev) => {
      const newApiKey: ApiKey = {
        id: `key-${Date.now()}`,
        name: `Key ${prev.length + 1}`,
        key: randomKey,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUsed: 'Never',
      };
      return [...prev, newApiKey];
    });
    setNewKeyValue(randomKey);
    setShowNewKeyDialog(true);
  }, []);

  const copyToClipboard = useCallback(async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch {
      console.warn('Failed to copy to clipboard');
    }
  }, []);

  const toggleKeyVisibility = useCallback((id: string) => {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const deleteKey = useCallback((id: string) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
  }, []);

  function maskKey(key: string) {
    if (key.startsWith('bp_live_')) {
      return 'bp_live_' + '*'.repeat(32);
    }
    if (key.startsWith('bp_test_')) {
      return 'bp_test_' + '*'.repeat(32);
    }
    return '*'.repeat(key.length);
  }

  return (
    <div className="bg-[#0a0a0a] text-white font-body-md min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="w-full z-50 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 bg-[#0a0a0a] border-b border-white/10 text-white shadow-sm shrink-0">
        <div className="flex items-center space-x-2 cursor-pointer" onClick={onNavigateHome}>
          <Logo className="w-6 h-6 sm:w-8 sm:h-8" variant="dark" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight">Bloomport</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[14px] lg:text-[15px] font-medium font-sans text-white/80">
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApp(); }}>Models</a>
          <a className="text-white transition-colors" href="#">API</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }}>Docs</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-white/50 hover:text-white cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <WalletDropdown variant="app" />
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={cn(
          'fixed top-0 left-0 z-[110] h-full w-[280px] bg-[#0a0a0a] text-white shadow-2xl transform transition-transform duration-300 md:hidden',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
          <span className="text-lg font-bold tracking-tight">Navigate</span>
          <button
            onClick={closeMobileMenu}
            className="p-1 text-white/50 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="px-3 pt-4 space-y-1">
          <button
            onClick={() => { onNavigateHome(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >Home</button>
          <button
            onClick={() => { onNavigateApp(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >Models</button>
          <button
            onClick={() => { closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >API</button>
          <button
            onClick={() => { onNavigateDocs(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >Docs</button>
        </nav>
      </div>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 px-4 sm:px-8 border-b border-white/10">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,142,92,0.08),transparent_70%)]"
          />
          <div className="max-w-5xl mx-auto text-center relative">
            <Badge className="mb-6 bg-white/10 text-white/80 hover:bg-white/15 border-white/10 backdrop-blur-sm">
              <Sparkles className="w-3 h-3 mr-1.5" />
              Now Available
            </Badge>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-medium tracking-tight mb-6">
              Bloomport <span className="italic text-white/70">API</span>
            </h1>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/60 leading-relaxed mb-10">
              Build mindful AI experiences into your own applications. Purchase credits, generate keys, and integrate our calm intelligence with a single API call.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#pricing"
                className="bg-white text-brand-dark px-6 py-3 rounded-full flex items-center space-x-2 text-sm font-medium hover:bg-white/90 transition-all group w-full sm:w-auto justify-center"
              >
                <span>View Pricing</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#keys"
                className="border border-white/20 px-6 py-3 rounded-full flex items-center space-x-2 text-sm font-medium hover:bg-white/5 transition-all w-full sm:w-auto justify-center"
              >
                <Key className="h-4 w-4 opacity-60" />
                <span>Manage Keys</span>
              </a>
            </div>
          </div>
        </section>

        {/* Stats Bar */}
        <section className="border-b border-white/10 bg-white/[0.02]">
          <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { label: 'Uptime SLA', value: '99.99%' },
                { label: 'Avg. Latency', value: '< 200ms' },
                { label: 'Active Developers', value: '2,400+' },
                { label: 'Requests Served', value: '50M+' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <p className="text-2xl sm:text-3xl font-semibold tracking-tight text-white mb-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-white/40 font-medium tracking-wide uppercase">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-8 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-medium tracking-tight mb-4">
                Simple, credit-based <span className="italic text-white/70">pricing</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto text-base sm:text-lg">
                Pay for what you use. No hidden fees, no surprises. Top up anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {pricingTiers.map((tier) => (
                <Card
                  key={tier.name}
                  className={cn(
                    'relative rounded-2xl border transition-all duration-300',
                    tier.highlighted
                      ? 'bg-white/[0.06] border-white/20 shadow-[0_0_40px_-12px_rgba(255,255,255,0.08)] scale-[1.02]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/15 hover:bg-white/[0.04]'
                  )}
                >
                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-white text-brand-dark border-0 text-xs font-semibold px-3 py-1">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4 pt-8">
                    <CardTitle className="text-xl font-semibold tracking-tight text-white">
                      {tier.name}
                    </CardTitle>
                    <CardDescription className="text-white/50 text-sm mt-1.5">
                      {tier.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-semibold tracking-tight text-white">{tier.price}</span>
                      <span className="text-white/40 text-sm">{tier.period}</span>
                    </div>
                    <div className="flex items-center gap-2 py-3 px-4 rounded-xl bg-white/[0.04] border border-white/10">
                      <Zap className="w-4 h-4 text-[#7b8e5c]" />
                      <span className="text-sm font-medium text-white/80">
                        {tier.credits} credits / month
                      </span>
                    </div>
                    <ul className="space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-3 text-sm text-white/70">
                          <Check className="w-4 h-4 text-[#7b8e5c] shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => alert('Coming soon — payment integration in progress.')}
                      className={cn(
                        'w-full py-3 rounded-full text-sm font-medium transition-all cursor-pointer',
                        tier.highlighted
                          ? 'bg-white text-brand-dark hover:bg-white/90'
                          : 'bg-white/10 text-white hover:bg-white/15 border border-white/10'
                      )}
                    >
                      {tier.cta}
                    </button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Credit Top-up */}
            <div className="mt-16 max-w-2xl mx-auto">
              <Card className="bg-white/[0.03] border-white/10 rounded-2xl">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#7b8e5c]" />
                    Buy Additional Credits
                  </CardTitle>
                  <CardDescription className="text-white/50 text-sm">
                    Running low? Top up instantly. Credits never expire.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { amount: '10,000', price: '$5' },
                      { amount: '50,000', price: '$20' },
                      { amount: '100,000', price: '$35' },
                      { amount: '500,000', price: '$150' },
                    ].map((topup) => (
                      <button
                        key={topup.amount}
                        onClick={() => alert('Coming soon — payment integration in progress.')}
                        className="flex flex-col items-center p-4 rounded-xl bg-white/[0.04] border border-white/10 hover:border-white/20 hover:bg-white/[0.06] transition-all cursor-pointer group"
                      >
                        <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">{topup.amount}</span>
                        <span className="text-xs text-white/40 mt-1">{topup.price}</span>
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* API Key Management */}
        <section id="keys" className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10 bg-white/[0.02]">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight mb-3">
                  API <span className="italic text-white/70">Keys</span>
                </h2>
                <p className="text-white/50 text-base max-w-lg">
                  Generate and manage your API keys. Keep them secret — they grant access to your credits.
                </p>
              </div>
              <button
                onClick={generateKey}
                className="bg-white text-brand-dark px-5 py-3 rounded-full flex items-center justify-center space-x-2 text-sm font-medium hover:bg-white/90 transition-all cursor-pointer shrink-0"
              >
                <Key className="w-4 h-4" />
                <span>Generate New Key</span>
              </button>
            </div>

            <Card className="bg-white/[0.03] border-white/10 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.03]">
                      <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Name</th>
                      <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider">Key</th>
                      <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider hidden sm:table-cell">Created</th>
                      <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider hidden md:table-cell">Last Used</th>
                      <th className="py-4 px-6 text-xs font-semibold text-white/40 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys.map((apiKey) => {
                      const isVisible = visibleKeys.has(apiKey.id);
                      const displayKey = isVisible ? apiKey.key : maskKey(apiKey.key);
                      return (
                        <tr key={apiKey.id} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                                <Key className="w-3.5 h-3.5 text-white/50" />
                              </div>
                              <span className="text-sm font-medium text-white/90">{apiKey.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            <code className="text-xs sm:text-sm font-mono text-white/50 bg-white/[0.06] px-3 py-1.5 rounded-lg">
                              {displayKey}
                            </code>
                          </td>
                          <td className="py-4 px-6 text-sm text-white/50 hidden sm:table-cell">{apiKey.createdAt}</td>
                          <td className="py-4 px-6 text-sm text-white/50 hidden md:table-cell">{apiKey.lastUsed}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => toggleKeyVisibility(apiKey.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white/40 hover:text-white/70"
                                title={isVisible ? 'Hide key' : 'Show key'}
                              >
                                {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white/40 hover:text-white/70"
                                title="Copy key"
                              >
                                {copiedKey === apiKey.id ? (
                                  <Check className="w-4 h-4 text-[#7b8e5c]" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteKey(apiKey.id)}
                                className="p-2 rounded-lg hover:bg-white/10 transition-colors cursor-pointer text-white/40 hover:text-red-400"
                                title="Delete key"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {apiKeys.length === 0 && (
                <div className="py-16 text-center">
                  <Key className="w-10 h-10 text-white/20 mx-auto mb-4" />
                  <p className="text-white/40 text-sm font-medium">No API keys yet</p>
                  <p className="text-white/30 text-xs mt-1">Generate your first key to get started</p>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-3xl sm:text-4xl font-serif font-medium tracking-tight mb-4">
                  Quick <span className="italic text-white/70">start</span>
                </h2>
                <p className="text-white/50 text-base mb-8 leading-relaxed">
                  Integrate Bloomport into your application in minutes. One endpoint, endless possibilities.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Key, title: 'Get your API key', desc: 'Generate a key from the dashboard above.' },
                    { icon: Terminal, title: 'Make your first request', desc: 'Use our REST endpoint with any HTTP client.' },
                    { icon: Shield, title: 'Build with confidence', desc: 'Production-ready with automatic retries.' },
                  ].map((step, i) => (
                    <div key={step.title} className="flex items-start gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                      <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4 text-white/60" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-white/30">0{i + 1}</span>
                          <h3 className="text-sm font-medium text-white/90">{step.title}</h3>
                        </div>
                        <p className="text-sm text-white/50">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                <div className="absolute -inset-4 bg-[#7b8e5c]/5 rounded-3xl blur-2xl" />
                <div className="relative bg-[#111111] border border-white/10 rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-white/40" />
                      <span className="text-xs font-medium text-white/50">cURL</span>
                    </div>
                    <button
                      onClick={() => copyToClipboard(codeExample, 'code-example')}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'code-example' ? (
                        <>
                          <Check className="w-3 h-3 text-[#7b8e5c]" />
                          <span className="text-[#7b8e5c]">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-5 text-xs sm:text-sm font-mono text-white/70 overflow-x-auto leading-relaxed">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(123,142,92,0.06),transparent_70%)]"
          />
          <div className="max-w-3xl mx-auto text-center relative">
            <h2 className="text-3xl sm:text-5xl font-serif font-medium tracking-tight mb-5">
              Ready to bring calm to your <span className="italic text-white/70">product?</span>
            </h2>
            <p className="text-white/50 text-base sm:text-lg mb-10 max-w-xl mx-auto">
              Start with 10,000 free credits. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => alert('Coming soon — sign-up flow in progress.')} className="bg-white text-brand-dark px-8 py-4 rounded-full flex items-center space-x-2 text-sm font-medium hover:bg-white/90 transition-all group cursor-pointer w-full sm:w-auto justify-center">
                <span>Start for Free</span>
                <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>
              <a
                href="#pricing"
                className="border border-white/20 px-8 py-4 rounded-full flex items-center space-x-2 text-sm font-medium hover:bg-white/5 transition-all w-full sm:w-auto justify-center"
              >
                <span>View Pricing</span>
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-black text-white pt-16 sm:pt-20 pb-8 sm:pb-12 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Logo className="w-6 h-6 sm:w-8 sm:h-8" variant="dark" />
                  <span className="text-xl sm:text-2xl font-bold tracking-tight">Bloomport</span>
                </div>
                <p className="text-white/50 text-sm max-w-xs leading-relaxed">
                  Intelligent Stillness for the modern mind. Harnessing AI to help you find focus in the noise.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 md:gap-16">
                <div>
                  <h4 className="font-semibold text-sm text-white mb-4 tracking-tight">Product</h4>
                  <ul className="space-y-2 text-sm text-white/50">
                    <li><a className="hover:text-white transition-colors" href="#">Models</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">API</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Pricing</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Documentation</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-white mb-4 tracking-tight">Company</h4>
                  <ul className="space-y-2 text-sm text-white/50">
                    <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
                    <li><a className="hover:text-white transition-colors" href="#">Blog</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-xs text-white/40">
              <p>© 2024 Bloomport. All rights reserved.</p>
              <p className="mt-2 md:mt-0 italic">Built for calm.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* New Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="bg-[#111111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-[#7b8e5c]" />
              API Key Generated
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm">
              Copy this key now. You can also reveal it anytime from your key list.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="relative">
              <code className="block w-full p-4 bg-white/[0.05] border border-white/10 rounded-xl text-xs sm:text-sm font-mono text-white/80 break-all">
                {newKeyValue}
              </code>
            </div>
            <button
              onClick={() => {
                copyToClipboard(newKeyValue, 'new-key');
              }}
              className="w-full py-3 rounded-full bg-white text-brand-dark text-sm font-medium hover:bg-white/90 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {copiedKey === 'new-key' ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy to Clipboard</span>
                </>
              )}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


