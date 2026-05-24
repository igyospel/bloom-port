import { cn } from "@/lib/utils"
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-semibold bg-white/[0.06] text-white px-1.5 py-0.5 rounded border border-white/5",
        className
      )}
    >
      {children}
    </span>
  );
};

const CARDS = [
  {
    id: 0,
    name: "Sarah Chen",
    designation: "Principal AI Engineer",
    content: (
      <p>
        <Highlight>Bloomport AI</Highlight> has completely scaled our inference speeds. The distributed orchestration manages index searches and high-throughput execution <Highlight>with under 12ms latency</Highlight>.
      </p>
    ),
  },
  {
    id: 1,
    name: "Alex Rodriguez",
    designation: "Infrastructure Director",
    content: (
      <p>
        The <Highlight>agent architecture</Highlight> behind Bloomport is extremely robust. Multi-agent state sync, memory retrieval, and automatic rate-limiting are fully handled <Highlight>out of the box</Highlight>.
      </p>
    ),
  },
  {
    id: 2,
    name: "David Kim",
    designation: "VP of Product",
    content: (
      <p>
        After adopting <Highlight>Bloomport AI</Highlight>, our team launched autonomous workflows 40% faster. The developer experience and <Highlight>clear API integrations</Highlight> are state-of-the-art.
      </p>
    ),
  },
];

