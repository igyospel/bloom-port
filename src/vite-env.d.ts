/// <reference types="vite/client" />

// ── Google AdSense H5 Rewarded Ad (adBreak) types ──────────────────────────

interface AdBreakOptions {
  /** Ad type – use 'reward' for rewarded ads */
  type: 'reward' | 'preroll' | 'next' | 'browse' | 'pause' | 'start';
  /** Unique name for this ad placement (snake_case) */
  name?: string;
  /**
   * Called when an ad is available.
   * You MUST call showAdFn() to actually display the ad.
   */
  beforeReward?: (showAdFn: () => void) => void;
  /** Called when the user dismissed the ad before completing it (no reward). */
  adDismissed?: () => void;
  /** Called when the user watched the full ad (grant reward here). */
  adViewed?: () => void;
  /** Called after the ad finishes (whether rewarded or dismissed). */
  afterAd?: () => void;
  /**
   * Called when NO ad is available (fill rate < 100%).
   * Use this to hide your "Watch ad" button or fall back gracefully.
   */
  beforeAd?: () => void;
}

interface AdConfigOptions {
  preloadAdBreaks?: 'on' | 'auto';
  sound?: 'on' | 'off';
  onReady?: () => void;
}

interface Window {
  adsbygoogle: unknown[];
  adBreak: (options: AdBreakOptions) => void;
  adConfig: (options: AdConfigOptions) => void;
  /** Monetag SDK – injected by cdn.moonicorn.com/act/files/sdk.min.js */
  show: (zoneId: number, options?: { autoReload?: boolean }) => Promise<string>;
  /** Our wrapper to call Monetag from React */
  monetagShowAd: () => Promise<string>;
}
