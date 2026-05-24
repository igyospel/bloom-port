import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '../components/Logo';
import TextRevealFAQs from '../components/ui/text-reveal-faqs';
import { LogoCloud } from '../components/ui/logo-cloud-3';
import { Features } from '../components/ui/features-11';

import { cn } from '../lib/utils';
import { WalletDropdown } from '../components/ui/wallet-dropdown';
import Testimonial from '../components/ui/testimonial';
import SEO from '../components/SEO';
import CreditIndicator from '../components/CreditIndicator';
import AdBanner from '../components/AdBanner';
import { Changelog1 } from '../components/ui/changelog-1';

const logos = [
  { src: "https://svgl.app/library/nvidia-wordmark-light.svg", alt: "Nvidia Logo" },
  { src: "https://svgl.app/library/supabase_wordmark_light.svg", alt: "Supabase Logo" },
  { src: "https://svgl.app/library/openai_wordmark_light.svg", alt: "OpenAI Logo" },
  { src: "https://svgl.app/library/turso-wordmark-light.svg", alt: "Turso Logo" },
  { src: "https://svgl.app/library/vercel_wordmark.svg", alt: "Vercel Logo" },
  { src: "https://svgl.app/library/github_wordmark_light.svg", alt: "GitHub Logo" },
  { src: "https://svgl.app/library/claude-ai-wordmark-icon_light.svg", alt: "Claude AI Logo" },
  { src: "https://svgl.app/library/clerk-wordmark-light.svg", alt: "Clerk Logo" },
];

export default function Landing({ onNavigate, onNavigateApi, onNavigateDocs }: { onNavigate: () => void; onNavigateApi: () => void; onNavigateDocs: () => void }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <div className="font-sans text-white bg-black">
      <SEO 
        title="Bloomport - Intelligent Stillness for the Modern Mind" 
        description="Experience the next generation of calm. Declutter your mind, automate your peace, and rediscover focus through conversational mindfulness powered by calm AI." 
      />
      <section className="hero-container relative min-h-[100svh] flex flex-col overflow-hidden">
          <div className="hero-bg-wrapper absolute inset-0 z-0">
             <img className="hero-bg-video w-full h-full object-cover" src="/newheroimg.png" alt="Hero background" />
             <div className="absolute inset-x-0 bottom-0 h-64 md:h-96 bg-gradient-to-b from-transparent to-black opacity-100"></div>
          </div>
          
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
              <CreditIndicator variant="dark" />
              <WalletDropdown variant="app" />
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

          <div className="hero-content px-4 sm:px-8 pt-24 sm:pt-32 pb-12 rounded-3xl max-w-xl lg:max-w-2xl mx-auto flex-grow flex flex-col text-center items-center relative z-20">
             <h1 className="hero-headline text-3xl sm:text-5xl md:text-7xl lg:text-8xl max-w-5xl mb-6 sm:mb-8 font-serif text-white">
                <span className="whitespace-nowrap">intelligence helped</span><br />
                <em>your daily.</em>
             </h1>
             <p className="max-w-2xl text-base sm:text-lg mb-6 sm:mb-10 leading-relaxed text-white font-medium">
                Experience the next generation of calm. Our LLM-powered assistant helps you declutter your mind, automate your peace, and rediscover focus through conversational mindfulness.
             </p>
             <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                <button onClick={onNavigate} className="bg-brand-dark text-white px-5 py-3 sm:px-8 sm:py-4 rounded-full flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base font-medium hover:bg-opacity-90 transition-all group cursor-pointer border border-transparent w-full sm:w-auto justify-center">
                   <span>Start for free</span>
                   <svg className="h-4 w-4 sm:h-5 sm:w-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                   </svg>
                </button>
                <button onClick={onNavigate} className="border border-brand-dark/20 px-5 py-3 sm:px-8 sm:py-4 rounded-full flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base font-medium transition-all bg-white text-brand-dark hover:bg-opacity-90 cursor-pointer w-full sm:w-auto justify-center">
                   <svg className="h-4 w-4 sm:h-5 sm:w-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.051.046 2 2 0 00-1.241 2.533l.8 2.4a2 2 0 002.484 1.268l2.398-.8a2 2 0 011.116 0l2.398.8a2 2 0 002.484-1.268l.8-2.4a2 2 0 00-1.241-2.533z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.914 10a4 4 0 11-7.828 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"></path>
                   </svg>
                   <span>Explore Models</span>
                </button>
             </div>
          </div>

      </section>

      <section className="py-16 md:py-24 bg-black text-white w-full flex flex-col items-center relative overflow-hidden">
         <div
            aria-hidden="true"
            className={cn(
               "pointer-events-none absolute inset-0",
               "bg-[radial-gradient(ellipse_at_center,--theme(--color-foreground/.08),transparent_70%)]",
            )}
         />
         <div className="relative mx-auto max-w-3xl px-6">
            <h2 className="mb-5 text-center font-medium text-foreground text-xl tracking-tight md:text-3xl">
               <span className="text-white/50">Trusted by experts.</span>
               <br />
               <span className="font-semibold text-white">Used by the leaders.</span>
            </h2>
            <div className="mx-auto my-5 h-px max-w-sm bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
            <LogoCloud logos={logos} />
            <div className="mt-5 h-px bg-white/10 [mask-image:linear-gradient(to_right,transparent,black,transparent)]" />
         </div>
      </section>

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
