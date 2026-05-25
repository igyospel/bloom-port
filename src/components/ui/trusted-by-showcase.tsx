import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

// ── CUSTOM CANVAS-BASED 3D WAVE MESH & PARTICLE FIELD ──────────────────────────
export const TrustedByCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseXRef = useRef(0);
  const mouseYRef = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseXRef.current = (e.clientX / window.innerWidth) - 0.5;
      mouseYRef.current = (e.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resize();
    window.addEventListener('resize', resize);

    const numLines = 10;
    const numPoints = 65;
    const fov = 350;

    // Define random floating background particles (floating stars/dots)
    const backgroundStars: { x: number; y: number; size: number; speedY: number; opacity: number }[] = [];
    for (let i = 0; i < 45; i++) {
      backgroundStars.push({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 0.9 + 0.3,
        speedY: -0.0003 - Math.random() * 0.0004,
        opacity: Math.random() * 0.4 + 0.1,
      });
    }

    const draw = () => {
      time += 0.012;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      ctx.clearRect(0, 0, w, h);

      const targetMouseX = mouseXRef.current * 40;
      const targetMouseY = mouseYRef.current * 40;

      // 1. Draw floating background stars
      for (const star of backgroundStars) {
        star.y += star.speedY;
        if (star.y < 0) star.y = 1;
        const starX = star.x * w;
        const starY = star.y * h;
        const px = starX + targetMouseX * 0.15;
        const py = starY + targetMouseY * 0.15;

        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity * (0.3 + 0.7 * Math.sin(time + star.x * 12))})`;
        ctx.beginPath();
        ctx.arc(px, py, star.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Draw Left Wave Mesh
      for (let l = 0; l < numLines; l++) {
        ctx.beginPath();
        const z = (l - numLines / 2) * 16;
        const scale = fov / (fov + z);

        for (let i = 0; i < numPoints; i++) {
          const t = i / (numPoints - 1);
          const baseX = t * w * 0.33;
          const amp = Math.max(0, 1 - t) * 42;
          const angle = t * Math.PI * 2.4 - time * 0.5 + l * 0.3;
          const baseY = h * 0.65 + Math.sin(angle) * amp + (z * 0.35);

          const px = (baseX + targetMouseX * (z / 60)) * scale;
          const py = (baseY + targetMouseY * (z / 60)) * scale;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.09 * (1 - l / numLines) * scale})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Draw point cloud dots
        for (let i = 0; i < numPoints; i += 3) {
          const t = i / (numPoints - 1);
          const baseX = t * w * 0.33;
          const amp = Math.max(0, 1 - t) * 42;
          const angle = t * Math.PI * 2.4 - time * 0.5 + l * 0.3;
          const baseY = h * 0.65 + Math.sin(angle) * amp + (z * 0.35);
          const px = (baseX + targetMouseX * (z / 60)) * scale;
          const py = (baseY + targetMouseY * (z / 60)) * scale;

          ctx.fillStyle = `rgba(255, 255, 255, ${0.28 * (1 - t) * scale})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 3. Draw Right Wave Mesh
      for (let l = 0; l < numLines; l++) {
        ctx.beginPath();
        const z = (l - numLines / 2) * 16;
        const scale = fov / (fov + z);

        for (let i = 0; i < numPoints; i++) {
          const t = i / (numPoints - 1);
          const baseX = w * 0.67 + t * w * 0.33;
          const amp = t * 42;
          const angle = (1 - t) * Math.PI * 2.4 - time * 0.5 + l * 0.3;
          const baseY = h * 0.65 + Math.sin(angle) * amp + (z * 0.35);

          const px = (baseX + targetMouseX * (z / 60)) * scale;
          const py = (baseY + targetMouseY * (z / 60)) * scale;

          if (i === 0) {
            ctx.moveTo(px, py);
          } else {
            ctx.lineTo(px, py);
          }
        }
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.09 * (1 - l / numLines) * scale})`;
        ctx.lineWidth = 0.5 * scale;
        ctx.stroke();

        // Draw point cloud dots
        for (let i = 0; i < numPoints; i += 3) {
          const t = i / (numPoints - 1);
          const baseX = w * 0.67 + t * w * 0.33;
          const amp = t * 42;
          const angle = (1 - t) * Math.PI * 2.4 - time * 0.5 + l * 0.3;
          const baseY = h * 0.65 + Math.sin(angle) * amp + (z * 0.35);
          const px = (baseX + targetMouseX * (z / 60)) * scale;
          const py = (baseY + targetMouseY * (z / 60)) * scale;

          ctx.fillStyle = `rgba(255, 255, 255, ${0.28 * t * scale})`;
          ctx.beginPath();
          ctx.arc(px, py, 1.2 * scale, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-55"
    />
  );
};

// ── HIGH-FIDELITY INLINE MONOCHROME SVG LOGOS ──────────────────────────────────

const OpenAiLogo = () => (
  <svg className="h-[15px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 85 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 10) scale(0.68)">
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(0)"/>
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(60)"/>
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(120)"/>
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(180)"/>
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(240)"/>
      <path d="M0,0 C1,-3 4,-3 4,-1 C4,1 1,2 0,0" fill="currentColor" transform="rotate(300)"/>
    </g>
    <text x="22" y="14.5" fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="0.04em" fontFamily="system-ui, sans-serif">OpenAI</text>
  </svg>
);

const ClaudeLogo = () => (
  <svg className="h-[15px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 85 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(10, 10) scale(0.72)">
      <path d="M0 -12 L2 -4 L9 -9 L5 -1 L12 0 L5 1 L9 9 L2 4 L0 12 L-2 4 L-9 9 L-5 1 L-12 0 L-5 -1 L-9 -9 L-2 -4 Z" fill="currentColor" />
    </g>
    <text x="24" y="14.5" fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="0.04em" fontFamily="system-ui, sans-serif">Claude</text>
  </svg>
);

const VercelLogo = () => (
  <svg className="h-[14px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 85 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 1L12 11H0L6 1Z" fill="currentColor" />
    <text x="18" y="12.5" fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="0.06em" fontFamily="system-ui, sans-serif">Vercel</text>
  </svg>
);

const GitHubLogo = () => (
  <svg className="h-[15px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M10 1C5.03 1 1 5.03 1 10C1 13.98 3.58 17.35 7.16 18.54C7.61 18.62 7.77 18.34 7.77 18.1C7.77 17.89 7.76 17.32 7.76 16.57C5.26 17.11 4.73 15.37 4.73 15.37C4.32 14.33 3.73 14.05 3.73 14.05C2.91 13.49 3.79 13.5 3.79 13.5C4.7 13.56 5.17 14.43 5.17 14.43C5.98 15.8 7.28 15.41 7.79 15.18C7.87 14.6 8.1 14.2 8.36 13.98C6.36 13.75 4.26 12.98 4.26 9.53C4.26 8.55 4.61 7.75 5.19 7.12C5.09 6.89 4.79 5.97 5.28 4.73C5.28 4.73 6.04 4.49 7.76 5.65C8.48 5.45 9.25 5.35 10 5.35C10.75 5.35 11.52 5.45 12.24 5.65C13.96 4.49 14.72 4.73 14.72 4.73C15.21 5.97 14.91 6.89 14.81 7.12C15.39 7.75 15.74 8.55 15.74 9.53C15.74 12.99 13.64 13.75 11.63 13.97C11.95 14.25 12.24 14.8 12.24 15.64C12.24 16.84 12.23 17.81 12.23 18.1C12.23 18.35 12.39 18.63 12.85 18.54C16.42 17.35 19 13.98 19 10C19 5.03 14.97 1 10 1Z" fill="currentColor" />
    <text x="24" y="14.5" fill="currentColor" fontSize="11.5" fontWeight="700" letterSpacing="0.02em" fontFamily="system-ui, sans-serif">GitHub</text>
  </svg>
);

const NvidiaLogo = () => (
  <svg className="h-[14px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 95 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M1 8C1 4.1 4.1 1 8 1C11.9 1 15 4.1 15 8C15 11.9 11.9 15 8 15C4.1 15 1 11.9 1 8ZM8 13C10.8 13 13 10.8 13 8C13 5.2 10.8 3 8 3C5.2 3 3 5.2 3 8C3 10.8 5.2 13 8 13Z" fill="currentColor" />
    <path d="M5 8C5 6.3 6.3 5 8 5C9.7 5 11 6.3 11 8H9C9 7.4 8.6 7 8 7C7.4 7 7 7.4 7 8C7 8.6 7.4 9 8 9H10C11.1 9 12 9.9 12 11C12 12.1 11.1 13 10 13C8.9 13 8 12.1 8 11H6C6 12.1 6.9 13 8 13H10C11.1 13 12 12.1 12 11H10C10 11.6 9.6 12 9 12C8.4 12 8 11.6 8 11C7.4 11 7 10.6 7 10H5V8Z" fill="currentColor" />
    <text x="20" y="12.5" fill="currentColor" fontSize="11" fontWeight="800" letterSpacing="0.08em" fontFamily="system-ui, sans-serif">NVIDIA</text>
  </svg>
);

const StripeLogo = () => (
  <svg className="h-[14px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 69 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path fillRule="evenodd" clipRule="evenodd" d="M59 16.3338C59 12.9159 57.3122 10.219 54.0864 10.219C50.8469 10.219 48.8869 12.9159 48.8869 16.3071C48.8869 20.3258 51.2008 22.3551 54.5219 22.3551C56.1417 22.3551 57.3667 21.9947 58.2922 21.4873V18.8171C57.3667 19.271 56.305 19.5514 54.9575 19.5514C53.6372 19.5514 52.4667 19.0975 52.3169 17.522H58.9728C58.9728 17.3485 59 16.6542 59 16.3338ZM52.2761 15.0654C52.2761 13.5568 53.2153 12.9293 54.0728 12.9293C54.9031 12.9293 55.7878 13.5568 55.7878 15.0654H52.2761Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M43.633 10.219C42.2992 10.219 41.4417 10.8331 40.9653 11.2604L40.7883 10.4326H37.7939V26L41.1967 25.2924L41.2103 21.514C41.7003 21.8611 42.4217 22.3551 43.6194 22.3551C46.0558 22.3551 48.2744 20.4326 48.2744 16.2003C48.2608 12.3285 46.015 10.219 43.633 10.219ZM42.8164 19.4179C42.0133 19.4179 41.5369 19.1375 41.2103 18.7904L41.1967 13.8371C41.5505 13.45 42.0405 13.1829 42.8164 13.1829C44.055 13.1829 44.9125 14.5447 44.9125 16.2937C44.9125 18.0828 44.0686 19.4179 42.8164 19.4179Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M33.1117 9.43124L36.5281 8.71028V6L33.1117 6.70761V9.43124Z" fill="currentColor"/>
    <path d="M36.5281 10.4459H33.1117V22.1282H36.5281V10.4459Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M29.4503 11.4339L29.2325 10.4459H26.2925V22.1282H29.6953V14.211C30.4983 13.1829 31.8595 13.3698 32.2814 13.5167V10.4459C31.8458 10.2857 30.2533 9.99199 29.4503 11.4339Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M22.6447 7.5487L19.3236 8.24296L19.31 18.9372C19.31 20.9132 20.8208 22.3684 22.8353 22.3684C23.9514 22.3684 24.7681 22.1682 25.2172 21.9279V19.2176C24.7817 19.3911 22.6311 20.0053 22.6311 18.0293V13.2897H25.2172V10.4459H22.6311L22.6447 7.5487Z" fill="currentColor"/>
    <path fillRule="evenodd" clipRule="evenodd" d="M13.4436 13.8371C13.4436 13.3164 13.8792 13.1162 14.6006 13.1162C15.635 13.1162 16.9417 13.4233 17.9761 13.9706V10.8331C16.8464 10.3925 15.7303 10.219 14.6006 10.219C11.8375 10.219 10 11.6342 10 13.9974C10 17.6823 15.1722 17.0948 15.1722 18.6836C15.1722 19.2977 14.6278 19.498 13.8656 19.498C12.7358 19.498 11.2931 19.0441 10.1497 18.4299V21.6075C11.4156 22.1415 12.695 22.3685 13.8656 22.3685C16.6967 22.3685 18.6431 20.9933 18.6431 18.6035C18.6294 14.6249 13.4436 15.3325 13.4436 13.8371Z" fill="currentColor"/>
  </svg>
);

const ClerkLogo = () => (
  <svg className="h-[14px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 75 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 8C8 4.7 5.3 2 2 2H0V14H2C5.3 14 8 11.3 8 8Z" fill="currentColor" opacity="0.25" />
    <path d="M11.5 8C11.5 5.8 9.7 4 7.5 4C5.3 4 3.5 5.8 3.5 8C3.5 10.2 9.7 10.2 11.5 8Z" fill="currentColor" />
    <text x="17" y="12.5" fill="currentColor" fontSize="12" fontWeight="700" letterSpacing="0.03em" fontFamily="system-ui, sans-serif">clerk</text>
  </svg>
);

const TursoLogo = () => (
  <svg className="h-[15px] w-auto text-white/55 hover:text-white transition-colors duration-300" viewBox="0 0 90 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 3C7 1.5 5 0.5 4 1C3.5 1.2 4 2.8 5 4C6.5 5.5 9 6 10 6C10.5 6 9.5 4.5 8 3Z" fill="currentColor" />
    <path d="M16 3C17 1.5 19 0.5 20 1C20.5 1.2 20 2.8 19 4C17.5 5.5 15 6 14 6C13.5 6 14.5 4.5 16 3Z" fill="currentColor" />
    <path d="M12 18C11.5 18 9 14 9 11C9 8.8 10 7 12 7C14 7 15 8.8 15 11C15 14 12.5 18 12 18Z" fill="currentColor" />
    <text x="24" y="14.5" fill="currentColor" fontSize="12" fontWeight="900" letterSpacing="0.08em" fontFamily="system-ui, sans-serif">TURSO</text>
  </svg>
);

// ── MAIN SHOWCASE SECTION COMPONENT ──────────────────────────────────────────

export function TrustedByShowcase() {
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section className="py-24 md:py-32 bg-black text-white w-full flex flex-col items-center relative overflow-hidden select-none">
      {/* Premium Thin Divider Above the Section with a central glowing beam */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent z-10">
        <div className="absolute left-1/2 top-0 -translate-x-1/2 w-48 h-[2px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.7),transparent_70%)] blur-[1px]" />
      </div>

      {/* Radial Spotlight behind heading */}
      <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.035),transparent_65%)] pointer-events-none z-0" />
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.015),transparent_70%)] pointer-events-none z-0" />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-0 mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* Canvas Particle Wave Background */}
      <TrustedByCanvas />

      {/* Core Content Container */}
      <div className="relative mx-auto max-w-5xl px-6 w-full flex flex-col items-center z-10">
        
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-[10px] sm:text-[11px] font-bold tracking-[0.28em] text-white/40 uppercase mb-4 text-center font-sans block"
        >
          Trusted Worldwide
        </motion.span>

        {/* Main Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-[-0.035em] text-center leading-[1.1] mb-14 select-none max-w-[900px] font-sans"
        >
          <span className="text-white/50 block">Trusted by experts.</span>
          <span className="text-white block mt-1">Used by the leaders.</span>
        </motion.h2>

        {/* Premium Floating Container for Logos */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          // Slow floating effect
          animate={{ y: [0, -5, 0] }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 8,
              ease: "easeInOut"
            }
          }}
          className={cn(
            "w-full max-w-[980px] py-5 px-6 sm:px-10 rounded-[28px] flex items-center justify-center relative overflow-hidden",
            "bg-white/[0.015] border border-white/[0.06] backdrop-blur-[20px]",
            "shadow-[0_0_50px_rgba(255,255,255,0.02)]",
            "hover:border-white/[0.14] hover:shadow-[0_0_80px_rgba(255,255,255,0.05)]",
            "transition-all duration-500 ease-out group"
          )}
        >
          {/* Subtle light beam behind the logos */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.025] to-transparent pointer-events-none translate-y-[-20%] group-hover:via-white/[0.04] transition-all duration-500" />
          
          <div className="flex flex-wrap items-center justify-center gap-y-4 gap-x-2 sm:gap-x-0 w-full">
            
            <motion.div variants={itemVariants} className="flex items-center">
              <TursoLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <VercelLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <GitHubLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <ClaudeLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden md:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />
            <div className="md:hidden w-full h-0 block sm:hidden" /> {/* force wrap on tiny screens */}

            <motion.div variants={itemVariants} className="flex items-center">
              <ClerkLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <NvidiaLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <OpenAiLogo />
            </motion.div>

            <motion.div variants={itemVariants} className="hidden sm:block h-5 w-px bg-white/[0.08] mx-5 md:mx-6" />

            <motion.div variants={itemVariants} className="flex items-center">
              <StripeLogo />
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}
