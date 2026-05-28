'use client';

import { useState } from 'react';
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';
import SEO from '../../components/SEO';
import AdBanner from '../../components/AdBanner';
import { Logo } from '../../components/Logo';

interface StressQuizProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
}

interface Question {
  text: string;
  options: string[];
}

const questions: Question[] = [
  { text: 'How often do you feel overwhelmed by your responsibilities?', options: ['Never', 'Occasionally', 'Often', 'Almost Always'] },
  { text: 'How well are you sleeping at night?', options: ['Very well', 'Fairly well', 'Poorly', 'Very poorly'] },
  { text: 'Do you find it hard to concentrate or focus?', options: ['Rarely', 'Sometimes', 'Often', 'Always'] },
  { text: 'How often do you feel irritable or on edge?', options: ['Rarely', 'Occasionally', 'Frequently', 'Constantly'] },
  { text: 'Do you feel like you have enough time for the things that matter?', options: ['Always', 'Usually', 'Rarely', 'Never'] },
  { text: 'How often do you experience physical tension (headaches, tight shoulders, etc.)?', options: ['Never', 'Occasionally', 'Weekly', 'Daily'] },
  { text: 'Do you feel in control of your life and decisions?', options: ['Completely', 'Mostly', 'Somewhat', 'Not at all'] },
  { text: 'How often do you take time for activities that help you relax?', options: ['Daily', 'A few times a week', 'Rarely', 'Never'] },
  { text: 'Do you feel a sense of calm and mental clarity during your day?', options: ['Regularly', 'Sometimes', 'Rarely', 'Almost never'] },
  { text: 'How connected do you feel to people who support you?', options: ['Very connected', 'Fairly connected', 'Somewhat disconnected', 'Very disconnected'] },
];

interface ResultLevel {
  label: string;
  description: string;
  recommendations: Array<{ text: string; action: () => void }>;
  color: string;
  bgBorder: string;
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Is this stress quiz a clinical diagnostic tool?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, this stress quiz is an informational self-assessment designed to help you check in with your feelings. It is not a clinical diagnosis or a replacement for professional mental health care.',
      },
    },
    {
      '@type': 'Question',
      name: 'How is the stress score calculated?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'The quiz evaluates your answers to 10 lifestyle questions on a scale of 0 to 3 points. A total score out of 30 determines whether your stress level is categorized as low, moderate, or high.',
      },
    },
    {
      '@type': 'Question',
      name: 'Does Bloomport save my quiz results?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, your answers and scores are processed locally in your browser. They are not stored on any servers or linked to your account. Your privacy is fully preserved.',
      },
    },
    {
      '@type': 'Question',
      name: 'How can I reduce stress levels?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: "Building consistent daily habits like Pomodoro deep work focus, guided AI journaling, box breathing, and regular mindfulness breaks are proven to help lower baseline stress and anxiety.",
      },
    },
    {
      '@type': 'Question',
      name: 'Is this stress quiz free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Bloomport\'s stress quiz is 100% free with no signup or credit card required.',
      },
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
      "item": "https://bloomport.fun/tools/stress-quiz"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Stress Quiz",
      "item": "https://bloomport.fun/tools/stress-quiz"
    }
  ]
};

