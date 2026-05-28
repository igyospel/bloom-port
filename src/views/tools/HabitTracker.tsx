'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import SEO from '../../components/SEO';
import AdBanner from '../../components/AdBanner';
import { Logo } from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

interface HabitTrackerProps {
  onNavigateHome: () => void;
  onNavigateApp: () => void;
}

interface Habit {
  id: number;
  name: string;
  duration: string;
  icon: string;
}

const habits: Habit[] = [
  { id: 0, name: 'Morning mindfulness', duration: '5 min', icon: '🌅' },
  { id: 1, name: 'AI journaling session', duration: '10 min', icon: '✍️' },
  { id: 2, name: 'Focus timer session', duration: '25 min', icon: '🎯' },
  { id: 3, name: 'Mindful breathing', duration: '3 rounds', icon: '🌬️' },
  { id: 4, name: 'Evening reflection', duration: '5 min', icon: '🌃' },
  { id: 5, name: 'Digital detox', duration: '30 min', icon: '🔌' },
];

interface StoredData {
  dates: { [dateStr: string]: boolean[] };
}

const LOCAL_STORAGE_KEY = 'bloomport-habits';

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What mindfulness habits should I track daily?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A balanced daily routine includes morning centering, reflecting via journaling, focused work intervals (like Pomodoro), deep breathing, evening reflections, and designated time away from screens.',
      },
    },
    {
      '@type': 'Question',
      name: 'How does a streak tracker motivate habit building?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Visualizing your consecutive days of success triggers positive reinforcement in the brain. Over time, maintaining the streak becomes a powerful psychological motivator to avoid skipping a day.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is my habit data stored?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your progress is stored entirely in your local browser storage (localStorage). It is never sent to any external server, keeping your personal daily routines completely private.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is the habit tracker free to use?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, Bloomport\'s daily wellness habit tracker is completely free to use without any account signups or credit cards.',
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
      "item": "https://bloomport.fun/tools/habit-tracker"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Habit Tracker",
      "item": "https://bloomport.fun/tools/habit-tracker"
    }
  ]
};

