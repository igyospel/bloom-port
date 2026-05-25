import { useState } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import TextRevealFAQs from '../components/ui/text-reveal-faqs';
import { TrustedByShowcase } from '../components/ui/trusted-by-showcase';
import { Features } from '../components/ui/features-11';

import { cn } from '../lib/utils';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import Testimonial from '../components/ui/testimonial';
import SEO from '../components/SEO';
import CreditIndicator from '../components/CreditIndicator';
import AdBanner from '../components/AdBanner';
import { Changelog1 } from '../components/ui/changelog-1';
import { ParticleText } from '../components/ui/particle-text';
import { useAuth } from '../context/AuthContext';
import { UnifiedProfileControl } from '../components/ui/unified-profile-control';

export default function Landing({ onNavigate, onNavigateApi, onNavigateDocs }: { onNavigate: () => void; onNavigateApi: () => void; onNavigateDocs: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="font-sans text-white bg-black">
      <SEO 
        title="Bloomport — Mindful AI Productivity Platform" 
        description="Declutter your mind and find focus with Bloomport's AI-powered journaling, mindful chat, and focus sessions. Start free with 10,000 credits."
        path="/"
      />
      <section className="relative min-h-[100svh] flex flex-col overflow-hidden bg-black">
          {/* Subtle ambient glow / particle fog */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_50%)] pointer-events-none z-0" />
          
          <header className="absolute top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-3.5 border-b border-white/10 text-white shadow-sm shrink-0 bg-black/40 backdrop-blur-sm">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <button
                onClick={(e) => { e.stopPropagation(); setMobileMenuOpen(true); }}
                className="md:hidden p-2 -ml-1 text-white/50 hover:text-white cursor-pointer"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
              <Logo className="h-5 w-auto" variant="dark" />
            </div>
            
            <nav className="hidden md:flex items-center space-x-8 text-[13px] font-medium font-sans">
              <a className="text-white border-b border-white pb-0.5" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}>Home</a>
              <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigate(); }}>Models</a>
              <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateApi(); }}>API</a>
              <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDocs(); }}>Docs</a>
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
                    className="text-[13px] font-semibold bg-white text-black hover:bg-white/90 transition-all cursor-pointer px-4 py-2 rounded-full font-sans"
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
              <span className="text-lg font-bold tracking-tight">Menu</span>
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
                onClick={() => { window.scrollTo({ top: 0, behavior: 'smooth' }); closeMobileMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
              >
                Home
              </button>
              <button
                onClick={() => { onNavigate(); closeMobileMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
              >
                Models
              </button>
              <button
                onClick={() => { onNavigateApi(); closeMobileMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
              >
                API
              </button>
              <button
                onClick={() => { onNavigateDocs(); closeMobileMenu(); }}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/10 transition-all cursor-pointer text-left"
              >
                Docs
              </button>
            </nav>
          </div>

          {/* New Two-Column Hero Content */}
          <div className="relative z-20 flex-grow flex items-center w-full max-w-7xl mx-auto px-6 sm:px-12 pt-28 pb-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center w-full">
              {/* Left Column: Typography & Action Buttons */}
              <div className="lg:col-span-5 flex flex-col text-left items-start justify-center">

                {/* Massive Typography Headline */}
                <h1 className="text-[36px] sm:text-[48px] lg:text-[50px] xl:text-[56px] font-sans font-bold tracking-tight text-white mb-6 leading-[1.1] flex flex-col items-start">
                  <span>Build, deploy and scale</span>
                  <span className="text-white/60">AI agents with</span>
                  <div className="w-full mt-2 min-h-[90px] sm:min-h-[110px] lg:min-h-[130px] flex items-center">
                    <ParticleText />
                  </div>
                </h1>

                {/* Description */}
                <p className="text-sm sm:text-base text-white/55 mb-8 max-w-md leading-relaxed font-sans font-normal">
                  The fastest way to build, deploy and scale autonomous AI agents across GPUs, CPUs and specialized accelerators.
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                  <button 
                    onClick={onNavigate} 
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full bg-white text-black font-semibold hover:bg-white/95 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group shadow-[0_8px_30px_rgb(255,255,255,0.15)]"
                  >
                    <span>Start Building</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                  
                  <button 
                    onClick={onNavigateDocs} 
                    className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-white/10 bg-white/[0.02] text-white hover:bg-white/[0.06] hover:border-white/20 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 group hover:shadow-[0_0_20px_rgba(255,255,255,0.04)]"
                  >
                    <span>View Documentation</span>
                    <ArrowRight className="w-4 h-4 opacity-50 transform group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                </div>
              </div>

              {/* Right Column: Animated Hero Video */}
              <div className="lg:col-span-7 w-full flex items-center justify-center relative">
                <div className="w-full aspect-video rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(255,255,255,0.08)] bg-black/50 backdrop-blur-sm">
                  <video
                    src="/landingAnimated.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
      </section>

      <TrustedByShowcase />

      <Features />
      <div className="w-full bg-[#0a0a0a] py-4">
         <div className="max-w-6xl mx-auto px-4 md:px-8">
            <AdBanner layout="horizontal" />
         </div>
      </div>
      <Changelog1 />
      <Testimonial />
      <TextRevealFAQs />
      <div className="w-full bg-[#0a0a0a] py-4">
         <div className="max-w-6xl mx-auto px-4 md:px-8">
            <AdBanner layout="horizontal" />
         </div>
      </div>

      <footer className="bg-black text-white pt-16 sm:pt-24 pb-8 sm:pb-12 border-t border-white/10 subtle-grid">
         <div className="max-w-7xl mx-auto px-4 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12 mb-12 sm:mb-20">
               <div className="md:col-span-4">
                  <div className="flex items-center space-x-2 mb-6 sm:mb-8">
                     <Logo className="h-6 sm:h-8 w-auto" variant="dark" />
                  </div>
                  <p className="text-white/80 max-w-xs leading-relaxed text-[14px] sm:text-[16px] font-medium mb-8 sm:mb-10">
                     Intelligent Stillness for the modern mind. Harnessing AI to help you find focus in the noise.
                  </p>
                  <div className="flex items-center space-x-4 sm:space-x-6 text-[13px] sm:text-[15px] font-semibold tracking-wide">
                     <a className="text-white/70 hover:text-white transition-colors" href="#">Twitter</a>
                     <a className="text-white/70 hover:text-white transition-colors" href="#">Instagram</a>
                     <a className="text-white/70 hover:text-white transition-colors" href="#">LinkedIn</a>
                  </div>
               </div>
               <div className="md:col-span-8 grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-16 lg:ml-12">
                  <div>
                     <h4 className="font-semibold text-base sm:text-lg text-white mb-4 sm:mb-6 tracking-tight">Product</h4>
                     <ul className="space-y-3 sm:space-y-4 text-[13px] sm:text-[15px] text-white/70 font-medium">
                        <li><a className="hover:text-white transition-colors" href="#">Models</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">API</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Pricing</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Documentation</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold text-base sm:text-lg text-white mb-4 sm:mb-6 tracking-tight">Company</h4>
                     <ul className="space-y-3 sm:space-y-4 text-[13px] sm:text-[15px] text-white/70 font-medium">
                        <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Careers</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Community</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Blog</a></li>
                     </ul>
                  </div>
                  <div>
                     <h4 className="font-semibold text-base sm:text-lg text-white mb-4 sm:mb-6 tracking-tight">Legal</h4>
                     <ul className="space-y-3 sm:space-y-4 text-[13px] sm:text-[15px] text-white/70 font-medium">
                        <li><a className="hover:text-white transition-colors" href="#">Privacy Policy</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Terms of Service</a></li>
                        <li><a className="hover:text-white transition-colors" href="#">Cookie Policy</a></li>
                     </ul>
                  </div>
               </div>
            </div>
            <div className="pt-6 sm:pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[11px] sm:text-[13px] text-white/60 font-semibold tracking-wide">
               <p>© 2024 Bloomport. All rights reserved.</p>
               <p className="mt-3 md:mt-0 italic tracking-normal opacity-80">Built for calm.</p>
            </div>
         </div>
      </footer>
    </div>
  );
}
