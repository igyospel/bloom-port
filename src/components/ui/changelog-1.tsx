import { ArrowUpRight, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export type ChangelogEntry = {
  version: string;
  date: string;
  title: string;
  description: string;
  items?: string[];
  image?: string;
  button?: {
    url: string;
    text: string;
  };
};

export interface Changelog1Props {
  title?: string;
  description?: string;
  entries?: ChangelogEntry[];
  className?: string;
}

// ── Auth Infrastructure Visualisation ─────────────────────────────────────────
const AuthInfraVisual = () => {
  return (
    <div className="relative w-full h-64 md:h-80 bg-zinc-950/80 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:14px_14px]" />
      
      {/* Radial Highlight */}
      <div className="absolute w-44 h-44 rounded-full bg-white/[0.01] blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* SVG Graphics */}
      <svg className="w-full h-full text-white/40" viewBox="0 0 300 240" fill="none" stroke="currentColor" strokeWidth="1">
        {/* Connection nodes pathways */}
        <path d="M150 190 L150 70" strokeDasharray="3,3" stroke="rgba(255,255,255,0.12)" />
        <path d="M80 150 L150 115" stroke="rgba(255,255,255,0.08)" />
        <path d="M220 150 L150 115" stroke="rgba(255,255,255,0.08)" />
        
        {/* Substrate Isometric Grid bottom */}
        <g className="opacity-30">
          <polygon points="150,165 230,130 150,95 70,130" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
          <line x1="110" y1="112.5" x2="190" y2="147.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="130" y1="121.5" x2="210" y2="156.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="90" y1="139" x2="170" y2="104" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
          <line x1="110" y1="147.5" x2="190" y2="112.5" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        </g>
        
        {/* Middle grid layer */}
        <g className="opacity-50">
          <polygon points="150,135 210,110 150,85 90,110" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
        </g>

        {/* Secure Authorization Lock Node */}
        <g transform="translate(150, 110)">
          <circle r="14" fill="#000" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          <circle r="14" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.75" className="animate-ping" style={{ animationDuration: '3s' }} />
          {/* Lock icon */}
          <path d="M-3.5 1 L-3.5 5 L3.5 5 L3.5 1 Z M-1.5 1 L-1.5 -1.5 C-1.5 -2.5 1.5 -2.5 1.5 -1.5 L1.5 1" stroke="rgba(255,255,255,0.8)" strokeWidth="1" fill="none" />
        </g>

        {/* Top Floating Glass identity panels */}
        {/* Left ID Profile Card */}
        <g transform="translate(40, 52)">
          <rect width="65" height="42" rx="4" fill="rgba(10,10,10,0.8)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.75" className="backdrop-blur-sm" />
          <circle cx="14" cy="16" r="6" stroke="rgba(255,255,255,0.25)" fill="none" />
          <path d="M9 25 C9 21, 19 21, 19 25" stroke="rgba(255,255,255,0.25)" fill="none" />
          <line x1="28" y1="12" x2="52" y2="12" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
          <line x1="28" y1="18" x2="48" y2="18" stroke="rgba(255,255,255,0.2)" strokeWidth="0.75" />
          <line x1="28" y1="24" x2="42" y2="24" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
        </g>

        {/* Right ID Profile Card with Premium badge */}
        <g transform="translate(185, 42)">
          <rect width="75" height="48" rx="4" fill="rgba(10,10,10,0.85)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" className="backdrop-blur-sm" />
          <circle cx="16" cy="18" r="8" stroke="rgba(255,255,255,0.35)" fill="none" />
          <path d="M10 29 C10 24, 22 24, 22 29" stroke="rgba(255,255,255,0.35)" fill="none" />
          <line x1="32" y1="14" x2="60" y2="14" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="32" y1="20" x2="56" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
          <line x1="32" y1="26" x2="46" y2="26" stroke="rgba(255,255,255,0.15)" strokeWidth="0.75" />
          {/* Tiny Premium Star Badge */}
          <path d="M64 34 L65.5 31 L67 34 L70 34 L67.5 35.5 L68.5 38.5 L65.5 37 L62.5 38.5 L63.5 35.5 L61 34 Z" fill="rgba(255,255,255,0.65)" />
        </g>

        {/* Glowing node pulses */}
        <circle cx="80" cy="150" r="2.5" fill="#fff" stroke="rgba(255,255,255,0.4)" />
        <circle cx="220" cy="150" r="2.5" fill="#fff" stroke="rgba(255,255,255,0.4)" />

        {/* Data Stream animated flow indicators */}
        <circle cx="150" cy="150" r="1.5" fill="rgba(255,255,255,0.6)">
          <animateMotion dur="3.5s" repeatCount="indefinite" path="M0,0 L0,-50 L25,-65" />
        </circle>
        <circle cx="150" cy="150" r="1.5" fill="rgba(255,255,255,0.6)">
          <animateMotion dur="4.2s" repeatCount="indefinite" path="M-70,0 L0,-30 L-100,-85" />
        </circle>
      </svg>
    </div>
  )
}

// ── Ad-Supported Credits Visualisation ────────────────────────────────────────
const CreditsInfraVisual = () => {
  return (
    <div className="relative w-full h-64 md:h-80 bg-zinc-950/80 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:14px_14px]" />
      
      {/* Glow Center */}
      <div className="absolute w-44 h-44 rounded-full bg-white/[0.01] blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* SVG Graphics */}
      <svg className="w-full h-full text-white/40" viewBox="0 0 300 240" fill="none" stroke="currentColor" strokeWidth="1">
        {/* Interconnected network pathways */}
        <line x1="150" y1="120" x2="60" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
        <line x1="150" y1="120" x2="240" y2="80" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
        <line x1="150" y1="120" x2="60" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />
        <line x1="150" y1="120" x2="240" y2="160" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" />

        {/* Concentric point clouds */}
        <circle cx="150" cy="120" r="55" stroke="rgba(255,255,255,0.02)" strokeWidth="1" strokeDasharray="3,6" />
        <circle cx="150" cy="120" r="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="2,4" />

        {/* Central Floating AI Credit Coin Token */}
        <g transform="translate(150, 120)" className="cursor-pointer">
          <circle r="26" fill="rgba(10,10,10,0.9)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <circle r="22" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="4,2" />
          {/* Lightning bolt symbol in coin */}
          <polygon points="-3,-10 3,-2 -1,0 5,10 -1,2 1,0" fill="none" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse" />
        </g>

        {/* Network Node Stations */}
        {/* Node 1 (Video Player - top left) */}
        <g transform="translate(45, 64)">
          <rect width="30" height="30" rx="6" fill="rgba(15,15,15,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <polygon points="12,10 12,20 20,15" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1" strokeLinejoin="round" />
        </g>

        {/* Node 2 (Gift - bottom left) */}
        <g transform="translate(45, 144)">
          <rect width="30" height="30" rx="6" fill="rgba(15,15,15,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="9" y="13" width="12" height="10" rx="1" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
          <line x1="8" y1="13" x2="22" y2="13" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <path d="M12 13 C12 10.5, 15 10.5, 15 13" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
          <path d="M18 13 C18 10.5, 15 10.5, 15 13" stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" />
        </g>

        {/* Node 3 (Stats/Docs - top right) */}
        <g transform="translate(225, 64)">
          <rect width="30" height="30" rx="6" fill="rgba(15,15,15,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <rect x="10" y="9" width="10" height="12" rx="1" stroke="rgba(255,255,255,0.5)" strokeWidth="1" />
          <line x1="13" y1="13" x2="17" y2="13" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
          <line x1="13" y1="17" x2="16" y2="17" stroke="rgba(255,255,255,0.3)" strokeWidth="0.75" />
        </g>

        {/* Node 4 (AD label - bottom right) */}
        <g transform="translate(225, 144)">
          <rect width="30" height="30" rx="6" fill="rgba(15,15,15,0.85)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
          <text x="15" y="19" fill="rgba(255,255,255,0.5)" fontSize="8" fontWeight="bold" textAnchor="middle" fontFamily="sans-serif" letterSpacing="0.5">AD</text>
        </g>

        {/* Travelling network stream particles */}
        <circle cx="150" cy="120" r="2" fill="#fff">
          <animateMotion dur="2.2s" repeatCount="indefinite" path="M-90,-40 L0,0" />
        </circle>
        <circle cx="150" cy="120" r="2" fill="#fff">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M90,-40 L0,0" />
        </circle>
        <circle cx="150" cy="120" r="2" fill="#fff">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M-90,40 L0,0" />
        </circle>
        <circle cx="150" cy="120" r="2" fill="#fff">
          <animateMotion dur="2.5s" repeatCount="indefinite" path="M90,40 L0,0" />
        </circle>
      </svg>
    </div>
  )
}

// ── Platform Launch Visualisation ────────────────────────────────────────────
const LaunchInfraVisual = () => {
  return (
    <div className="relative w-full h-64 md:h-80 bg-zinc-950/80 border border-white/5 rounded-2xl overflow-hidden flex items-center justify-center transition-all duration-500">
      {/* Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:14px_14px]" />
      
      {/* Glow Center */}
      <div className="absolute w-44 h-44 rounded-full bg-white/[0.01] blur-3xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      {/* SVG Canvas */}
      <svg className="w-full h-full text-white/40" viewBox="0 0 300 240" fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="150" cy="120" r="45" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
        <circle cx="150" cy="120" r="75" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
        
        {/* Layered isometric neural grid sheets */}
        <g transform="translate(150, 120)">
          {/* Grid Layer 1 (bottom) */}
          <polygon points="0,35 45,12 0,-10 -45,12" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.75" />
          {/* Grid Layer 2 (middle) */}
          <polygon points="0,12 45,-10 0,-32 -45,-10" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="0.75" />
          {/* Grid Layer 3 (top) */}
          <polygon points="0,-10 45,-32 0,-55 -45,-32" fill="none" stroke="rgba(255,255,255,0.28)" strokeWidth="0.75" />

          {/* Central data connection core */}
          <line x1="0" y1="35" x2="0" y2="-55" stroke="#fff" strokeWidth="1" strokeDasharray="3,3" className="animate-pulse" />
          
          {/* Glowing node vertices */}
          <circle cx="45" cy="-32" r="2" fill="#fff" stroke="rgba(255,255,255,0.4)" />
          <circle cx="-45" cy="-32" r="2" fill="#fff" stroke="rgba(255,255,255,0.4)" />
          <circle cx="0" cy="-10" r="2.5" fill="#fff" stroke="rgba(255,255,255,0.4)" />
          
          {/* Circular processing graph boundary */}
          <circle cx="0" cy="-32" r="26" stroke="rgba(255,255,255,0.12)" strokeWidth="0.75" transform="rotate(-25)" strokeDasharray="4,2" />
        </g>
        
        {/* Computing particle packets floating upwards */}
        <circle cx="150" cy="145" r="1.5" fill="#fff">
          <animateMotion dur="2.8s" repeatCount="indefinite" path="M0,0 L0,-55 L12,-80" />
        </circle>
        <circle cx="150" cy="145" r="1.5" fill="#fff">
          <animateMotion dur="2.3s" repeatCount="indefinite" path="M18,-5 L18,-70 L0,-100" />
        </circle>
        <circle cx="150" cy="145" r="1.5" fill="#fff">
          <animateMotion dur="3.2s" repeatCount="indefinite" path="M-18,-5 L-18,-65 L-5,-90" />
        </circle>
      </svg>
    </div>
  )
}

export const defaultEntries: ChangelogEntry[] = [
  {
    version: "Version 1.2.0",
    date: "25 May 2026",
    title: "Email Authentication & Premium Upgrades",
    description:
      "We've replaced Web3 wallet requirements with traditional email sign-in / sign-up and custom profile customization. We also introduced a Premium tier preparation.",
    items: [
      "Traditional email login & signup flow",
      "Custom profile picture upload & persistence",
      "Sleek glassmorphic user dropdown panel",
      "Bloomport Premium membership previews",
    ],
    image: "auth",
    button: {
      url: "https://www.bloomport.fun",
      text: "Sign In Now",
    },
  },
  {
    version: "Version 1.1.0",
    date: "24 May 2026",
    title: "Ad-Supported Credits System",
    description:
      "Users can now watch 30-second rewarded ads to earn conversational AI credits instantly, supported by Monetag and Google AdSense.",
    items: [
      "Integrated Monetag Rewarded Interstitials",
      "Integrated Google AdSense H5 Rewarded API (adBreak)",
      "Vignette full-screen banner ads for passive monetization",
      "Ads.txt and verification service workers setup",
    ],
    image: "credits",
  },
  {
    version: "Version 1.0.0",
    date: "23 May 2026",
    title: "Bloomport Platform Launch",
    description:
      "Introducing Bloomport, the calm conversational mindfulness companion built to help you structure reflections and find focus.",
    items: [
      "AI inference workspace setup",
      "Responsive layout sidebars and context controls",
      "Mindful focused reflections architecture",
    ],
    image: "launch",
  },
];

export const Changelog1 = ({
  title = "Changelog",
  description = "Get the latest updates and improvements to our platform.",
  entries = defaultEntries,
}: Changelog1Props) => {
  return (
    <section className="py-24 bg-black text-white relative overflow-hidden">
      {/* Subtle Animated Particle background waves */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none z-0">
        <svg className="w-full h-full text-white" viewBox="0 0 1000 800" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M0 200 C 300 280, 500 80, 700 250 C 900 400, 950 180, 1000 300" />
          <path d="M0 250 C 250 320, 550 120, 750 280 C 850 380, 920 200, 1000 350" />
          <path d="M0 300 C 280 370, 480 150, 680 320 C 880 470, 930 220, 1000 400" strokeDasharray="3,6" />
        </svg>
      </div>

      <div className="container mx-auto px-6 sm:px-8 lg:px-12 relative z-10">
        {/* Section Header */}
        <div className="mx-auto max-w-4xl text-left border-b border-white/10 pb-8 flex items-baseline justify-between">
          <div>
            <h1 className="mb-3 text-3xl sm:text-4xl md:text-5xl font-light tracking-tight text-white font-sans">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-white/40 font-sans">
              {description}
            </p>
          </div>
          {/* Subtle logo/sparkle details */}
          <Sparkles className="w-6 h-6 text-white/35 animate-pulse hidden sm:block" />
        </div>

        {/* Changelog Entries Cards List */}
        <div className="mx-auto mt-12 sm:mt-16 max-w-4xl space-y-8 md:space-y-12">
          {entries.map((entry, index) => (
            <div
              key={index}
              className="group relative flex flex-col md:flex-row gap-8 p-6 sm:p-8 rounded-[32px] bg-white/[0.01] border border-white/10 backdrop-blur-md hover:border-white/20 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
            >
              {/* Subtle spotlight illumination sweep effect on card hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none" />

              {/* 40% Visual Area (Left) */}
              <div className="w-full md:w-[40%] shrink-0">
                {entry.image === "auth" || index === 0 ? (
                  <AuthInfraVisual />
                ) : entry.image === "credits" || index === 1 ? (
                  <CreditsInfraVisual />
                ) : (
                  <LaunchInfraVisual />
                )}
              </div>

              {/* 60% Content Area (Right) */}
              <div className="flex flex-col justify-between flex-1 min-w-0">
                <div className="space-y-4 text-left">
                  {/* Badges and date */}
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-semibold text-white/95 bg-white/[0.04] border border-white/10 px-2.5 py-1 rounded-full uppercase tracking-wider shadow-inner font-sans">
                      {entry.version}
                    </span>
                    <span className="text-xs font-medium text-white/30 font-sans">
                      {entry.date}
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg sm:text-xl md:text-2xl font-light text-white leading-snug tracking-tight font-sans">
                    {entry.title}
                  </h2>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-white/40 leading-relaxed font-sans">
                    {entry.description}
                  </p>

                  {/* Items list */}
                  {entry.items && entry.items.length > 0 && (
                    <ul className="mt-4 space-y-2 text-xs sm:text-sm text-white/50 pl-1 font-sans">
                      {entry.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2">
                          <span className="text-white/20 select-none mt-0.5">•</span>
                          <span className="flex-1">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                {/* Minimal Ghost Button action */}
                <div className="mt-6 flex justify-start">
                  {entry.button ? (
                    <button
                      onClick={(e) => {
                        if (entry.button?.text === "Sign In Now") {
                          e.preventDefault();
                          window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'signin' }));
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                      }}
                      className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.04] hover:bg-white text-white/90 hover:text-black border border-white/10 hover:border-white rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer shadow hover:shadow-[0_0_15px_rgba(255,255,255,0.15)] group"
                    >
                      <span>{entry.button.text}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  ) : (
                    <button className="flex items-center gap-1.5 px-4 py-2 bg-white/[0.02] hover:bg-white/[0.06] text-white/50 hover:text-white/95 border border-white/5 hover:border-white/15 rounded-xl text-xs font-semibold tracking-wide transition-all cursor-pointer group">
                      <span>Explore Update</span>
                      <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
