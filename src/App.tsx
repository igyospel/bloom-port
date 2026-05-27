import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import AppView from './pages/AppView';
import ApiPage from './pages/ApiPage';
import DocsPage from './pages/DocsPage';
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import About from './pages/About';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';
import { SessionProvider } from './context/SessionContext';
import { CreditProvider } from './context/CreditContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SignInPage } from './components/ui/sign-in';
import { SignUpPage } from './components/ui/sign-up';

// Lazy-load tool pages to keep initial bundle small
import { lazy, Suspense } from 'react';
const FocusTimer = lazy(() => import('./pages/tools/FocusTimer'));
const JournalPrompts = lazy(() => import('./pages/tools/JournalPrompts'));
const StressQuiz = lazy(() => import('./pages/tools/StressQuiz'));
const HabitTracker = lazy(() => import('./pages/tools/HabitTracker'));

type ViewType =
  | 'landing'
  | 'app'
  | 'api'
  | 'docs'
  | 'signin'
  | 'signup'
  | 'blog'
  | 'blogpost'
  | 'focustimer'
  | 'journalprompts'
  | 'stressquiz'
  | 'habittracker'
  | 'about';

const sampleTestimonials = [
  {
    avatarSrc: 'https://randomuser.me/api/portraits/women/57.jpg',
    name: 'Sarah Chen',
    handle: 'Principal AI Engineer',
    text: "Bloomport's inference pipeline cut our agent latency by 60%. The memory architecture is production-grade.",
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/64.jpg',
    name: 'Marcus Johnson',
    handle: 'Infrastructure Director',
    text: 'Multi-agent orchestration that actually scales. We run 2,000+ concurrent workflows without a single incident.',
  },
  {
    avatarSrc: 'https://randomuser.me/api/portraits/men/32.jpg',
    name: 'David Kim',
    handle: 'VP of Product',
    text: 'The API is beautifully minimal. Shipped our first autonomous workflow in under a day.',
  },
];

const ToolFallback = () => (
  <div className="min-h-screen bg-black text-white flex items-center justify-center">
    <div className="text-white/40 text-sm font-mono">Loading...</div>
  </div>
);

function MainAppContent() {
  const [currentView, setCurrentView] = useState<ViewType>('landing');
  const [currentBlogSlug, setCurrentBlogSlug] = useState<string>('');
  const { user, login, signup, loginWithGoogle } = useAuth();

  // Custom Event-based routing
  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const view = (e as CustomEvent).detail as string;
      if (view) {
        setCurrentView(view as ViewType);
      }
    };
    window.addEventListener('bloomport-navigate', handleNavigation);
    return () => window.removeEventListener('bloomport-navigate', handleNavigation);
  }, []);

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    if (email) {
      const { error } = await login(email, password);
      if (error) {
        alert(error.message || 'Login failed. Please check your credentials.');
      } else {
        setCurrentView('app');
      }
    }
  };

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    const password = formData.get('password') as string;
    if (email && name) {
      const { error } = await signup(email, name, password);
      if (error) {
        alert(error.message || 'Registration failed. Please try again.');
      } else {
        alert('Account created successfully! Please sign in if email confirmation is required.');
        setCurrentView('app');
      }
    }
  };

  const handleGoogleSignIn = async () => {
    const { error } = await loginWithGoogle();
    if (error) {
      alert(error.message || 'Google Sign-In failed.');
    }
  };

  const navigateToApp = () => {
    if (user) {
      setCurrentView('app');
    } else {
      setCurrentView('signin');
    }
  };

  const navigateToBlogPost = (slug: string) => {
    setCurrentBlogSlug(slug);
    setCurrentView('blogpost');
  };

  return (
    <>
      {currentView === 'landing' && (
        <Landing
          onNavigate={navigateToApp}
          onNavigateApi={() => setCurrentView('api')}
          onNavigateDocs={() => setCurrentView('docs')}
        />
      )}
      {currentView === 'app' && (
        <AppView
          onNavigate={() => setCurrentView('landing')}
          onNavigateApi={() => setCurrentView('api')}
          onNavigateDocs={() => setCurrentView('docs')}
        />
      )}
      {currentView === 'api' && (
        <ApiPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateApp={navigateToApp}
          onNavigateDocs={() => setCurrentView('docs')}
        />
      )}
      {currentView === 'docs' && (
        <DocsPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateApp={navigateToApp}
          onNavigateApi={() => setCurrentView('api')}
        />
      )}
      {currentView === 'signin' && (
        <SignInPage
          testimonials={sampleTestimonials}
          onSignIn={handleSignIn}
          onGoogleSignIn={handleGoogleSignIn}
          onResetPassword={() => alert('Password reset link sent to email.')}
          onCreateAccount={() => setCurrentView('signup')}
          onBack={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'signup' && (
        <SignUpPage
          testimonials={sampleTestimonials}
          onSignUp={handleSignUp}
          onGoogleSignUp={handleGoogleSignIn}
          onSignIn={() => setCurrentView('signin')}
          onBack={() => setCurrentView('landing')}
        />
      )}

      {/* Blog Routes */}
      {currentView === 'blog' && (
        <BlogIndex
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateApp={navigateToApp}
          onNavigatePost={navigateToBlogPost}
        />
      )}
      {currentView === 'blogpost' && (
        <BlogPost
          slug={currentBlogSlug}
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateBlog={() => setCurrentView('blog')}
          onNavigateApp={navigateToApp}
        />
      )}

      {/* Free Tools Routes */}
      {currentView === 'focustimer' && (
        <Suspense fallback={<ToolFallback />}>
          <FocusTimer
            onNavigateHome={() => setCurrentView('landing')}
            onNavigateApp={navigateToApp}
          />
        </Suspense>
      )}
      {currentView === 'journalprompts' && (
        <Suspense fallback={<ToolFallback />}>
          <JournalPrompts
            onNavigateHome={() => setCurrentView('landing')}
            onNavigateApp={navigateToApp}
          />
        </Suspense>
      )}
      {currentView === 'stressquiz' && (
        <Suspense fallback={<ToolFallback />}>
          <StressQuiz
            onNavigateHome={() => setCurrentView('landing')}
            onNavigateApp={navigateToApp}
          />
        </Suspense>
      )}
      {currentView === 'habittracker' && (
        <Suspense fallback={<ToolFallback />}>
          <HabitTracker
            onNavigateHome={() => setCurrentView('landing')}
            onNavigateApp={navigateToApp}
          />
        </Suspense>
      )}
      {currentView === 'about' && (
        <About
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateApp={navigateToApp}
          onNavigateApi={() => setCurrentView('api')}
          onNavigateDocs={() => setCurrentView('docs')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CreditProvider>
        <SolanaWalletProvider>
          <SessionProvider>
            <MainAppContent />
          </SessionProvider>
        </SolanaWalletProvider>
      </CreditProvider>
    </AuthProvider>
  );
}
