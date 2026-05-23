import { useState } from 'react';
import { Menu, X, MessageSquare, History, Settings } from 'lucide-react';
import { Logo } from '../components/Logo';
import { Example } from '../components/ui/ai-actions';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import SessionSidebar from '../components/SessionSidebar';
import { cn } from '../lib/utils';

export default function AppView({ onNavigate, onNavigateApi, onNavigateDocs }: { onNavigate: () => void; onNavigateApi: () => void; onNavigateDocs: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="bg-[#0a0a0a] text-white font-body-md overflow-hidden h-screen flex flex-col">
      {/* TopNavBar */}
      <header className="w-full z-50 flex items-center justify-between px-4 py-4 sm:px-8 sm:py-6 bg-[#0a0a0a] border-b border-white/10 text-white shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigate}>
          <button
            onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
            className="md:hidden p-2.5 -ml-1 text-white/50 hover:text-white cursor-pointer"
            aria-label="Open navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Logo className="w-6 h-6 sm:w-8 sm:h-8" variant="dark" />
          <span className="text-xl sm:text-2xl font-bold tracking-tight">Bloomport</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-10 text-[14px] lg:text-[15px] font-medium font-sans text-white/80">
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Home</a>
          <a className="text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); }}>Models</a>
          <a className="text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }}>API</a>
          <a className="hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }}>Docs</a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <WalletDropdown variant="app" />
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
            onClick={() => { onNavigate(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >Home</button>
          <button
            onClick={() => { onNavigateApi(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >API</button>
          <button
            onClick={() => { onNavigateDocs(); closeMobileMenu(); }}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
          >Docs</button>
        </nav>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <SessionSidebar />

        {/* Mobile Session Sidebar Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-[100] lg:hidden" onClick={() => setMobileSidebarOpen(false)}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          </div>
        )}
        <div
          className={cn(
            'fixed top-0 left-0 z-[110] h-full w-[340px] bg-[#0a0a0a] text-white shadow-2xl transform transition-transform duration-300 lg:hidden overflow-hidden',
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          )}
        >
          <SessionSidebar inDrawer />
        </div>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col overflow-hidden subtle-grid-app">
          <Example />
          <div className="shrink-0 flex justify-center pb-3 px-4">
            <p className="text-[9px] font-semibold text-white/30 uppercase tracking-[0.2em]">Bloomport may produce inaccurate information.</p>
          </div>
        </main>
      </div>

      {/* Mobile Navigation */}
      <footer className="lg:hidden bg-[#0a0a0a] border-t border-white/10 py-3 flex justify-around items-center z-50 relative shadow-lg shrink-0">
        <button className="text-white flex flex-col items-center cursor-pointer gap-0.5">
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-semibold">CHAT</span>
        </button>
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="text-white/40 flex flex-col items-center hover:text-white cursor-pointer transition-colors gap-0.5"
        >
          <History className="w-5 h-5" />
          <span className="text-[10px] font-semibold">SESSIONS</span>
        </button>
        <button className="text-white/40 flex flex-col items-center hover:text-white cursor-pointer transition-colors gap-0.5">
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-semibold">PREFS</span>
        </button>
      </footer>
    </div>
  );
}