export default function RuixenSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16 sm:py-24 text-white bg-black">
      {/* Top 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
        
        {/* Left Block - Feature Showcase Card */}
        <div className="flex flex-col items-start justify-between border border-white/10 p-6 sm:p-8 rounded-3xl bg-white/[0.01] hover:border-white/15 transition-all duration-300 relative overflow-hidden group">
          {/* Subtle Spotlight Background Illumination */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />
          
          {/* Floating CardStack Illustration */}
          <div className="relative w-full mb-8 flex justify-center">
            {/* Ambient background wireframe effect */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-2 inset-x-0 h-16 bg-gradient-to-t from-black via-transparent to-transparent z-10 pointer-events-none" />
            <CardStack items={CARDS} />
          </div>

          {/* Content */}
          <div className="w-full text-left mt-auto z-10">
            <h3 className="text-xl sm:text-2xl font-light text-white/90 leading-tight tracking-tight">
              Intelligent Agent Deployment <span className="font-semibold text-white">Bloomport AI</span>
            </h3>
            <p className="text-white/40 text-xs sm:text-sm mt-2 leading-relaxed font-sans">
              Scale and orchestrate autonomous agent networks across distributed supercomputing clusters with real-time vector search and high-performance infrastructure.
            </p>
          </div>
        </div>

        {/* Right Block - Integration Showcase Card */}
        <div className="flex flex-col items-start justify-between border border-white/10 p-6 sm:p-8 rounded-3xl bg-white/[0.01] hover:border-white/15 transition-all duration-300 relative overflow-hidden group">
          {/* Subtle Spotlight Background Illumination */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.03),transparent_60%)] pointer-events-none" />

          {/* Content */}
          <div className="mb-8 w-full text-left">
            <h3 className="text-xl sm:text-2xl font-light text-white/90 leading-tight tracking-tight">
              Seamless Integration Ecosystem <span className="font-semibold text-white">Bloomport AI</span>
            </h3>
            <p className="text-white/40 text-xs sm:text-sm mt-2 leading-relaxed font-sans">
              Integrate effortlessly with your favorite tools using Bloomport's smart API-ready architecture and eliminate compute silos in seconds.
            </p>
          </div>

          {/* Integration List Container */}
          <div className="relative w-full mt-auto p-5 bg-black border border-white/10 rounded-2xl group/list hover:border-white/15 transition-all duration-500 z-10">
            {/* Bright corner glow highlight at bottom-right of the container */}
            <div className="absolute bottom-[-1px] right-[-1px] w-24 h-24 bg-[radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-8 h-px bg-white/40 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-px h-8 bg-white/40 pointer-events-none" />

            <div className="space-y-4">
              {/* Figma Item */}
              <div className="flex items-center justify-between py-1 group/item cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover/item:border-white/20 transition-colors">
                    {/* Figma Outline Wireframe Logo */}
                    <svg className="w-5 h-5 text-white/80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M12 5.5a2.5 2.5 0 1 1-2.5-2.5H12M12 5.5a2.5 2.5 0 1 1 2.5-2.5h-2.5M12 5.5V11M12 11a2.5 2.5 0 1 1-2.5-2.5H12M12 11a2.5 2.5 0 1 1 2.5-2.5h-2.5M12 11V16.5M12 16.5a2.5 2.5 0 1 1-2.5-2.5H12M12 16.5a2.5 2.5 0 1 1 2.5-2.5h-2.5" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium text-white group-hover/item:text-white transition-colors">Figma</p>
                    <p className="text-xs text-white/40 truncate mt-0.5 font-sans">Design workflows collaboratively in real-time with UI tools</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer flex-shrink-0 ml-3">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>

              {/* Divider */}
              <div className="h-px bg-white/[0.06] w-full" />

              {/* Vercel Item */}
              <div className="flex items-center justify-between py-1 group/item cursor-pointer">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center flex-shrink-0 group-hover/item:border-white/20 transition-colors">
                    {/* Vercel Wireframe Triangle Logo */}
                    <svg className="w-4.5 h-4.5 text-white/80" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 22.525H0L12 1.475L24 22.525Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-medium text-white group-hover/item:text-white transition-colors">Vercel</p>
                    <p className="text-xs text-white/40 truncate mt-0.5 font-sans">Deploy autonomous frontend agents seamlessly with global scale</p>
                  </div>
                </div>
                <button className="w-8 h-8 rounded-full border border-white/10 hover:border-white/30 hover:bg-white/[0.08] flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer flex-shrink-0 ml-3">
                  <svg className="w-3.5 h-3.5 fill-none stroke-current" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Stats and Testimonial Bottom Row */}
      <div className="mt-16 sm:mt-24 grid gap-10 lg:grid-cols-2 lg:gap-16 border-t border-white/10 pt-16 relative">
        
        {/* Statistics Columns */}
        <div className="flex justify-center items-center p-2 z-10">
          <div className="grid grid-cols-3 gap-6 sm:gap-10 w-full text-center sm:text-left">
            
            {/* Stat 1 */}
            <div className="space-y-2 group relative">
              {/* Rocket glowing icon */}
              <svg className="w-5 h-5 text-white/80 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] mx-auto sm:mx-0 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
                <path d="m3.5 11.5 10-10a4.67 4.67 0 0 1 6 6l-10 10"/>
                <path d="M16 16h-3l-3-3v-3"/>
                <circle cx="17.5" cy="6.5" r="1.5"/>
              </svg>
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">+1200</div>
              <p className="text-xs sm:text-sm text-white/40 font-light font-sans uppercase tracking-wider">Stars on GitHub</p>
              {/* Spotlight underline */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto sm:mx-0 mt-3 blur-[0.5px]" />
            </div>

            {/* Stat 2 */}
            <div className="space-y-2 group relative">
              {/* Users glowing icon */}
              <svg className="w-5 h-5 text-white/80 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] mx-auto sm:mx-0 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">22M</div>
              <p className="text-xs sm:text-sm text-white/40 font-light font-sans uppercase tracking-wider">Active Users</p>
              {/* Spotlight underline */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto sm:mx-0 mt-3 blur-[0.5px]" />
            </div>

            {/* Stat 3 */}
            <div className="space-y-2 group relative">
              {/* Cube glowing icon */}
              <svg className="w-5 h-5 text-white/80 filter drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] mx-auto sm:mx-0 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
              <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">+500</div>
              <p className="text-xs sm:text-sm text-white/40 font-light font-sans uppercase tracking-wider">Powered Apps</p>
              {/* Spotlight underline */}
              <div className="w-12 h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent mx-auto sm:mx-0 mt-3 blur-[0.5px]" />
            </div>

          </div>
        </div>

        {/* Testimonial Quote */}
        <div className="relative p-2 flex flex-col justify-center min-h-[140px] z-10">
          {/* Subtle concentric spotlight glow underneath quote */}
          <div className="absolute -bottom-8 left-10 w-48 h-48 bg-[radial-gradient(circle,rgba(255,255,255,0.03),transparent_70%)] pointer-events-none select-none z-0" />
          
          {/* Wave SVG illustration backdrop */}
          <div className="absolute inset-0 w-full h-full opacity-10 pointer-events-none select-none z-0 overflow-hidden">
            <svg className="w-full h-full text-white" viewBox="0 0 400 150" fill="none" stroke="currentColor" strokeWidth="0.5">
              <path d="M0 60 C 100 95, 180 15, 240 70 C 300 115, 340 30, 400 80" />
              <path d="M0 65 C 110 100, 190 20, 250 75 C 310 120, 350 35, 400 85" />
              <path d="M0 70 C 120 105, 200 25, 260 80 C 320 125, 360 40, 400 90" />
            </svg>
          </div>

          <blockquote className="border-l border-white/20 pl-6 text-white/60 text-left font-sans z-10 relative">
            <p className="text-sm sm:text-base leading-relaxed italic">
              &ldquo;Using Bloomport AI has been like unlocking a new level of productivity. It's the perfect fusion of simplicity and versatility, enabling us to orchestrate neural computational graphs and distributed agents seamlessly.&rdquo;
            </p>
            <div className="mt-5 flex items-center gap-3">
              <div>
                <cite className="block font-medium text-xs sm:text-sm text-white not-italic font-sans">Saurabh</cite>
                <cite className="block text-[10px] text-white/40 not-italic font-sans">CEO, Neural-Space</cite>
              </div>
            </div>
          </blockquote>
        </div>

      </div>
    </section>
  )
}

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.05;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);
  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards];
        newArray.unshift(newArray.pop()!);
        return newArray;
      });
    }, 6000);
  };

  return (
    <div className="relative mx-auto h-40 w-full md:h-40 md:w-96 my-4 z-10">
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-zinc-950/90 h-40 w-full md:h-40 md:w-96 rounded-2xl p-5 shadow-2xl border border-white/10 flex flex-col justify-between backdrop-blur-md"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: cards.length - index,
            }}
          >
            <div className="font-normal text-white/80 text-xs sm:text-sm leading-relaxed text-left">
              {card.content}
            </div>
            <div className="text-left flex justify-between items-baseline">
              <div>
                <p className="text-white font-semibold text-xs font-sans">
                  {card.name}
                </p>
                <p className="text-white/30 font-normal text-[10px] mt-0.5 font-sans">
                  {card.designation}
                </p>
              </div>
              <span className="material-symbols-outlined text-white/10 text-base">format_quote</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
