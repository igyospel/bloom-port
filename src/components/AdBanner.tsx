import { useEffect, useState, useRef } from 'react';
import { Sparkles, Zap, ShieldAlert, ArrowRight } from 'lucide-react';
import { cn } from '../lib/utils';

interface AdBannerProps {
  layout?: 'horizontal' | 'sidebar' | 'in-feed';
  className?: string;
}

export default function AdBanner({ layout = 'horizontal', className }: AdBannerProps) {
  const [adBlockedOrUnfilled, setAdBlockedOrUnfilled] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    // 1. Check if AdBlock is active or AdSense is not loaded
    const isAdsenseBlocked = !window.adsbygoogle || typeof window.adsbygoogle.push !== 'function';
    if (isAdsenseBlocked) {
      setAdBlockedOrUnfilled(true);
      return;
    }

    // 2. Try loading the AdSense ad unit
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.warn('AdSense push failed', e);
      setAdBlockedOrUnfilled(true);
      return;
    }

    // 3. Set a timeout to detect if the ad failed to fill (e.g., if account is still under review)
    const timeout = setTimeout(() => {
      const insElement = adRef.current;
      if (insElement) {
        const hasAdStatus = insElement.getAttribute('data-ad-status');
        const hasGoogleStatus = insElement.getAttribute('data-adsbygoogle-status');
        
        // If Google hasn't processed the ad or marked it unfilled
        if (hasAdStatus === 'unfilled' || !hasGoogleStatus) {
          setAdBlockedOrUnfilled(true);
        }
      }
    }, 2500);

    return () => clearTimeout(timeout);
  }, []);

  // Premium Upgrade Fallback UI
  if (adBlockedOrUnfilled) {
    if (layout === 'sidebar') {
      return (
        <div className={cn(
          "rounded-2xl p-4 bg-gradient-to-br from-white/[0.04] via-white/[0.01] to-transparent border border-white/[0.08] relative overflow-hidden group hover:border-white/15 transition-all duration-500",
          className
        )}>
          <div className="absolute -top-10 -right-10 w-24 h-24 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all duration-500" />
          <div className="flex items-center gap-1.5 mb-2.5">
            <span className="text-[9px] font-bold tracking-[0.15em] bg-white/10 px-2 py-0.5 rounded-full text-white/50 uppercase">
              Sponsored
            </span>
            <Sparkles className="w-3.5 h-3.5 text-white/70 animate-pulse" />
          </div>
          <h4 className="text-white font-medium text-[13px] tracking-tight mb-1 group-hover:text-white transition-colors">
            Bloomport Premium
          </h4>
          <p className="text-white/45 text-[11px] leading-relaxed mb-3 group-hover:text-white/60 transition-colors">
            Quiet the noise. Get unlimited focus sessions, priority queue, and remove ads completely.
          </p>
          <button 
            onClick={() => {
              // Click handler for premium upgrade
              alert('Bloomport Premium is coming soon! Thank you for your interest.');
            }}
            className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white text-white hover:text-black text-[11px] font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer"
          >
            <span>Upgrade Ad-Free</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      );
    }

    if (layout === 'in-feed') {
      return (
        <div className={cn(
          "my-4 rounded-2xl p-5 bg-gradient-to-r from-white/[0.04] to-transparent border border-white/[0.08] relative overflow-hidden group hover:border-white/15 transition-all duration-300 max-w-2xl mx-auto w-full",
          className
        )}>
          <div className="absolute right-4 top-4">
            <span className="text-[8px] font-bold tracking-[0.2em] bg-white/10 px-2.5 py-0.5 rounded-full text-white/40 uppercase">
              Sponsored
            </span>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/[0.06] border border-white/10 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="space-y-1.5 pr-14">
              <h4 className="text-white font-semibold text-sm tracking-tight">
                Focus Intentionally with Premium
              </h4>
              <p className="text-white/40 text-xs leading-relaxed">
                Enjoy unlimited conversational mindfulness sessions and instant AI agent responses with zero interruptions. Connect your wallet to unlock lifetime access.
              </p>
              <div className="pt-1.5">
                <button 
                  onClick={() => alert('Bloomport Premium integration is coming soon!')}
                  className="px-4 py-1.5 rounded-full bg-white text-black text-xs font-bold uppercase hover:bg-neutral-200 transition-all cursor-pointer flex items-center gap-1"
                >
                  <span>Go Premium</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Default: 'horizontal'
    return (
      <div className={cn(
        "my-6 py-6 px-8 rounded-3xl bg-gradient-to-r from-white/[0.03] via-white/[0.01] to-transparent border border-white/[0.06] flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group hover:border-white/10 transition-all duration-500",
        className
      )}>
        <div className="absolute right-6 top-4 md:top-6">
          <span className="text-[8px] font-bold tracking-[0.2em] bg-white/10 px-2.5 py-0.5 rounded-full text-white/30 uppercase">
            Sponsored
          </span>
        </div>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center shrink-0 mx-auto md:mx-0">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div className="space-y-1">
            <h4 className="text-white font-medium text-[15px] tracking-tight">
              Unlock Bloomport Premium
            </h4>
            <p className="text-white/40 text-xs max-w-xl leading-normal">
              Support mindful development. Unlock ad-free stillness, priority AI agents, and unlimited focus sessions.
            </p>
          </div>
        </div>
        <button 
          onClick={() => alert('Bloomport Premium integration is coming soon!')}
          className="bg-white hover:bg-neutral-200 text-black px-6 py-2.5 rounded-full text-xs font-bold uppercase transition-all flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
        >
          <span>Upgrade Now</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Real AdSense Placements
  return (
    <div className={cn("my-6 w-full flex flex-col items-center justify-center bg-black/10 p-2 rounded-2xl border border-white/5", className)}>
      <div className="w-full flex justify-between px-1 pb-1">
        <span className="text-[8px] font-bold tracking-[0.2em] text-white/30 uppercase">Advertisement</span>
      </div>
      <div className="w-full overflow-hidden flex justify-center">
        <ins
          ref={adRef}
          className="adsbygoogle"
          style={{ display: 'block', minWidth: '250px', width: '100%' }}
          data-ad-client="ca-pub-8100210912904825"
          data-ad-slot={layout === 'sidebar' ? 'sidebar-unit' : layout === 'in-feed' ? 'in-feed-unit' : 'horizontal-unit'}
          data-ad-format={layout === 'sidebar' ? 'vertical' : 'horizontal'}
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}
