import { useState } from 'react';
import { Zap } from 'lucide-react';
import { useCredits } from '../context/CreditContext';
import RewardedAdModal from './RewardedAdModal';

interface CreditIndicatorProps {
  variant?: 'light' | 'dark';
}

export default function CreditIndicator({ variant = 'dark' }: CreditIndicatorProps) {
  const { credits } = useCredits();
  const [adOpen, setAdOpen] = useState(false);

  const isLight = variant === 'light';

  return (
    <>
      <button
        id="credit-indicator-btn"
        onClick={() => setAdOpen(true)}
        title="Watch an ad to earn +1,000 credits"
        className={[
          'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer border',
          isLight
            ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            : 'bg-white/[0.06] border-white/10 text-white hover:bg-white/[0.10]',
        ].join(' ')}
      >
        <Zap className="w-3 h-3 shrink-0" />
        <span>{credits.toLocaleString()}</span>
      </button>

      <RewardedAdModal isOpen={adOpen} onClose={() => setAdOpen(false)} />
    </>
  );
}
