'use client';

import { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, ArrowLeft, ArrowRight } from 'lucide-react';
import SEO from '../../components/SEO';
import AdBanner from '../../components/AdBanner';
import { Logo } from '../../components/Logo';

interface FocusTimerProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
}

type TimerMode = 'work' | 'break' | 'longbreak';

const DURATIONS: Record<TimerMode, number> = {
  work: 25 * 60,
  break: 5 * 60,
  longbreak: 15 * 60,
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'FOCUS',
  break: 'SHORT BREAK',
  longbreak: 'LONG BREAK',
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a Pomodoro timer?',
      acceptedAnswer: { '@type': 'Answer', text: 'A Pomodoro timer is a time management technique where you work for 25 minutes then take a 5-minute break. After 4 cycles, you take a longer 15-minute break. It improves focus and prevents mental fatigue.' },
    },
    {
      '@type': 'Question',
      name: 'Is this focus timer free?',
      acceptedAnswer: { '@type': 'Answer', text: "Yes, Bloomport's focus timer is completely free with no signup required." },
    },
    {
      '@type': 'Question',
      name: 'Can I use this for studying?',
      acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. The Pomodoro technique is proven effective for studying. Short focused sessions with breaks prevent burnout and improve long-term retention.' },
    },
    {
      '@type': 'Question',
      name: 'Does the timer work on mobile?',
      acceptedAnswer: { '@type': 'Answer', text: "Yes, Bloomport's focus timer is fully responsive and works on all devices including mobile phones and tablets." },
    },
    {
      '@type': 'Question',
      name: 'What is the best focus timer for deep work?',
      acceptedAnswer: { '@type': 'Answer', text: "The Pomodoro technique (25 minutes work, 5 minutes rest) is the most researched method for deep work. Bloomport's free timer also pairs with AI mindfulness breaks between sessions." },
    },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://bloomport.fun"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Tools",
      "item": "https://bloomport.fun/tools/focus-timer"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Focus Timer",
      "item": "https://bloomport.fun/tools/focus-timer"
    }
  ]
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "How to Practice Pomodoro with Bloomport Focus Timer",
  "description": "A step-by-step guide to practicing mindful Pomodoro focus sessions to reduce overthinking and increase deep work quality.",
  "totalTime": "PT30M",
  "step": [
    {
      "@type": "HowToStep",
      "name": "Start Focus Block",
      "text": "Work for 25 minutes on a single, intentional task without checking phone notifications or social media.",
      "url": "https://bloomport.fun/tools/focus-timer"
    },
    {
      "@type": "HowToStep",
      "name": "Take Mindful Short Break",
      "text": "When the timer rings, take a 5-minute break. Use Bloomport's box breathing timer or walk away from your screen.",
      "url": "https://bloomport.fun/tools/focus-timer"
    },
    {
      "@type": "HowToStep",
      "name": "Repeat 4 Cycles",
      "text": "Complete four cycles of 25-minute focus blocks and 5-minute short breaks.",
      "url": "https://bloomport.fun/tools/focus-timer"
    },
    {
      "@type": "HowToStep",
      "name": "Take Long Break",
      "text": "After the fourth cycle, reward your mind with a 15-minute long break to reset before the next focus group.",
      "url": "https://bloomport.fun/tools/focus-timer"
    }
  ]
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function FocusTimer({ onNavigateHome, onNavigateApp }: FocusTimerProps) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [timeLeft, setTimeLeft] = useState<number>(DURATIONS.work);
  const [isRunning, setIsRunning] = useState(false);
  const [cycles, setCycles] = useState(0);

  const switchMode = useCallback((nextMode: TimerMode) => {
    setMode(nextMode);
    setTimeLeft(DURATIONS[nextMode]);
    setIsRunning(false);
  }, []);

  const advanceMode = useCallback(() => {
    if (mode === 'work') {
      const newCycles = cycles + 1;
      setCycles(newCycles);
      if (newCycles % 4 === 0) {
        switchMode('longbreak');
      } else {
        switchMode('break');
      }
    } else {
      switchMode('work');
    }
  }, [mode, cycles, switchMode]);

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          advanceMode();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isRunning, advanceMode]);

  const handleStartPause = () => setIsRunning((prev) => !prev);
  const handleReset = () => { setIsRunning(false); setTimeLeft(DURATIONS[mode]); };
  const handleSkip = () => { setIsRunning(false); advanceMode(); };

  const progress = 1 - timeLeft / DURATIONS[mode];
  const circumference = 2 * Math.PI * 46;

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="Free Focus Timer Online — Pomodoro Timer for Deep Work"
        description="Use Bloomport's free Pomodoro focus timer online. Set 25-minute work sessions with 5-minute mindful breaks. No signup, no ads blocking your flow."
        path="/tools/focus-timer"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

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
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Free Pomodoro Focus Timer</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Use the Pomodoro focus timer to work in deep 25-minute sessions with mindful breaks. No signup. No distractions.
          </p>
        </div>

        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 flex flex-col items-center gap-6">
          <span className={`text-[11px] font-bold tracking-[0.2em] px-4 py-1.5 rounded-full border uppercase transition-all duration-500 ${mode === 'work' ? 'border-white/20 bg-white/10 text-white' : 'border-white/10 bg-white/5 text-white/60'}`}>
            {MODE_LABELS[mode]}
          </span>

          <div className="relative flex items-center justify-center w-56 h-56 sm:w-72 sm:h-72">
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
              <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
              <circle
                cx="50" cy="50" r="46" fill="none"
                stroke="rgba(255,255,255,0.55)" strokeWidth="3" strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${circumference * (1 - progress)}`}
                style={{ transition: 'stroke-dashoffset 0.8s ease' }}
              />
            </svg>
            <span className={`font-mono font-bold leading-none z-10 select-none text-[60px] sm:text-[80px] ${mode === 'work' ? 'text-white' : 'text-white/70'}`}>
              {formatTime(timeLeft)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {Array.from({ length: 4 }).map((_, i) => {
              const cycleRemainder = cycles % 4;
              const filled = cycleRemainder === 0 && cycles > 0 ? true : i < cycleRemainder;
              return (
                <div key={i} className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${filled ? 'bg-white' : 'bg-white/15 border border-white/20'}`} />
              );
            })}
            <span className="text-white/40 text-xs ml-2 font-mono">{cycles} {cycles === 1 ? 'cycle' : 'cycles'} done</span>
          </div>

          <div className="flex items-center gap-4 mt-2">
            <button onClick={handleReset} className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer" aria-label="Reset timer">
              <RotateCcw className="w-4 h-4" />
            </button>
            <button onClick={handleStartPause} className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.2)]" aria-label={isRunning ? 'Pause timer' : 'Start timer'}>
              {isRunning ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
            </button>
            <button onClick={handleSkip} className="w-11 h-11 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-white/30 transition-all cursor-pointer" aria-label="Skip to next session">
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center">
            {(['work', 'break', 'longbreak'] as TimerMode[]).map((m) => (
              <button key={m} onClick={() => switchMode(m)} className={`text-[11px] font-semibold px-3 py-1 rounded-full transition-all cursor-pointer ${mode === m ? 'bg-white/15 text-white border border-white/20' : 'text-white/35 hover:text-white/70 border border-transparent'}`}>
                {MODE_LABELS[m]}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full mt-8"><AdBanner layout="horizontal" /></div>

        <section className="w-full mt-12">
          <h2 className="text-xl font-bold mb-4 tracking-tight">How the Pomodoro Technique Works</h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            The <strong className="text-white/80">Pomodoro focus timer</strong> is a time management method developed by Francesco Cirillo. Work in focused 25-minute bursts, then take a short 5-minute mindful break. Every 4 cycles, reward yourself with a 15-minute long break. This rhythm prevents mental fatigue and keeps your concentration sharp throughout the day.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: '25 min', desc: 'Deep focus work session', icon: '🎯' },
              { label: '5 min', desc: 'Short mindful break', icon: '🌿' },
              { label: '15 min', desc: 'Long break every 4 cycles', icon: '☕' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-lg font-bold mb-1">{item.label}</div>
                <div className="text-white/45 text-xs">{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="w-full mt-10"><AdBanner layout="in-feed" /></div>

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

        <section className="w-full mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <h2 className="text-xl font-bold mb-2 tracking-tight">Pair Your Focus Sessions with AI Mindfulness</h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Bloomport's AI companion guides you through mindful breaks, breathing exercises, and reflective journaling between focus sessions.
          </p>
          <button onClick={onNavigateApp} className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.15)]">
            Try Bloomport Free <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        <p className="text-white/20 text-xs mt-10 text-center">© {new Date().getFullYear()} Bloomport · Free focus timer · No signup required</p>
      </main>
    </div>
  );
}
