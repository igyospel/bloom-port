import { useState, useCallback } from 'react';
import { useCredits } from '../context/CreditContext';
import { Sparkles, X, CheckCircle, AlertCircle, Wallet, Play, Loader2 } from 'lucide-react';

interface RewardedAdModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AdState =
  | 'idle'        // waiting for user to click "Watch Ad"
  | 'loading'     // calling ad network, waiting for response
  | 'showing'     // ad is being displayed (full-screen takeover)
  | 'rewarded'    // user watched the full ad → reward granted
  | 'dismissed'   // user closed ad early → no reward
  | 'unavailable' // no ad fill right now

export default function RewardedAdModal({ isOpen, onClose }: RewardedAdModalProps) {
  const { credits, addCredits } = useCredits();
  const [adState, setAdState] = useState<AdState>('idle');

  const handleWatchAd = useCallback(async () => {
    setAdState('loading');

    // ── PRIMARY: Monetag Rewarded Interstitial (forced 30s) ────────────────
    try {
      setAdState('showing');
      const result = await window.monetagShowAd();

      if (result === 'reward' || result === 'close' || result === 'success') {
        // Monetag returns 'reward' when user completed the view
        if (result === 'reward') {
          addCredits(1000);
          setAdState('rewarded');
        } else {
          // closed before reward
          setAdState('dismissed');
        }
        return;
      }

      // If unavailable / error → fall through to AdSense
    } catch (_) {
      // Monetag not loaded or threw → fall through to AdSense
    }

    // ── FALLBACK: Google AdSense adBreak ───────────────────────────────────
    window.adBreak({
      type: 'reward',
      name: 'bloomport_credit_reward',
      beforeAd: () => {
        // AdSense also has no fill
        setAdState('unavailable');
      },
      beforeReward: (showAdFn) => {
        setAdState('showing');
        showAdFn();
      },
      adViewed: () => {
        addCredits(1000);
        setAdState('rewarded');
      },
      adDismissed: () => {
        setAdState('dismissed');
      },
      afterAd: () => {
        setAdState((prev) => (prev === 'loading' ? 'unavailable' : prev));
      },
    });
  }, [addCredits]);

  const handleClose = useCallback(() => {
    setAdState('idle');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
        onClick={
          adState === 'idle' || adState === 'rewarded' || adState === 'dismissed' || adState === 'unavailable'
            ? handleClose
            : undefined
        }
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm bg-[#0f0f0f] border border-white/10 rounded-2xl overflow-hidden shadow-2xl text-white">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-white/60" />
            <span className="text-xs font-semibold tracking-[0.12em] uppercase text-white/60">
              Earn Credits
            </span>
          </div>
          {(adState === 'idle' || adState === 'rewarded' || adState === 'dismissed' || adState === 'unavailable') && (
            <button
              onClick={handleClose}
              className="p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Body */}
        <div className="px-6 py-8 space-y-6">

          {/* ── IDLE ── */}
          {adState === 'idle' && (
            <>
              <div className="text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-white/[0.06] border border-white/10 flex items-center justify-center mx-auto">
                  <Play className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-lg font-semibold tracking-tight">Watch an ad, earn credits</h2>
                <p className="text-sm text-white/50 leading-relaxed">
                  Watch a 30-second sponsored video and receive{' '}
                  <span className="text-white font-medium">+1,000 credits</span> instantly.
                </p>
              </div>

              {/* Current balance */}
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10">
                <span className="text-xs text-white/40 font-medium uppercase tracking-wide">Current balance</span>
                <div className="flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-white/60" />
                  <span className="text-sm font-semibold">{credits.toLocaleString()}</span>
                </div>
              </div>

              <button
                id="watch-ad-btn"
                onClick={handleWatchAd}
                className="w-full py-3.5 rounded-full bg-white text-black text-sm font-bold tracking-wide uppercase hover:bg-neutral-200 transition-colors cursor-pointer shadow-lg"
              >
                Watch 30s Ad (+1,000 Credits)
              </button>
              <p className="text-center text-[10px] text-white/25 leading-relaxed">
                Ads are served by Monetag & Google AdSense. No limit on daily views.
              </p>
            </>
          )}

          {/* ── LOADING / SHOWING ── */}
          {(adState === 'loading' || adState === 'showing') && (
            <div className="flex flex-col items-center py-6 space-y-4 text-center">
              <Loader2 className="w-10 h-10 text-white/40 animate-spin" />
              <p className="text-sm text-white/50">
                {adState === 'loading' ? 'Loading your ad…' : 'Ad is playing…'}
              </p>
              <p className="text-xs text-white/25">Please watch the full ad to earn your reward.</p>
            </div>
          )}

          {/* ── REWARDED ── */}
          {adState === 'rewarded' && (
            <div className="flex flex-col items-center py-4 space-y-5 text-center">
              <CheckCircle className="w-14 h-14 text-white animate-bounce" />
              <div>
                <h3 className="text-base font-semibold">+1,000 Credits Earned!</h3>
                <p className="text-sm text-white/50 mt-1">
                  New balance:{' '}
                  <span className="text-white font-semibold">{credits.toLocaleString()}</span>
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-full bg-white text-black text-sm font-bold tracking-wide uppercase hover:bg-neutral-200 transition-colors cursor-pointer"
              >
                Awesome, thanks!
              </button>
              <button
                onClick={() => setAdState('idle')}
                className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer"
              >
                Watch another ad
              </button>
            </div>
          )}

          {/* ── DISMISSED ── */}
          {adState === 'dismissed' && (
            <div className="flex flex-col items-center py-4 space-y-5 text-center">
              <AlertCircle className="w-14 h-14 text-white/40" />
              <div>
                <h3 className="text-base font-semibold text-white/80">No reward this time</h3>
                <p className="text-sm text-white/40 mt-1 leading-relaxed">
                  You need to watch the full 30s ad to earn credits.
                </p>
              </div>
              <button
                onClick={() => setAdState('idle')}
                className="w-full py-3 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold tracking-wide uppercase hover:bg-white/15 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button onClick={handleClose} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          )}

          {/* ── UNAVAILABLE ── */}
          {adState === 'unavailable' && (
            <div className="flex flex-col items-center py-4 space-y-5 text-center">
              <AlertCircle className="w-14 h-14 text-white/40" />
              <div>
                <h3 className="text-base font-semibold text-white/80">No ad available right now</h3>
                <p className="text-sm text-white/40 mt-1 leading-relaxed">
                  Ad inventory is full. Try again in a few minutes.
                </p>
              </div>
              <button
                onClick={() => setAdState('idle')}
                className="w-full py-3 rounded-full bg-white/10 border border-white/10 text-white text-sm font-semibold tracking-wide uppercase hover:bg-white/15 transition-colors cursor-pointer"
              >
                Try Again
              </button>
              <button onClick={handleClose} className="text-xs text-white/30 hover:text-white/60 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
