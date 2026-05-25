import { useState } from 'react';
import { Menu, X, MessageSquare, History, Settings as SettingsIcon } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Example } from '../components/ui/ai-actions';
import SessionSidebar from '../components/SessionSidebar';
import SettingsSidebar from '../components/SettingsSidebar';
import { cn } from '../lib/utils';
import SEO from '../components/SEO';
import { useAuth } from '../context/AuthContext';
import { UnifiedProfileControl } from '../components/ui/unified-profile-control';

export default function AppView({ onNavigate, onNavigateApi, onNavigateDocs }: { onNavigate: () => void; onNavigateApi: () => void; onNavigateDocs: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { user } = useAuth();

  // Parameter states shared between SettingsSidebar and Example (Chat Panel)
  const [selectedModel, setSelectedModel] = useState('anthropic/claude-3.5-sonnet');
  const [temperature, setTemperature] = useState(0.7);
  const [contextLength, setContextLength] = useState(128); // 128K
  const [showSettings, setShowSettings] = useState(true);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="bg-black text-white font-body-md overflow-hidden h-screen flex flex-col">
      <SEO 
        title="Bloomport Models — AI Chat & Focus Sessions" 
        description="Choose from multiple AI models for mindful conversations. Run focus sessions, journal with AI, and reduce cognitive load. Try Bloomport free."
        path="/models"
      />
      {/* TopNavBar */}
      <header className="w-full z-50 flex items-center justify-between px-6 py-3.5 border-b border-white/10 text-white shadow-sm shrink-0 bg-black/40 backdrop-blur-sm">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigate}>
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
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Home</a>
          <a className="text-white transition-colors border-b border-white pb-0.5" href="#" onClick={(e) => { e.preventDefault(); }}>Models</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }}>API</a>
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

      {/* Mobile Page Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" onClick={closeMobileMenu}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
        </div>
      )}
      <div
        className={cn(
          'fixed top-0 left-0 z-[110] h-full w-[280px] bg-black text-white shadow-2xl transform transition-transform duration-300 md:hidden border-r border-white/10',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-sm font-bold tracking-tight uppercase text-white/40">Navigate</span>
          <button
            onClick={closeMobileMenu}
            className="p-1 text-white/50 hover:text-white cursor-pointer"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="px-3 pt-4 space-y-1">
          <button
            onClick={() => { onNavigate(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer text-left"
          >Home</button>
          <button
            onClick={() => { onNavigateApi(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer text-left"
          >API</button>
          <button
            onClick={() => { onNavigateDocs(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/[0.04] transition-all cursor-pointer text-left"
          >Docs</button>
        </nav>
      </div>

      {/* Main Content Area Grid */}
      <div className="flex flex-1 overflow-hidden bg-black">
        <SessionSidebar />

        {/* Mobile Session Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}
        <div
          className={cn(
            'fixed top-0 left-0 z-[110] h-full w-[300px] bg-black text-white shadow-2xl transform transition-transform duration-300 lg:hidden overflow-hidden border-r border-white/10',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SessionSidebar inDrawer />
        </div>

        {/* Center Chat Viewport */}
        <main className="flex-1 flex flex-col overflow-hidden border-r border-white/10 bg-black">
          <Example 
            selectedModel={selectedModel}
            setSelectedModel={setSelectedModel}
            temperature={temperature}
            setTemperature={setTemperature}
            contextLength={contextLength}
            setContextLength={setContextLength}
            showSettings={showSettings}
            setShowSettings={setShowSettings}
          />
          <div className="shrink-0 flex justify-center pb-3 px-4 bg-black">
            <p className="text-[9px] font-semibold text-white/20 uppercase tracking-[0.2em]">Bloomport may produce inaccurate information.</p>
          </div>
        </main>

        {/* Right Configuration sidebar */}
        <SettingsSidebar 
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          temperature={temperature}
          setTemperature={setTemperature}
          contextLength={contextLength}
          setContextLength={setContextLength}
          isOpen={showSettings}
        />
      </div>

      {/* Mobile Navigation bar at bottom */}
      <footer className="lg:hidden bg-black border-t border-white/10 py-2.5 flex justify-around items-center z-50 relative shadow-lg shrink-0">
        <button className="text-white flex flex-col items-center cursor-pointer gap-0.5">
          <MessageSquare className="w-4 h-4" />
          <span className="text-[9px] font-semibold tracking-wider">CHAT</span>
        </button>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="text-white/40 flex flex-col items-center hover:text-white cursor-pointer transition-colors gap-0.5"
        >
          <History className="w-4 h-4" />
          <span className="text-[9px] font-semibold tracking-wider">SESSIONS</span>
        </button>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className={cn("flex flex-col items-center cursor-pointer transition-colors gap-0.5", showSettings ? "text-white" : "text-white/40 hover:text-white")}
        >
          <SettingsIcon className="w-4 h-4" />
          <span className="text-[9px] font-semibold tracking-wider">PARAMS</span>
        </button>
      </footer>
    </div>
  );
}