export default function StressQuiz({ onNavigateHome, onNavigateApp }: StressQuizProps) {
  const [status, setStatus] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);

  const handleOptionSelect = (score: number) => {
    const updatedAnswers = [...answers, score];
    setAnswers(updatedAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      setStatus('result');
    }
  };

  const resetQuiz = () => {
    setStatus('intro');
    setCurrentIdx(0);
    setAnswers([]);
  };

  const getScore = () => answers.reduce((sum, val) => sum + val, 0);

  const getResultLevel = (): ResultLevel => {
    const score = getScore();
    if (score <= 10) {
      return {
        label: 'Low Stress',
        color: 'text-emerald-400',
        bgBorder: 'border-emerald-500/20 bg-emerald-500/[0.02]',
        description: 'Your stress levels are currently low. You seem to maintain a healthy balance between daily demands and your coping mechanisms. Continue focusing on gentle, consistent habits to preserve this baseline.',
        recommendations: [
          { text: 'Try Focus Timer to keep your deep work sessions structured', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'focustimer' })) },
          { text: 'Use Journal Prompts to log your daily gratitude and reflections', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'journalprompts' })) },
          { text: 'Talk to Bloomport Mindful AI for a regular evening check-in', action: onNavigateApp }
        ]
      };
    } else if (score <= 20) {
      return {
        label: 'Moderate Stress',
        color: 'text-amber-400',
        bgBorder: 'border-amber-500/20 bg-amber-500/[0.02]',
        description: 'You are experiencing moderate stress. While you are managing, some aspects of your week may feel slightly overwhelming. Setting clear boundaries and introducing small pauses will help restore balance.',
        recommendations: [
          { text: 'Try a 25-minute session on our Focus Timer with mindful breaks', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'focustimer' })) },
          { text: 'Answer a Journal Prompt to declutter and organize your thoughts', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'journalprompts' })) },
          { text: 'Chat with Bloomport AI to help identify stressors and overthinking patterns', action: onNavigateApp }
        ]
      };
    } else {
      return {
        label: 'High Stress',
        color: 'text-rose-400',
        bgBorder: 'border-rose-500/20 bg-rose-500/[0.02]',
        description: 'Your stress levels are high. You might be feeling overwhelmed, mentally fatigued, or trapped in cycle loops of overthinking. We strongly encourage dedicating specific time for quiet reflection, slowing down, and releasing cognitive load.',
        recommendations: [
          { text: 'Start a guided reflection session with Bloomport AI now', action: onNavigateApp },
          { text: 'Dump your stress in writing using our free Journal Prompts', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'journalprompts' })) },
          { text: 'Practice structured box breathing with the Focus Timer break mode', action: () => window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'focustimer' })) }
        ]
      };
    }
  };

  const currentResult = getResultLevel();
  const progressPercent = Math.round((currentIdx / questions.length) * 100);

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="Free Stress Quiz & Anxiety Self-Assessment Online"
        description="Take our 5-minute free stress quiz online to assess your stress levels. Get instant results and personalized mindfulness recommendations from Bloomport's AI."
        path="/tools/stress-quiz"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Free Stress & Anxiety Assessment</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Take this quick 10-question self-assessment to identify your current stress level and receive personalized mindfulness recommendations.
          </p>
        </div>

        {status === 'intro' && (
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 text-center flex flex-col items-center gap-6">
            <div className="w-16 h-16 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center text-2xl">
              📝
            </div>
            <div>
              <h2 className="text-xl font-bold text-white mb-2">Check In With Yourself</h2>
              <p className="text-white/50 text-sm max-w-sm mx-auto leading-relaxed">
                Answer honestly based on your experience over the past week. No answers are stored, ensuring absolute privacy.
              </p>
            </div>
            <button
              onClick={() => setStatus('quiz')}
              className="bg-white text-black text-xs font-bold uppercase px-8 py-4 rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.15)] flex items-center gap-2"
            >
              Start 5-Minute Quiz <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {status === 'quiz' && (
          <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-12 flex flex-col gap-8">
            <div className="flex items-center justify-between text-xs text-white/40 font-mono">
              <span>QUESTION {currentIdx + 1} OF {questions.length}</span>
              <span>{progressPercent}% COMPLETE</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
              <div className="h-full bg-white/60 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
            </div>

            <div className="min-h-[80px] flex items-center justify-center text-center">
              <h2 className="text-xl sm:text-2xl font-semibold leading-snug">{questions[currentIdx].text}</h2>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {questions[currentIdx].options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(idx)}
                  className="w-full text-left px-6 py-4.5 rounded-2xl border border-white/8 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer font-medium text-sm sm:text-base flex items-center justify-between group active:scale-[0.99]"
                >
                  <span>{option}</span>
                  <span className="w-6 h-6 rounded-full border border-white/10 group-hover:border-white/30 flex items-center justify-center text-[10px] text-white/30 group-hover:text-white/60 font-bold transition-all">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {status === 'result' && (
          <div className="w-full flex flex-col gap-6">
            <div className={`rounded-3xl border ${currentResult.bgBorder} p-8 sm:p-12 text-center flex flex-col items-center gap-6`}>
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase">Your Results</span>
              
              <div className="flex flex-col items-center">
                <span className={`text-4xl sm:text-5xl font-black ${currentResult.color}`}>
                  {getScore()}
                </span>
                <span className="text-xs text-white/30 mt-1 uppercase font-mono tracking-widest">Score out of 30</span>
              </div>

              <div>
                <h2 className={`text-2xl font-bold mb-3 ${currentResult.color}`}>{currentResult.label}</h2>
                <p className="text-white/60 text-sm leading-relaxed max-w-md mx-auto">
                  {currentResult.description}
                </p>
              </div>

              <button
                onClick={resetQuiz}
                className="inline-flex items-center gap-2 text-xs font-semibold px-5 py-2.5 rounded-full border border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-white/25 transition-all cursor-pointer mt-2"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Retake Assessment
              </button>
            </div>

            {/* Recommendations */}
            <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-8 sm:p-10">
              <h3 className="text-lg font-bold text-white mb-5 tracking-tight flex items-center gap-2">
                <span>🌱</span> Personalized Recommendations
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {currentResult.recommendations.map((rec, i) => (
                  <button
                    key={i}
                    onClick={rec.action}
                    className="w-full text-left px-5 py-4 rounded-xl border border-white/[0.05] bg-white/[0.01] hover:border-white/15 hover:bg-white/[0.03] transition-all cursor-pointer text-xs sm:text-sm text-white/70 hover:text-white flex items-center justify-between group"
                  >
                    <span>{rec.text}</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform text-white/40 group-hover:text-white/80" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="w-full mt-8"><AdBanner layout="horizontal" /></div>

        <section className="w-full mt-12">
          <h2 className="text-xl font-bold mb-4 tracking-tight">Understanding Stress Levels</h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Daily stress is a natural biological reaction, but when prolonged, it becomes chronic rumination and cognitive fatigue. Regular check-ins help you stay aware of your mental burden, enabling you to step back and seek mindful pauses before burnout sets in.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-emerald-400 font-bold mb-1">0 - 10</div>
              <div className="text-xs font-semibold mb-1 text-white/80">Low Stress</div>
              <div className="text-white/40 text-[11px] leading-normal">Healthy balance, keep up current self-care routines.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-amber-400 font-bold mb-1">11 - 20</div>
              <div className="text-xs font-semibold mb-1 text-white/80">Moderate Stress</div>
              <div className="text-white/40 text-[11px] leading-normal">Mild cognitive overload, recommend scheduled work breaks.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-rose-400 font-bold mb-1">21 - 30</div>
              <div className="text-xs font-semibold mb-1 text-white/80">High Stress</div>
              <div className="text-white/40 text-[11px] leading-normal">Severe overwhelm, priority attention to rest and reflection.</div>
            </div>
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

        <p className="text-white/20 text-xs mt-10 text-center">© {new Date().getFullYear()} Bloomport · Free stress quiz · No signup required</p>
      </main>
    </div>
  );
}
