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
    const globalWindow = window as any;
    // 1. Check if AdBlock is active or AdSense is not loaded
    const isAdsenseBlocked = !globalWindow.adsbygoogle || typeof globalWindow.adsbygoogle.push !== 'function';
    if (isAdsenseBlocked) {
      setAdBlockedOrUnfilled(true);
      return;
    }

    // 2. Try loading the AdSense ad unit
    try {
      (globalWindow.adsbygoogle = globalWindow.adsbygoogle || []).push({});
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
    return null;
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
