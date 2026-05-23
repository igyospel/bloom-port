import { useState } from 'react';
import Landing from './pages/Landing';
import AppView from './pages/AppView';
import ApiPage from './pages/ApiPage';
import DocsPage from './pages/DocsPage';
import { SolanaWalletProvider } from './components/SolanaWalletProvider';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app' | 'api' | 'docs'>('landing');

  return (
    <SolanaWalletProvider>
      {currentView === 'landing' && (
        <Landing
          onNavigate={() => setCurrentView('app')}
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
          onNavigateApp={() => setCurrentView('app')}
          onNavigateDocs={() => setCurrentView('docs')}
        />
      )}
      {currentView === 'docs' && (
        <DocsPage
          onNavigateHome={() => setCurrentView('landing')}
          onNavigateApp={() => setCurrentView('app')}
          onNavigateApi={() => setCurrentView('api')}
        />
      )}
    </SolanaWalletProvider>
  );
}
