import { useState, useEffect } from 'react';
import Landing from './pages/Landing';
import AppView from './pages/AppView';
import ApiPage from './pages/ApiPage';
import DocsPage from './pages/DocsPage';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';
import { SessionProvider } from './context/SessionContext';
import { CreditProvider } from './context/CreditContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SignInPage } from './components/ui/sign-in';
import { SignUpPage } from './components/ui/sign-up';

const sampleTestimonials = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "Principal AI Engineer",
    text: "Bloomport's inference pipeline cut our agent latency by 60%. The memory architecture is production-grade."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "Infrastructure Director",
    text: "Multi-agent orchestration that actually scales. We run 2,000+ concurrent workflows without a single incident."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Kim",
    handle: "VP of Product",
    text: "The API is beautifully minimal. Shipped our first autonomous workflow in under a day."
  },
];

function MainAppContent() {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'api' | 'docs' | 'signin' | 'signup'>('landing');
  const { user, login, signup } = useAuth();

  // Custom Event-based routing to allow components to redirect views
  useEffect(() => {
    const handleNavigation = (e: Event) => {
      const view = (e as CustomEvent).detail as 'landing' | 'app' | 'api' | 'docs' | 'signin' | 'signup';
      if (view) {
        setCurrentView(view);
      }
    };
    window.addEventListener('bloomport-navigate', handleNavigation);
    return () => window.removeEventListener('bloomport-navigate', handleNavigation);
  }, []);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    if (email) {
      login(email);
      setCurrentView('app');
    }
  };

  const handleSignUp = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const name = formData.get('name') as string;
    if (email && name) {
      signup(email, name);
      setCurrentView('app');
    }
  };

  const handleGoogleSignIn = () => {
    login('google.user@gmail.com');
    setCurrentView('app');
  };

  // Check login state before navigating to AppView
  const navigateToApp = () => {
    if (user) {
      setCurrentView('app');
    } else {
      setCurrentView('signin');
    }
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
          onCreateAccount={() => {
            setCurrentView('signup');
          }}
          onBack={() => setCurrentView('landing')}
        />
      )}
      {currentView === 'signup' && (
        <SignUpPage
          testimonials={sampleTestimonials}
          onSignUp={handleSignUp}
          onGoogleSignUp={handleGoogleSignIn}
          onSignIn={() => {
            setCurrentView('signin');
          }}
          onBack={() => setCurrentView('landing')}
        />
      )}
    </>
  );
}

export default function App() {
  return (
    <CreditProvider>
      <AuthProvider>
        <SolanaWalletProvider>
          <SessionProvider>
            <MainAppContent />
          </SessionProvider>
        </SolanaWalletProvider>
      </AuthProvider>
    </CreditProvider>
  );
}
