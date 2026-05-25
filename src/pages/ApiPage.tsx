import { useState, useCallback, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { cn } from '../lib/utils';
import { motion } from 'framer-motion';
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
  Wallet,
  Shield,
  Terminal,
  Sparkles,
  Trash2,
  Eye,
  EyeOff,
  ArrowRight,
  Play,
  Clock,
  Globe,
  Users,
  Database,
  Lock,
  Search,
  Activity,
} from 'lucide-react';
import SEO from '../components/SEO';
import CreditIndicator from '../components/CreditIndicator';
import AdBanner from '../components/AdBanner';
import { useAuth } from '../context/AuthContext';
import { UnifiedProfileControl } from '../components/ui/unified-profile-control';
import { ApiInfrastructureVisualization } from '../components/ui/api-infrastructure-visualization';
import RewardedAdModal from '../components/RewardedAdModal';
import { useCredits } from '../context/CreditContext';
import { ApiKeysVisualization } from '../components/ui/api-keys-visualization';
import { ApiComputeVisualization } from '../components/ui/api-compute-visualization';
import { OrbitalClusterVisualization } from '../components/ui/orbital-cluster-visualization';




interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: string;
  lastUsed: string;
  type: 'live' | 'test';
  scopes: string[];
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

const AnimatedCounter: React.FC<{ value: number; decimals?: number; prefix?: string; suffix?: string }> = ({
  value,
  decimals = 0,
  prefix = '',
  suffix = '',
}) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      setCount(progress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(value);
      }
    };
    window.requestAnimationFrame(step);
  }, [value]);

  return (
    <span>
      {prefix}
      {count.toFixed(decimals)}
      {suffix}
    </span>
  );
};

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
  const [adOpen, setAdOpen] = useState(false);
  const { user } = useAuth();
  const { credits } = useCredits();
  const closeMobileMenu = () => setMobileMenuOpen(false);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: 'key-1',
      name: 'Production Server Key',
      key: 'bp_live_aBcDeFgHiJkLmNoPqRsTuVwXyZ123456',
      createdAt: 'May 15, 2026',
      lastUsed: '2 hours ago',
      type: 'live',
      scopes: ['chat:write', 'journal:write', 'focus:read'],
    },
    {
      id: 'key-2',
      name: 'Local Test Key',
      key: 'bp_test_xYz123456aBcDeFgHiJkLmNoPqRsTuV',
      createdAt: 'May 20, 2026',
      lastUsed: '1 day ago',
      type: 'test',
      scopes: ['chat:write', 'focus:read'],
    },
  ]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'live' | 'test'>('live');
  const [newKeyScopes, setNewKeyScopes] = useState<string[]>(['chat:write']);
  
  const [showNewKeyDialog, setShowNewKeyDialog] = useState(false);
  const [newKeyValue, setNewKeyValue] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  const [keySearch, setKeySearch] = useState('');
  const [envFilter, setEnvFilter] = useState<'all' | 'live' | 'test'>('all');

  const getKeyActivity = useCallback((id: string) => {
    const charSum = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return Array.from({ length: 9 }, (_, i) => {
      const val = ((charSum * (i + 1)) % 45) + 10;
      return val;
    });
  }, []);

  const handleCreateKey = useCallback(() => {
    const prefix = newKeyType === 'live' ? 'bp_live_' : 'bp_test_';
    const randomKey = prefix + Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))
    ).join('');

    setApiKeys((prev) => {
      const newApiKey: ApiKey = {
        id: `key-${Date.now()}`,
        name: newKeyName.trim() || `Key ${prev.length + 1}`,
        key: randomKey,
        createdAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        lastUsed: 'Never',
        type: newKeyType,
        scopes: newKeyScopes,
      };
      return [...prev, newApiKey];
    });

    setNewKeyValue(randomKey);
    setShowCreateDialog(false);
    setShowNewKeyDialog(true);
    setNewKeyName('');
    setNewKeyType('live');
    setNewKeyScopes(['chat:write']);
  }, [newKeyName, newKeyType, newKeyScopes]);

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
      <SEO 
        title="Bloomport API — Free LLM API & Free AI Service Integration" 
        description="Access our free LLM API. Generate free developer API keys, configure rate-limited endpoints, and integrate conversational AI into your apps with 10,000 free compute credits instantly."
        path="/api"
      />
      {/* Header */}
      <header className="w-full z-50 flex items-center justify-between px-6 py-3.5 border-b border-white/10 text-white shadow-sm shrink-0 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
            className="md:hidden p-2 -ml-1 text-white/50 hover:text-white cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Logo className="h-5 w-auto" variant="dark" />
        </div>
        
        <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium font-sans text-white/50">
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApp(); }}>Models</a>
          <a className="text-white transition-colors border-b border-white pb-0.5" href="#" onClick={(e) => { e.preventDefault(); }}>API</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }}>Docs</a>
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
                className="h-8 rounded-full flex items-center px-4 bg-white text-black hover:bg-white/90 text-[12px] font-bold transition-all duration-200 cursor-pointer shadow-[0_0_15px_rgba(255,255,255,0.1)] active:scale-[0.98]"
              >
                Sign Up
              </button>
            </>
          )}
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
        {/* Massive Centered Hero Section */}
        <section className="relative pt-24 pb-28 md:pt-36 md:pb-40 px-4 sm:px-8 border-b border-white/10 overflow-hidden flex flex-col items-center select-none bg-black">
          {/* Radial Spotlight behind heading */}
          <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.045),transparent_65%)] pointer-events-none z-0" />
          <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015),transparent_70%)] pointer-events-none z-0" />

          {/* Noise Texture Overlay */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0 mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
          />

          {/* Live Infrastructure Canvas Visualization */}
          <ApiInfrastructureVisualization />

          {/* Top Volumetric Light Beam */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_75%)] pointer-events-none z-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[350px] h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="max-w-6xl mx-auto text-center relative z-10 flex flex-col items-center">
            
            {/* Announcement Pill */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md shadow-[0_0_15px_rgba(255,255,255,0.02)] mb-8 select-none relative overflow-hidden group cursor-pointer"
            >
              {/* shine sweep */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out" />
              <Sparkles className="w-3 h-3 text-white/80" />
              <span className="text-[11px] font-bold tracking-wider text-white/80 uppercase font-mono">Now Available</span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              className="text-5xl sm:text-7xl md:text-8xl font-bold tracking-[-0.04em] leading-[1.05] mb-6 select-none font-sans max-w-[950px] mx-auto text-center"
            >
              <span className="text-white/60 block">The API for</span>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white/95 to-white/40 block mt-2">
                AI Infrastructure
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[720px] mx-auto text-sm sm:text-base md:text-lg text-white/55 leading-relaxed mb-12 select-none font-sans text-center"
            >
              Build intelligent applications on enterprise-grade infrastructure. Generate API keys, manage workloads, and scale globally with a single integration.
            </motion.p>

            {/* CTA section */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
            >
              <a
                href="#keys"
                className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-white text-black font-semibold text-sm hover:bg-white/95 transition-all duration-300 shadow-[0_4px_20px_rgba(255,255,255,0.15)] hover:translate-y-[-2px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Get API Access</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                onClick={onNavigateDocs}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full border border-white/10 bg-white/[0.02] text-white font-semibold text-sm hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 hover:translate-y-[-2px] hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_0_25px_rgba(255,255,255,0.05)]"
              >
                <span>View Documentation</span>
              </button>
            </motion.div>

            {/* Stats Panel Bento Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-[1100px] mt-24 md:mt-28 select-none relative z-20">
              
              {/* Card 1: Uptime SLA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 flex flex-col items-start text-left relative overflow-hidden group transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-4 text-white/40 group-hover:text-white/70 transition-colors duration-300">
                  <Clock className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Uptime SLA</span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-display">
                  <AnimatedCounter value={99.99} decimals={2} suffix="%" />
                </p>
                <div className="mt-auto w-full pt-4 border-t border-white/[0.04]">
                  <div className="flex items-center gap-1.5 w-full justify-between">
                    {Array.from({ length: 16 }).map((_, i) => (
                      <div
                        key={i}
                        className={cn(
                          "w-1 h-3.5 rounded-full transition-all duration-300",
                          i === 15 ? "bg-emerald-500 animate-pulse" : "bg-emerald-500/80 group-hover:bg-emerald-400"
                        )}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Card 2: Global Latency */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 flex flex-col items-start text-left relative overflow-hidden group transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-4 text-white/40 group-hover:text-white/70 transition-colors duration-300">
                  <Globe className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Global Latency</span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-display">
                  <AnimatedCounter value={200} prefix="< " suffix="ms" />
                </p>
                <div className="mt-auto w-full text-[9px] font-mono text-white/30 border-t border-white/[0.04] pt-4 flex items-center justify-between">
                  <span className="group-hover:text-white/50 transition-colors">SFO 12ms</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                  <span className="group-hover:text-white/50 transition-colors">LHR 54ms</span>
                </div>
              </motion.div>

              {/* Card 3: Developers */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 flex flex-col items-start text-left relative overflow-hidden group transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-4 text-white/40 group-hover:text-white/70 transition-colors duration-300">
                  <Users className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Developers</span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-display">
                  <AnimatedCounter value={2400} suffix="+" />
                </p>
                <div className="mt-auto w-full border-t border-white/[0.04] pt-4 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {[
                      'https://randomuser.me/api/portraits/women/32.jpg',
                      'https://randomuser.me/api/portraits/men/44.jpg',
                      'https://randomuser.me/api/portraits/women/68.jpg',
                      'https://randomuser.me/api/portraits/men/12.jpg'
                    ].map((url, idx) => (
                      <img
                        key={idx}
                        src={url}
                        alt="Developer"
                        className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover"
                      />
                    ))}
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-semibold bg-emerald-500/[0.08] border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                    42 online
                  </span>
                </div>
              </motion.div>

              {/* Card 4: Requests */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.55, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -4, borderColor: 'rgba(255,255,255,0.15)', backgroundColor: 'rgba(255,255,255,0.025)' }}
                className="rounded-[24px] border border-white/[0.06] bg-white/[0.015] backdrop-blur-[20px] shadow-[0_4px_30px_rgba(0,0,0,0.5)] p-6 flex flex-col items-start text-left relative overflow-hidden group transition-all duration-300 cursor-pointer"
              >
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="flex items-center gap-2.5 mb-4 text-white/40 group-hover:text-white/70 transition-colors duration-300">
                  <Database className="w-4 h-4" />
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono">Requests Served</span>
                </div>
                <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white mb-2 font-display">
                  <AnimatedCounter value={50} suffix="M+" />
                </p>
                <div className="mt-auto w-full border-t border-white/[0.04] pt-4 flex items-center justify-between font-mono text-[9px] text-white/30">
                  <span className="group-hover:text-white/50 transition-colors">GET /v1/chat</span>
                  <span className="text-emerald-500 font-bold animate-pulse">200 OK</span>
                </div>
              </motion.div>

            </div>

          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-20 sm:py-28 px-4 sm:px-8 relative bg-black">
          {/* subtle grid background overlay for the section */}
          <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
          />

          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16 select-none">
              <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-white">
                Simple, credit-based <span className="text-white/60 font-medium font-serif italic">pricing</span>
              </h2>
              <p className="text-white/45 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
                Pay for what you use. No hidden fees, no surprises. Top up anytime.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.name}
                  className={cn(
                    'relative rounded-[28px] border transition-all duration-500 flex flex-col justify-between overflow-hidden',
                    tier.highlighted
                      ? 'bg-gradient-to-b from-white/[0.03] to-transparent border-white/[0.16] hover:border-white/[0.24] shadow-[0_0_50px_rgba(255,255,255,0.02)] scale-[1.02]'
                      : 'bg-gradient-to-b from-white/[0.015] to-transparent border-white/[0.06] hover:border-white/[0.14]'
                  )}
                >
                  {/* Radial subtle card flare/overlay */}
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.025),transparent_60%)] pointer-events-none" />

                  {tier.highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="border border-white/10 bg-white/[0.05] backdrop-blur-md text-[10px] tracking-widest font-mono uppercase px-3.5 py-1 rounded-full text-white/95 font-bold shadow-[0_4px_15px_rgba(0,0,0,0.5)]">
                        Most Popular
                      </span>
                    </div>
                  )}
                  
                  <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between">
                    <div>
                      {/* Name & Desc */}
                      <div className="mb-6">
                        <h3 className="text-xl font-bold tracking-tight text-white/90">
                          {tier.name}
                        </h3>
                        <p className="text-white/45 text-[13px] mt-1.5 leading-relaxed">
                          {tier.description}
                        </p>
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1.5 mb-6">
                        <span className="text-5xl font-extrabold tracking-[-0.03em] text-white font-sans">
                          {tier.price}
                        </span>
                        {tier.period && (
                          <span className="text-white/35 text-[13px] font-mono tracking-tight">
                            {tier.period}
                          </span>
                        )}
                      </div>

                      {/* Credits Counter chip */}
                      <div className="flex items-center gap-2.5 py-3.5 px-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors select-none mb-8">
                        <Wallet className="w-4 h-4 text-white/60" />
                        <span className="text-xs font-semibold tracking-tight text-white/80">
                          {tier.credits} credits <span className="text-white/35 font-normal">/ month</span>
                        </span>
                      </div>

                      {/* Features */}
                      <ul className="space-y-4 mb-8">
                        {tier.features.map((feature) => (
                          <li key={feature} className="flex items-start gap-3.5 text-[13px] text-white/65">
                            <div className="w-5 h-5 rounded-full bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                              <Check className="w-3 h-3 text-white/80" />
                            </div>
                            <span className="leading-relaxed">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => alert('Coming soon — payment integration in progress.')}
                      className={cn(
                        'w-full py-3.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 active:scale-[0.98]',
                        tier.highlighted
                          ? 'bg-white text-black hover:bg-white/90 shadow-[0_4px_20px_rgba(255,255,255,0.12)] hover:shadow-[0_4px_30px_rgba(255,255,255,0.22)]'
                          : 'bg-white/[0.02] border border-white/[0.08] text-white/80 hover:bg-white/[0.06] hover:border-white/[0.15] hover:text-white'
                      )}
                    >
                      <span>{tier.cta}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Compute Capacity */}
            <div className="mt-20 max-w-3xl mx-auto">
              <div className="relative rounded-[32px] border border-white/[0.06] bg-[#0d0d0d] p-8 sm:p-10 backdrop-blur-[20px] shadow-[0_0_50px_rgba(255,255,255,0.015)] overflow-hidden group">
                {/* 3D data pipeline flowing background */}
                <ApiComputeVisualization />

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/[0.06] pb-6 relative z-10 select-none">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                      <Zap className="w-5 h-5 text-white/80" />
                      <span>AI Compute Capacity</span>
                    </h3>
                    <p className="text-white/45 text-xs max-w-md">
                      Provision additional compute capacity instantly. Credits carry over billing cycles and never expire.
                    </p>
                  </div>
                  <div className="flex shrink-0">
                    <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border border-white/10 bg-white/[0.03] text-[9px] font-mono tracking-widest uppercase text-white/60">
                      <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                      Instant Provisioning
                    </span>
                  </div>
                </div>

                {/* Purchase Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
                  {[
                    { amount: '10,000', price: '$5', usage: '~ 2M Tokens', featured: false },
                    { amount: '50,000', price: '$20', usage: '~ 10M Tokens', featured: false },
                    { amount: '100,000', price: '$35', usage: '~ 20M Tokens', featured: true },
                    { amount: '500,000', price: '$150', usage: '~ 100M Tokens', featured: false },
                  ].map((topup) => (
                    <motion.div
                      key={topup.amount}
                      whileHover={{ y: -4, scale: topup.featured ? 1.04 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={cn(
                        "rounded-[24px] p-5 flex flex-col justify-between items-center text-center transition-all duration-300 relative overflow-hidden group/item cursor-pointer",
                        topup.featured
                          ? "bg-gradient-to-b from-white/[0.04] to-transparent border border-white/[0.18] shadow-[0_0_40px_rgba(255,255,255,0.03)] scale-[1.02] z-10"
                          : "bg-gradient-to-b from-white/[0.015] to-transparent border border-white/[0.06] hover:border-white/[0.14]"
                      )}
                      onClick={() => alert('Coming soon — compute provisioning interface in progress.')}
                    >
                      {/* Faint internal gradient overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.01),transparent_60%)] pointer-events-none" />

                      {/* Featured Badge */}
                      {topup.featured && (
                        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 select-none shrink-0 w-full px-1">
                          <span className="inline-flex items-center gap-1 border border-white/10 bg-white/[0.05] text-[7px] tracking-widest font-mono uppercase py-0.5 px-2 rounded-full text-white/90 font-bold shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                            ★ MOST POPULAR
                          </span>
                        </div>
                      )}

                      {/* Top content */}
                      <div className={cn("flex flex-col items-center", topup.featured ? "mt-5 mb-4" : "mb-4")}>
                        <div className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-3 group-hover/item:border-white/[0.12] transition-colors shadow-sm select-none">
                          <Wallet className="w-3.5 h-3.5 text-white/50 group-hover/item:text-white transition-colors" />
                        </div>
                        <span className="text-lg font-bold tracking-tight text-white font-sans leading-none">
                          {topup.amount}
                        </span>
                        <span className="text-[9px] text-white/30 uppercase tracking-widest font-mono mt-1 select-none">credits</span>
                      </div>

                      {/* Middle description: usage */}
                      <span className="text-[10px] text-white/35 font-mono select-none mb-4 block">
                        {topup.usage}
                      </span>

                      {/* Price Button */}
                      <span
                        className={cn(
                          "w-full py-2 rounded-xl text-xs font-bold font-mono tracking-wider transition-all duration-300 flex items-center justify-center select-none",
                          topup.featured
                            ? "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.15)] group-hover/item:bg-neutral-100"
                            : "bg-white/[0.03] border border-white/[0.06] text-white/70 group-hover/item:text-white group-hover/item:bg-white/[0.08] group-hover/item:border-white/[0.12]"
                        )}
                      >
                        {topup.price}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Developer Rewards */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="relative rounded-[32px] border border-white/[0.08] bg-[#0d0d0d] p-8 sm:p-10 backdrop-blur-[20px] shadow-[0_0_60px_rgba(255,255,255,0.015)] overflow-hidden group">
                {/* Subtle top edge light reflection beam */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[2px] bg-white/40 blur-[1px] pointer-events-none" />

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 relative z-10">
                  {/* Left Column: Heading and Details */}
                  <div className="space-y-4 max-w-xl text-left">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="border border-white/10 bg-white/[0.04] text-[9px] tracking-widest font-mono uppercase px-2.5 py-0.5 rounded-full text-white/70 select-none">
                        Free Credits
                      </span>
                      <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono select-none">
                        <Wallet className="w-3.5 h-3.5" />
                        <span>CURRENT WALLET: </span>
                        <span className="text-white/85 font-extrabold font-mono">{credits.toLocaleString()} CREDITS</span>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-bold tracking-tight text-white flex items-center gap-2 select-none">
                        <Play className="w-4 h-4 text-white/80" />
                        Developer Rewards
                      </h3>
                      <p className="text-white/45 text-xs mt-1.5 leading-relaxed select-none">
                        No credit card or payments required. Support our platform by watching a 30-second sponsored ad. Earn compute resources instantly to expand your daily usage.
                      </p>
                    </div>

                    <p className="text-[10px] text-white/25 leading-relaxed select-none">
                      Credits are added to your balance immediately after the ad completes. No daily viewing limit.
                    </p>
                  </div>

                  {/* Right Column: Watch Button and Orbital Visualization */}
                  <div className="relative flex items-center justify-center min-w-[240px] h-[160px] shrink-0 self-center lg:self-auto w-full lg:w-auto">
                    {/* Concentric rotating AI compute cluster canvas background */}
                    <OrbitalClusterVisualization />
                    
                    <button
                      onClick={() => setAdOpen(true)}
                      className="relative px-7 py-4.5 rounded-full bg-white text-black font-extrabold text-[12px] uppercase tracking-widest hover:bg-neutral-100 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2.5 shadow-[0_0_35px_rgba(255,255,255,0.18)] hover:shadow-[0_0_45px_rgba(255,255,255,0.3)] cursor-pointer z-10"
                    >
                      <Play className="w-4 h-4 fill-black text-black" />
                      <span>Watch video ad</span>
                    </button>
                  </div>
                </div>

                {/* Benefits mini cards list (Section 02 bottom grid) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-8 pt-6 border-t border-white/[0.06] relative z-10 select-none">
                  {[
                    { label: '+1,000 Credits Reward' },
                    { label: 'Instant Delivery' },
                    { label: 'Unlimited Daily Claims' },
                    { label: 'No Payment Required' },
                  ].map((benefit) => (
                    <div key={benefit.label} className="border border-white/[0.06] bg-white/[0.01] rounded-xl px-4 py-3 text-[11px] font-mono tracking-wide text-white/50 text-center flex items-center justify-center">
                      {benefit.label}
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* API Key Management */}
        <section id="keys" className="py-24 sm:py-32 px-4 sm:px-8 bg-black overflow-hidden border-t border-white/10 flex flex-col items-center relative min-h-[600px]">
          {/* 3D network wave animation background */}
          <ApiKeysVisualization />
          
          {/* Volumetric spotlight overlay behind the title */}
          <div className="absolute top-1/3 left-1/4 -translate-y-1/2 w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.018),transparent_70%)] pointer-events-none z-0 animate-pulse" style={{ animationDuration: '6s' }} />
          
          <div className="w-full max-w-5xl mx-auto relative z-10">
            
            {/* Header and CTA Button */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 mb-12 select-none relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="space-y-4 max-w-2xl text-left"
              >
                {/* Secure Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/10 bg-white/[0.02] text-[10px] sm:text-[11px] tracking-[0.12em] font-semibold text-white/70 uppercase shadow-[0_2px_12px_rgba(0,0,0,0.4)]">
                  <Lock className="w-3.5 h-3.5 text-white/50" />
                  <span>Secure • Encrypted</span>
                </div>

                {/* Main Heading */}
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-none">
                  API <span className="text-white/60 font-medium font-serif italic">Keys</span>
                </h2>

                {/* Subtitle */}
                <p className="text-white/45 text-sm sm:text-base leading-relaxed">
                  Generate and manage secure access tokens for your applications. Keys are encrypted and protected by enterprise-grade security.
                </p>
              </motion.div>

              {/* Generate Key Button */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="flex shrink-0"
              >
                <button
                  onClick={() => setShowCreateDialog(true)}
                  className="relative px-7 py-4 rounded-full bg-white text-black font-extrabold text-[12px] uppercase tracking-widest transition-all duration-300 hover:bg-neutral-100 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98] cursor-pointer flex items-center gap-2.5 shadow-[0_0_35px_rgba(255,255,255,0.18)] hover:shadow-[0_0_45px_rgba(255,255,255,0.3)] z-10"
                >
                  <Key className="w-4 h-4 fill-black text-black" />
                  <span>Generate New Key</span>
                </button>
              </motion.div>
            </div>

            {/* Key Management Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] backdrop-blur-[20px] shadow-[0_0_60px_rgba(255,255,255,0.015)] relative overflow-hidden p-6 sm:p-8"
            >
              {/* Subtle Top-Center Light Beam highlight */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-white/50 blur-[1px] pointer-events-none" />
              <div className="absolute top-[-8px] left-1/2 -translate-x-1/2 w-36 h-8 bg-white/[0.03] blur-md rounded-full pointer-events-none" />

              {/* Filter and Search Toolbar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <input
                    type="text"
                    placeholder="Search keys by name..."
                    value={keySearch}
                    onChange={(e) => setKeySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/10 text-white text-xs font-sans focus:outline-none focus:border-white/20 transition-all placeholder:text-white/25"
                  />
                </div>

                <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/10 self-start md:self-auto">
                  <button
                    onClick={() => setEnvFilter('all')}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                      envFilter === 'all' ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white/80"
                    )}
                  >
                    All Keys
                  </button>
                  <button
                    onClick={() => setEnvFilter('live')}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                      envFilter === 'live' ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white/80"
                    )}
                  >
                    Live
                  </button>
                  <button
                    onClick={() => setEnvFilter('test')}
                    className={cn(
                      "px-3.5 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer",
                      envFilter === 'test' ? "bg-white text-black shadow-sm" : "text-white/40 hover:text-white/80"
                    )}
                  >
                    Test
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-white/[0.06] bg-white/[0.01]">
                      <th className="py-4.5 px-6 text-[10px] font-mono tracking-wider font-bold text-white/40 uppercase">Name & Environment</th>
                      <th className="py-4.5 px-6 text-[10px] font-mono tracking-wider font-bold text-white/40 uppercase">Access Token</th>
                      <th className="py-4.5 px-6 text-[10px] font-mono tracking-wider font-bold text-white/40 uppercase hidden lg:table-cell">Request Activity (7d)</th>
                      <th className="py-4.5 px-6 text-[10px] font-mono tracking-wider font-bold text-white/40 uppercase hidden sm:table-cell">Last Used</th>
                      <th className="py-4.5 px-6 text-[10px] font-mono tracking-wider font-bold text-white/40 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiKeys
                      .filter((k) => {
                        const mSearch = k.name.toLowerCase().includes(keySearch.toLowerCase());
                        const mEnv = envFilter === 'all' || k.type === envFilter;
                        return mSearch && mEnv;
                      })
                      .map((apiKey) => {
                        const isVisible = visibleKeys.has(apiKey.id);
                        const displayKey = isVisible ? apiKey.key : maskKey(apiKey.key);
                        return (
                          <tr key={apiKey.id} className="border-b border-white/[0.04] hover:bg-white/[0.015] transition-colors group">
                            {/* Name / Environment / Scopes */}
                            <td className="py-6 px-6 align-middle">
                              <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shrink-0 relative overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.5)] mt-0.5">
                                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />
                                  <Key className="w-4 h-4 text-white/50 animate-pulse" />
                                </div>
                                <div className="flex flex-col items-start gap-1.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-semibold text-white/90">{apiKey.name}</span>
                                    <span className={cn(
                                      "inline-flex items-center py-0.5 px-2 rounded-full border text-[8px] font-mono tracking-widest uppercase select-none font-bold",
                                      apiKey.type === 'live'
                                        ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-400"
                                        : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                                    )}>
                                      {apiKey.type}
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1">
                                    {apiKey.scopes.map((scope) => (
                                      <span key={scope} className="px-1.5 py-0.5 rounded bg-white/[0.03] border border-white/[0.05] text-[9px] font-mono text-white/45">
                                        {scope}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>

                            {/* Key */}
                            <td className="py-6 px-6 align-middle">
                              <div className="relative inline-flex items-center">
                                <code className="text-xs font-mono text-white/60 bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-colors pl-4 pr-12 py-2.5 rounded-xl select-all">
                                  {displayKey}
                                </code>
                                <button
                                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                  className="absolute right-2 p-1.5 rounded-lg text-white/30 hover:text-white/85 hover:bg-white/[0.04] transition-all cursor-pointer"
                                  title="Copy key"
                                >
                                  {copiedKey === apiKey.id ? (
                                    <Check className="w-3.5 h-3.5 text-white" />
                                  ) : (
                                    <Copy className="w-3.5 h-3.5" />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Usage Sparkline */}
                            <td className="py-6 px-6 align-middle hidden lg:table-cell">
                              <div className="flex flex-col gap-1.5">
                                <div className="flex items-end gap-1.5 h-7">
                                  {getKeyActivity(apiKey.id).map((val, idx) => (
                                    <div
                                      key={idx}
                                      style={{ height: `${(val / 55) * 100}%` }}
                                      className="w-1.5 rounded-full bg-white/[0.06] group-hover:bg-white/[0.18] hover:!bg-white transition-all duration-300"
                                      title={`${val} requests`}
                                    />
                                  ))}
                                </div>
                                <span className="text-[9px] font-mono text-white/20 tracking-wider">Usage Sparkline</span>
                              </div>
                            </td>

                            {/* Last Used */}
                            <td className="py-6 px-6 align-middle hidden sm:table-cell">
                              <div className="flex flex-col text-xs font-mono">
                                <span className="text-white/80">{apiKey.lastUsed}</span>
                                <span className="text-[10px] text-white/30 mt-0.5">{apiKey.id === 'key-1' ? '11:08 AM' : 'Active'}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-6 px-6 align-middle">
                              <div className="flex items-center justify-end gap-2.5">
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => toggleKeyVisibility(apiKey.id)}
                                  className="w-9 h-9 rounded-full border border-white/[0.06] bg-white/[0.01] flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/[0.04] hover:border-white/[0.14] hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all cursor-pointer"
                                  title={isVisible ? 'Hide key' : 'Show key'}
                                >
                                  {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => copyToClipboard(apiKey.key, apiKey.id)}
                                  className="w-9 h-9 rounded-full border border-white/[0.06] bg-white/[0.01] flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/[0.04] hover:border-white/[0.14] hover:shadow-[0_0_15px_rgba(255,255,255,0.08)] transition-all cursor-pointer"
                                  title="Copy key"
                                >
                                  {copiedKey === apiKey.id ? (
                                    <Check className="w-4 h-4 text-white" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.08 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => deleteKey(apiKey.id)}
                                  className="w-9 h-9 rounded-full border border-white/[0.06] bg-white/[0.01] flex items-center justify-center text-white/40 hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/[0.05] hover:shadow-[0_0_15px_rgba(239,68,68,0.08)] transition-all cursor-pointer"
                                  title="Delete key"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </motion.button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>

              {apiKeys.filter((k) => {
                const mSearch = k.name.toLowerCase().includes(keySearch.toLowerCase());
                const mEnv = envFilter === 'all' || k.type === envFilter;
                return mSearch && mEnv;
              }).length === 0 && (
                <div className="py-20 text-center select-none">
                  <div className="w-14 h-14 rounded-2xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center mx-auto mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
                    <Key className="w-6 h-6 text-white/30" />
                  </div>
                  <p className="text-white/50 text-sm font-semibold">No credentials found</p>
                  <p className="text-white/25 text-xs mt-1 max-w-xs mx-auto">
                    {keySearch
                      ? "Try adjusting your search query or switching environments."
                      : "Create your first API access token to authorize request streams."}
                  </p>
                  {keySearch && (
                    <button
                      onClick={() => { setKeySearch(''); setEnvFilter('all'); }}
                      className="mt-4 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] hover:bg-white/[0.04] text-xs font-semibold text-white/70 transition-all cursor-pointer"
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}


              {/* Bottom Security / Help Panel */}
              <div className="border-t border-white/[0.06] pt-6 mt-6 flex flex-col md:flex-row items-stretch justify-between gap-6 md:gap-0 select-none">
                {/* Left: Encryption Info */}
                <div className="flex-1 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <Shield className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="text-xs font-semibold text-white/90">Your API keys are encrypted and never stored in plain text.</h4>
                    <p className="text-[11px] text-white/35 mt-1">Do not share your keys or expose them in client-side code.</p>
                  </div>
                </div>

                {/* Vertical Separator */}
                <div className="hidden md:block w-px bg-white/[0.08] mx-8 self-stretch" />

                {/* Right: Help/Guide Link */}
                <div className="flex-1 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.02] border border-white/[0.08] flex items-center justify-center shrink-0 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                    <Database className="w-4 h-4 text-white/60" />
                  </div>
                  <div className="flex flex-col text-left">
                    <h4 className="text-xs font-semibold text-white/90">Need help?</h4>
                    <button
                      onClick={onNavigateDocs}
                      className="text-[11px] text-white/35 hover:text-white transition-colors mt-1 flex items-center gap-1 cursor-pointer font-medium hover:underline text-left"
                    >
                      <span>Read our API security best practices</span>
                      <ArrowRight className="w-3 h-3 animate-pulse" />
                    </button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </section>

        {/* Quick Start */}
        <section className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10 bg-black">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4 text-white select-none">
                  Quick <span className="text-white/60 font-medium font-serif italic">start</span>
                </h2>
                <p className="text-white/45 text-sm sm:text-base mb-10 leading-relaxed select-none">
                  Integrate Bloomport into your application in minutes. One endpoint, endless possibilities.
                </p>
                <div className="space-y-4">
                  {[
                    { icon: Key, title: 'Get your API key', desc: 'Generate a key from the dashboard above.' },
                    { icon: Terminal, title: 'Make your first request', desc: 'Use our REST endpoint with any HTTP client.' },
                    { icon: Shield, title: 'Build with confidence', desc: 'Production-ready with automatic retries.' },
                  ].map((step, i) => (
                    <div key={step.title} className="flex items-start gap-4 p-5 rounded-2xl bg-white/[0.015] border border-white/[0.06] hover:border-white/[0.12] transition-colors duration-300">
                      <div className="w-8 h-8 rounded-xl bg-white/[0.03] border border-white/[0.08] flex items-center justify-center shrink-0">
                        <step.icon className="w-4 h-4 text-white/50" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1.5 select-none">
                          <span className="text-[10px] font-bold font-mono tracking-widest text-white/20">0{i + 1}</span>
                          <h3 className="text-sm font-semibold text-white/90">{step.title}</h3>
                        </div>
                        <p className="text-xs sm:text-sm text-white/45 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative">
                {/* Glowing backdrop */}
                <div className="absolute -inset-4 bg-white/[0.02] rounded-[32px] blur-2xl pointer-events-none" />
                <div className="relative bg-[#0d0d0d] border border-white/[0.06] rounded-[28px] overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.015)]">
                  <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-white/[0.01]">
                    <div className="flex items-center gap-4">
                      {/* Window Dot controls */}
                      <div className="flex items-center gap-1.5 select-none">
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                        <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
                      </div>
                      <div className="h-4 w-px bg-white/[0.06] select-none" />
                      <div className="flex items-center gap-2 select-none">
                        <Terminal className="w-3.5 h-3.5 text-white/30" />
                        <span className="text-[11px] font-mono font-medium tracking-wide text-white/40">cURL</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => copyToClipboard(codeExample, 'code-example')}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors cursor-pointer"
                    >
                      {copiedKey === 'code-example' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span className="text-white">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-6 text-xs sm:text-sm font-mono text-white/60 overflow-x-auto leading-relaxed bg-[#0d0d0d]">
                    <code>{codeExample}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Ad Placements */}
        <section className="py-8 px-4 sm:px-8 border-t border-white/10">
          <div className="max-w-5xl mx-auto">
            <AdBanner layout="horizontal" />
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 sm:py-28 px-4 sm:px-8 border-t border-white/10 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02),transparent_70%)]"
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
                  <Logo className="h-6 sm:h-8 w-auto" variant="dark" />
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

      {/* Rewarded Ad Modal */}
      <RewardedAdModal isOpen={adOpen} onClose={() => setAdOpen(false)} />

      {/* Create Key Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="bg-[#111111] border border-white/10 text-white max-w-md rounded-2xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-white/80" />
              <span>Create Access Token</span>
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm">
              Configure credentials for authenticating your application.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-5">
            {/* Name Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider">Key Name</label>
              <input
                type="text"
                placeholder="e.g. Development Bot"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10 text-white text-sm font-sans focus:outline-none focus:border-white/30 focus:bg-white/[0.06] transition-all"
              />
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider block">Environment</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setNewKeyType('live')}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer",
                    newKeyType === 'live'
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  Live Environment
                </button>
                <button
                  type="button"
                  onClick={() => setNewKeyType('test')}
                  className={cn(
                    "py-2.5 rounded-xl border text-xs font-semibold tracking-wider uppercase transition-all cursor-pointer",
                    newKeyType === 'test'
                      ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      : "bg-white/[0.02] border-white/10 text-white/50 hover:bg-white/[0.04] hover:border-white/20"
                  )}
                >
                  Test Environment
                </button>
              </div>
            </div>

            {/* Scopes checkboxes */}
            <div className="space-y-2.5">
              <label className="text-xs font-mono font-bold text-white/50 uppercase tracking-wider block">API Access Scopes</label>
              <div className="space-y-2">
                {[
                  { id: 'chat:write', label: 'Mindful Chat (write)', desc: 'Interact with calm assistant and run chat sessions.' },
                  { id: 'journal:write', label: 'AI Journaling (write)', desc: 'Analyze personal journals and generate focus reflections.' },
                  { id: 'focus:read', label: 'Focus Tracker (read)', desc: 'Fetch user statistics, historical logs, and progress metrics.' },
                  { id: 'credits:read', label: 'Credits Status (read)', desc: 'Query active API credit balances and transaction logs.' }
                ].map((scope) => {
                  const isChecked = newKeyScopes.includes(scope.id);
                  return (
                    <label
                      key={scope.id}
                      onClick={() => {
                        setNewKeyScopes((prev) =>
                          prev.includes(scope.id)
                            ? prev.filter((s) => s !== scope.id)
                            : [...prev, scope.id]
                        );
                      }}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all",
                        isChecked
                          ? "bg-white/[0.03] border-white/20"
                          : "bg-transparent border-white/[0.05] hover:bg-white/[0.01]"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        readOnly
                        className="custom-checkbox mt-0.5 shrink-0"
                      />
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-white/90">{scope.label}</span>
                        <span className="text-[10px] text-white/40 mt-0.5">{scope.desc}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Create Button */}
            <button
              onClick={handleCreateKey}
              className="w-full mt-2 py-3.5 rounded-full bg-white text-black text-sm font-extrabold uppercase tracking-widest hover:bg-neutral-100 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_25px_rgba(255,255,255,0.15)]"
            >
              <Check className="w-4 h-4" />
              <span>Create Access Token</span>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Key Dialog */}
      <Dialog open={showNewKeyDialog} onOpenChange={setShowNewKeyDialog}>
        <DialogContent className="bg-[#111111] border-white/10 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold tracking-tight flex items-center gap-2">
              <Key className="w-5 h-5 text-white animate-pulse" />
              API Key Generated
            </DialogTitle>
            <DialogDescription className="text-white/50 text-sm">
              Copy this key now. For security reasons, you cannot retrieve it again later.
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


