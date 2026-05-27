import React, { useEffect, useRef, useState } from 'react';
import { 
  Search, 
  ArrowRight, 
  Terminal, 
  Activity, 
  ShieldCheck, 
  Cpu, 
  Layers, 
  HelpCircle, 
  FileText, 
  Mail, 
  Copy, 
  Check, 
  ExternalLink,
  ChevronRight,
  Database,
  Menu,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Logo } from '../components/Logo';
import { UnifiedProfileControl } from '../components/ui/unified-profile-control';
import { useAuth } from '../context/AuthContext';

interface ErrorPageProps {
  onNavigateHome?: () => void;
  onNavigateDashboard?: () => void;
  onNavigateDocs?: () => void;
  onNavigateApi?: () => void;
}

export default function ErrorPage({
  onNavigateHome = () => {},
  onNavigateDashboard = () => {},
  onNavigateDocs = () => {},
  onNavigateApi = () => {}
}: ErrorPageProps) {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [diagnosticCopied, setDiagnosticCopied] = useState(false);
  const [heartbeatData, setHeartbeatData] = useState<number[]>(Array(20).fill(15));
  const requestID = 'req_f73e2b9a8c4d20e1';

  // Copy Diagnostics
  const handleCopyDiagnostics = () => {
    navigator.clipboard.writeText(requestID);
    setDiagnosticCopied(true);
    setTimeout(() => setDiagnosticCopied(false), 2000);
  };

  // Heartbeat Graph Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeatData((prev) => {
        const next = [...prev.slice(1)];
        // Generate values between 5 and 25 to simulate clean heartbeats
        const isPulse = Math.random() > 0.8;
        const value = isPulse ? Math.random() * 20 + 5 : Math.random() * 5 + 13;
        next.push(value);
        return next;
      });
    }, 150);
    return () => clearInterval(interval);
  }, []);

  // Canvas particle "404" & neural network visualization
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      speed: number;

      constructor(x: number, y: number, isTarget = false) {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.targetX = x;
        this.targetY = y;
        this.vx = 0;
        this.vy = 0;
        this.size = isTarget ? Math.random() * 1.5 + 1.2 : Math.random() * 0.8 + 0.3;
        this.alpha = isTarget ? Math.random() * 0.8 + 0.2 : Math.random() * 0.4 + 0.1;
        this.speed = Math.random() * 0.05 + 0.02;
      }

      update() {
        // Move towards target (holographic 404 matrix)
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        this.x += dx * this.speed;
        this.y += dy * this.speed;

        // Subtle organic float
        this.x += Math.sin(Date.now() * 0.001 + this.targetY) * 0.08;
        this.y += Math.cos(Date.now() * 0.001 + this.targetX) * 0.08;
      }

      draw(c: CanvasRenderingContext2D) {
        c.fillStyle = `rgba(255, 255, 255, ${this.alpha})`;
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fill();
      }
    }

    const particles: Particle[] = [];

    // Define "404" target points using a dot grid helper
    const makeDotMatrixNum = (numStr: string, startX: number, startY: number, scale = 7) => {
      // 5x7 Font matrices
      const font: Record<string, number[][]> = {
        '4': [
          [1,0,0,0,1],
          [1,0,0,0,1],
          [1,0,0,0,1],
          [1,1,1,1,1],
          [0,0,0,0,1],
          [0,0,0,0,1],
          [0,0,0,0,1]
        ],
        '0': [
          [0,1,1,1,0],
          [1,0,0,0,1],
          [1,0,0,0,1],
          [1,0,0,0,1],
          [1,0,0,0,1],
          [1,0,0,0,1],
          [0,1,1,1,0]
        ]
      };

      const matrix = font[numStr];
      if (!matrix) return;

      for (let row = 0; row < matrix.length; row++) {
        for (let col = 0; col < matrix[row].length; col++) {
          if (matrix[row][col] === 1) {
            // Fill cluster of particles per dot for volumetric appearance
            for (let k = 0; k < 6; k++) {
              const px = startX + col * scale * 2.2 + (Math.random() - 0.5) * 4;
              const py = startY + row * scale * 2.4 + (Math.random() - 0.5) * 4;
              particles.push(new Particle(px, py, true));
            }
          }
        }
      }
    };

    // Initialize 404 matrix coordinates centrally
    const initParticles = () => {
      particles.length = 0;
      const midX = width / 2;
      const midY = height / 2.2;

      // Space out the digits
      makeDotMatrixNum('4', midX - 110, midY - 40, 8);
      makeDotMatrixNum('0', midX - 25, midY - 40, 8);
      makeDotMatrixNum('4', midX + 60, midY - 40, 8);

      // Add general ambient floating particles
      for (let i = 0; i < 70; i++) {
        particles.push(new Particle(Math.random() * width, Math.random() * height, false));
      }
    };

    initParticles();

    // Line connections for data streams / grid
    const drawNetworkLines = () => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 0.5;

      for (let i = 0; i < particles.length; i += 8) {
        for (let j = i + 1; j < i + 4; j++) {
          if (!particles[j]) continue;
          const dist = Math.hypot(particles[i].x - particles[j].x, particles[i].y - particles[j].y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // Animation Loop
    const tick = () => {
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Draw horizontal scanning lasers / lines
      const scanY = (Date.now() * 0.05) % height;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
      ctx.fillRect(0, scanY, width, 2);

      // Holographic floor base
      const centerX = width / 2;
      const centerY = height / 2.2 + 80;
      
      const ellipseGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
      ellipseGrad.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      ellipseGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.01)');
      ellipseGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.fillStyle = ellipseGrad;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 180, 25, 0, 0, Math.PI * 2);
      ctx.fill();

      // Holographic rim ring
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, 180, 25, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Pulse ring expander
      const expandRadius = 180 + (Math.sin(Date.now() * 0.003) * 30);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.04 - (expandRadius - 180) / 1000})`;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, expandRadius, expandRadius * 0.14, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Update & Draw particles
      particles.forEach((p) => {
        p.update();
        p.draw(ctx);
      });

      drawNetworkLines();

      animationFrameId = requestAnimationFrame(tick);
    };

    tick();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="bg-[#050505] text-white min-h-screen flex flex-col font-sans relative overflow-hidden select-none selection:bg-white/10 selection:text-white">
      {/* Background grid mesh */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* Top Navbar */}
      <header className="w-full z-50 flex items-center justify-between px-6 py-3.5 border-b border-white/[0.08] bg-black/40 backdrop-blur-md text-white shadow-sm shrink-0">
        <div className="flex items-center gap-3 cursor-pointer" onClick={onNavigateHome}>
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
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateHome(); }}>Home</a>
          <a className="text-white/50 hover:text-white transition-colors" href="#" onClick={(e) => { e.preventDefault(); onNavigateDashboard(); }}>Models</a>
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

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] md:hidden" onClick={() => setMobileMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="absolute top-0 left-0 h-full w-[280px] bg-[#0a0a0a] border-r border-white/10 p-5 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Logo className="h-5 w-auto" variant="dark" />
                <button onClick={() => setMobileMenuOpen(false)} className="text-white/50 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <nav className="flex flex-col space-y-4 font-medium text-sm">
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateHome(); setMobileMenuOpen(false); }}>Home</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateDashboard(); setMobileMenuOpen(false); }}>AI Chat</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateApi(); setMobileMenuOpen(false); }}>Developer API</a>
                <a href="#" className="text-white/60 hover:text-white" onClick={(e) => { e.preventDefault(); onNavigateDocs(); setMobileMenuOpen(false); }}>Documentation</a>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid Workspace */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-8 items-stretch relative z-10">
        
        {/* ================= LEFT SIDEBAR ================= */}
        <aside className="space-y-6 flex flex-col justify-start order-2 lg:order-1">
          {/* Card: System Status */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0A0A] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-white/35">System Status</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            
            <div className="space-y-1">
              <p className="text-xs font-semibold text-white/95 flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                All Systems Operational
              </p>
              <p className="text-[10px] text-white/40">MindStudio Edge Nodes: OK</p>
            </div>

            {/* Simulated mini heartbeat line chart */}
            <div className="h-10 w-full bg-white/[0.01] rounded-lg border border-white/[0.03] flex items-end px-2 py-1 gap-[3px]">
              {heartbeatData.map((val, idx) => (
                <div 
                  key={idx} 
                  className="bg-white/30 rounded-t-sm flex-1 transition-all duration-150"
                  style={{ height: `${val * 3}%`, opacity: 0.15 + (idx / 20) * 0.7 }}
                />
              ))}
            </div>

            <div className="flex justify-between items-center text-[10px] font-mono text-white/40 pt-1 border-t border-white/[0.04]">
              <span>Uptime</span>
              <span className="text-white/80 font-bold">99.99%</span>
            </div>
          </div>

          {/* Card: Quick Recovery */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0A0A] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/35 block">Quick Recovery</span>
            
            <nav className="space-y-2">
              {[
                { label: 'Go To Dashboard', action: onNavigateDashboard, icon: <Layers className="w-3.5 h-3.5" /> },
                { label: 'View Documentation', action: onNavigateDocs, icon: <FileText className="w-3.5 h-3.5" /> },
                { label: 'Check System Status', action: () => {}, icon: <Activity className="w-3.5 h-3.5" /> },
                { label: 'Browse API Reference', action: onNavigateDocs, icon: <Terminal className="w-3.5 h-3.5" /> },
                { label: 'Contact Support', action: () => {}, icon: <Mail className="w-3.5 h-3.5" /> },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={item.action}
                  className="w-full flex items-center justify-between p-2 rounded-lg border border-transparent hover:border-white/[0.06] hover:bg-white/[0.02] text-xs text-white/60 hover:text-white transition-all cursor-pointer text-left group"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-white/30 group-hover:text-white/70 transition-colors">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-white/20 group-hover:text-white/60 transform group-hover:translate-x-0.5 transition-all" />
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* ================= CENTER VISUALIZATION & MESSAGE ================= */}
        <section className="flex flex-col items-center justify-between text-center relative py-6 order-1 lg:order-2">
          {/* Holographic 404 Canvas rendering */}
          <div className="relative w-full h-[280px] shrink-0">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none rounded-2xl" />
          </div>

          {/* Main Error Message & Content */}
          <div className="space-y-6 max-w-lg mt-4">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold tracking-tight text-white">
                We couldn't find this page
              </h1>
              <p className="text-xs sm:text-sm text-white/55 leading-relaxed">
                The resource you're looking for may have been moved, deleted, or never existed. Our infrastructure attempted to locate the requested endpoint but no valid route was found.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search documentation, agents, APIs, or resources..."
                className="w-full bg-[#0A0A0A] border border-white/[0.08] hover:border-white/20 focus:border-white/30 rounded-xl pl-10 pr-14 py-3 text-xs text-white placeholder:text-white/25 focus:outline-none focus:bg-[#0d0d0d] transition-all shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
              />
              <kbd className="absolute right-3.5 top-1/2 -translate-y-1/2 hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.04] text-[9px] font-mono text-white/35">
                <span>⌘</span>K
              </kbd>
            </div>

            {/* Main Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <button
                onClick={onNavigateDashboard}
                className="w-full sm:w-auto px-6 py-2.5 bg-white text-black hover:bg-neutral-100 rounded-lg text-xs font-semibold tracking-wide hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer shadow-[0_8px_30px_rgba(255,255,255,0.1)]"
              >
                Go To Dashboard
              </button>
              <button
                onClick={onNavigateDocs}
                className="w-full sm:w-auto px-6 py-2.5 border border-white/10 hover:border-white/20 bg-transparent hover:bg-white/[0.03] text-xs font-semibold tracking-wide rounded-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                View Documentation
              </button>
            </div>
          </div>

          {/* Bottom Center Diagnostic Log */}
          <div className="mt-8 p-3 px-5 rounded-full border border-white/[0.06] bg-[#0A0A0A]/50 backdrop-blur-sm flex items-center gap-4 text-[10px] font-mono text-white/40 shadow-inner">
            <span className="flex items-center gap-1.5 text-[9px] text-white/25">
              <Database className="w-3.5 h-3.5" /> DIAGNOSTICS:
            </span>
            <span className="text-white/60">ID: {requestID}</span>
            <button 
              onClick={handleCopyDiagnostics}
              className="p-1 hover:text-white rounded hover:bg-white/5 transition-colors cursor-pointer"
              title="Copy diagnostic ID"
            >
              {diagnosticCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        </section>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="space-y-6 flex flex-col justify-start order-3 lg:order-3">
          {/* Card: Error Details */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0A0A] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <span className="text-[10px] uppercase font-mono tracking-widest text-white/35 block">Error Details</span>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-white/30">Error Code</span>
                <span className="text-white/90 font-bold">404</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-white/30">Status</span>
                <span className="text-white/80">Page Not Found</span>
              </div>
              <div className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                <span className="text-white/30">Region</span>
                <span className="text-white/80">Global Edge Network</span>
              </div>
              <div className="flex justify-between items-center py-1.5">
                <span className="text-white/30">Detection Time</span>
                <span className="inline-flex items-center gap-1 text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              </div>
            </div>
          </div>

          {/* Card: Need Assistance? */}
          <div className="p-5 rounded-2xl border border-white/[0.08] bg-[#0A0A0A] space-y-4 shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-mono tracking-widest text-white/35">Need Assistance?</span>
              <HelpCircle className="w-3.5 h-3.5 text-white/35" />
            </div>

            <p className="text-xs text-white/50 leading-relaxed">
              Our AI support infrastructure is available to help diagnose routing and deployment issues.
            </p>

            <button
              onClick={() => alert('Initiating diagnostic support request...')}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04] text-xs text-white/80 hover:text-white transition-all cursor-pointer"
            >
              <span>Contact Support</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </aside>

      </div>
    </div>
  );
}