// Helper: Get local ISO date string (YYYY-MM-DD)
function getLocalDateStr(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper: Get date offset
function getDateOffset(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}

export default function HabitTracker({ onNavigateHome, onNavigateApp }: HabitTrackerProps) {
  const { user, isMock } = useAuth();
  const [datesData, setDatesData] = useState<{ [dateStr: string]: boolean[] }>({});
  const [todayHabits, setTodayHabits] = useState<boolean[]>(new Array(habits.length).fill(false));
  const [streak, setStreak] = useState(0);

  const todayStr = getLocalDateStr();

  // Load from Supabase (if logged in) or LocalStorage (as guest/fallback)
  useEffect(() => {
    const fetchAndLoadHabits = async () => {
      if (!isMock && user) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          if (authUser) {
            const { data, error } = await supabase
              .from('habits')
              .select('date_str, completed_habits')
              .eq('user_id', authUser.id);

            if (data && !error) {
              const dbDates: { [dateStr: string]: boolean[] } = {};
              data.forEach((row) => {
                dbDates[row.date_str] = row.completed_habits;
              });

              if (!dbDates[todayStr]) {
                dbDates[todayStr] = new Array(habits.length).fill(false);
              }

              setDatesData(dbDates);
              setTodayHabits(dbDates[todayStr]);
              return;
            }
          }
        } catch (e) {
          console.error('Error fetching habits from Supabase', e);
        }
      }

      // Fallback/Guest LocalStorage load
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as StoredData;
          const dates = parsed.dates || {};
          setDatesData(dates);

          if (dates[todayStr]) {
            setTodayHabits(dates[todayStr]);
          } else {
            const newToday = new Array(habits.length).fill(false);
            setTodayHabits(newToday);
            setDatesData((prev) => ({ ...prev, [todayStr]: newToday }));
          }
        } catch (e) {
          console.error('Error parsing habits data', e);
        }
      } else {
        const initialToday = new Array(habits.length).fill(false);
        setTodayHabits(initialToday);
        setDatesData({ [todayStr]: initialToday });
      }
    };

    fetchAndLoadHabits();
  }, [todayStr, user, isMock]);

  // Save to LocalStorage/Supabase and recalculate streak whenever datesData changes
  useEffect(() => {
    if (Object.keys(datesData).length === 0) return;
    
    // Save to LocalStorage
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify({ dates: datesData }));

    // Save to Supabase (if logged in)
    const saveToSupabase = async () => {
      if (!isMock && user) {
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser();
          const todayData = datesData[todayStr];
          if (authUser && todayData) {
            await supabase.from('habits').upsert({
              user_id: authUser.id,
              date_str: todayStr,
              completed_habits: todayData,
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id, date_str' });
          }
        } catch (e) {
          console.error('Error syncing habits with Supabase', e);
        }
      }
    };
    saveToSupabase();

    // Dynamic Streak Calculation
    let currentStreak = 0;
    let checkDate = new Date();
    
    // If today is not fully complete, start checking from yesterday.
    // If today IS fully complete, we can count today.
    const todayComplete = datesData[todayStr]?.every(Boolean) && datesData[todayStr]?.length === habits.length;
    
    if (!todayComplete) {
      checkDate.setDate(checkDate.getDate() - 1);
    }

    while (true) {
      const checkStr = getLocalDateStr(checkDate);
      const dayData = datesData[checkStr];
      const isComplete = dayData?.every(Boolean) && dayData?.length === habits.length;

      if (isComplete) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    
    setStreak(currentStreak);
  }, [datesData, todayStr, user, isMock]);

  const toggleHabit = (idx: number) => {
    const updated = [...todayHabits];
    updated[idx] = !updated[idx];
    setTodayHabits(updated);
    setDatesData((prev) => ({
      ...prev,
      [todayStr]: updated
    }));
  };

  const completedCount = todayHabits.filter(Boolean).length;
  const progressPercent = Math.round((completedCount / habits.length) * 100);

  // Generate past 7 days (including today)
  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    // Index 0 is 6 days ago, index 6 is today
    const offset = i - 6;
    const date = getDateOffset(offset);
    const dateStr = getLocalDateStr(date);
    const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
    const isToday = offset === 0;

    const dayData = datesData[dateStr];
    const isComplete = dayData?.every(Boolean) && dayData?.length === habits.length;

    return {
      dayLabel,
      dateStr,
      isToday,
      isComplete,
      dayNum: date.getDate(),
    };
  });

  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <SEO
        title="Free Mindfulness Habit Tracker — Daily Wellness Tracker"
        description="Track your daily mindfulness habits for free. Log meditation, journaling, focus sessions, and breathwork. Build consistency with Bloomport free habit tracker."
        path="/tools/habit-tracker"
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
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">Free Mindfulness Habit Tracker</h1>
          <p className="text-white/50 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Cultivate consistency and check in daily. Track 6 simple mindfulness practices designed to restore clarity and reduce cognitive fatigue.
          </p>
        </div>

        {/* Streak & Today Progress Row */}
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Current Streak</span>
              <span className="text-2xl sm:text-3xl font-bold">{streak} {streak === 1 ? 'Day' : 'Days'}</span>
            </div>
            <div className="text-4xl">🔥</div>
          </div>
          <div className="rounded-3xl border border-white/10 bg-white/[0.02] p-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono tracking-widest text-white/40 uppercase block mb-1">Today's Progress</span>
              <span className="text-2xl sm:text-3xl font-bold">{progressPercent}%</span>
            </div>
            <div className="w-12 h-12 rounded-full border-2 border-white/10 flex items-center justify-center font-mono text-xs text-white/60 relative overflow-hidden">
              <div
                className="absolute bottom-0 left-0 right-0 bg-white/20 transition-all duration-300"
                style={{ height: `${progressPercent}%` }}
              />
              <span className="z-10">{completedCount}/{habits.length}</span>
            </div>
          </div>
        </div>

        {/* 7-Day History Card */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 mb-6">
          <h2 className="text-sm font-semibold tracking-wider text-white/40 uppercase mb-4 text-center">Past 7 Days</h2>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span className="text-[10px] text-white/30 font-semibold">{day.dayLabel}</span>
                <div
                  className={`w-9 h-9 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-all ${
                    day.isComplete
                      ? 'bg-white text-black font-bold'
                      : day.isToday
                      ? 'border border-white/30 bg-white/5 text-white'
                      : 'border border-white/10 bg-transparent text-white/40'
                  }`}
                >
                  {day.isComplete ? '✓' : day.dayNum}
                </div>
                {day.isToday && <span className="text-[9px] font-mono text-white/50 tracking-wider">TODAY</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Habits List Checkboxes */}
        <div className="w-full rounded-3xl border border-white/10 bg-white/[0.02] p-6 sm:p-8 flex flex-col gap-3">
          <h2 className="text-lg font-bold mb-3 tracking-tight">Today's Practices</h2>
          <div className="flex flex-col gap-2.5">
            {habits.map((habit) => (
              <button
                key={habit.id}
                onClick={() => toggleHabit(habit.id)}
                className="w-full text-left px-5 py-4 rounded-2xl border border-white/8 bg-white/[0.01] hover:border-white/20 hover:bg-white/[0.03] transition-all duration-200 cursor-pointer flex items-center justify-between group active:scale-[0.99]"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{habit.icon}</span>
                  <div>
                    <h3 className="text-sm font-semibold text-white leading-none mb-1 group-hover:text-white/90 transition-colors">
                      {habit.name}
                    </h3>
                    <span className="text-[11px] text-white/40 font-mono tracking-wider uppercase">
                      {habit.duration}
                    </span>
                  </div>
                </div>

                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all duration-200 ${
                    todayHabits[habit.id]
                      ? 'bg-white border-white text-black'
                      : 'border-white/20 bg-transparent text-transparent group-hover:border-white/40'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="w-full mt-8"><AdBanner layout="horizontal" /></div>

        <section className="w-full mt-12">
          <h2 className="text-xl font-bold mb-4 tracking-tight">Why Consistent Mindfulness Matters</h2>
          <p className="text-white/55 text-sm leading-relaxed mb-6">
            Small, repeating rituals form the basis of cognitive resilience. Instead of practicing mindfulness only during acute anxiety episodes, daily habits train the nervous system to remain grounded under baseline stress. Even brief check-ins reset cortisol levels and prevent accumulated fatigue.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-2xl mb-2">🧘‍♀️</div>
              <div className="text-sm font-bold mb-1">Emotional Control</div>
              <div className="text-white/40 text-xs">Consistent daily practice strengthens neural pathways associated with emotional regulation.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-2xl mb-2">🌿</div>
              <div className="text-sm font-bold mb-1">Stress Reduction</div>
              <div className="text-white/40 text-xs">Brief exercises lower heart rate and reduce circulating cortisol hormones.</div>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-5 text-center">
              <div className="text-2xl mb-2">⚡</div>
              <div className="text-sm font-bold mb-1">Sustained Focus</div>
              <div className="text-white/40 text-xs">Structured pauses prevent decision fatigue and sustain task-level concentration.</div>
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

        <section className="w-full mt-12 rounded-3xl border border-white/10 bg-white/[0.02] p-8 text-center">
          <h2 className="text-xl font-bold mb-2 tracking-tight">Elevate Your Daily Practices with AI Guidance</h2>
          <p className="text-white/50 text-sm mb-6 max-w-md mx-auto leading-relaxed">
            Log your daily journaling habit using Bloomport's free mindful conversational assistant for deeper insights and reflection.
          </p>
          <button onClick={onNavigateApp} className="inline-flex items-center gap-2 bg-white text-black font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.15)]">
            Explore Mindful AI <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        <p className="text-white/20 text-xs mt-10 text-center">© {new Date().getFullYear()} Bloomport · Free habit tracker · No signup required</p>
      </main>
    </div>
  );
}
