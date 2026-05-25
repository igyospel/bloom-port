import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Logo } from '../Logo';

// ── Google Icon ──────────────────────────────────────────────────────────────
const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 48 48">
    <path fill="currentColor" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
  </svg>
);

// ── Types ────────────────────────────────────────────────────────────────────
export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

interface SignInPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignIn?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignIn?: () => void;
  onResetPassword?: () => void;
  onCreateAccount?: () => void;
  onBack?: () => void;
}

// ── Abstract Computational Avatar (Monochrome/Minimal) ─────────────────────
const AbstractAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();
  return (
    <div className="h-7 w-7 rounded-full flex items-center justify-center bg-white/[0.04] border border-white/[0.12] text-[10px] font-mono tracking-tighter text-white/80 relative overflow-hidden shrink-0">
      <div className="absolute inset-0 opacity-[0.15] bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:4px_4px]" />
      <span className="relative z-10 font-bold leading-none">{initials}</span>
    </div>
  );
};

// ── Premium 3D Point-Cloud Particle Network Canvas ──────────────────────────
const IntelligenceCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener('resize', resize);

    const W = () => canvas.offsetWidth;
    const H = () => canvas.offsetHeight;

    // Projection constants
    const FOV = 220;

    // ── 3D Sphere Network Nodes ──
    const NODE_COUNT = 36;
    const nodes3D: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      // Golden spiral distribution on a sphere
      const theta = Math.acos(-1 + (2 * i) / NODE_COUNT);
      const phi = Math.sqrt(NODE_COUNT * Math.PI) * theta;
      const r = 0.58;
      nodes3D.push({
        x: r * Math.sin(theta) * Math.cos(phi),
        y: r * Math.sin(theta) * Math.sin(phi),
        z: r * Math.cos(theta),
      });
    }

    // Connect nodes that are close to each other
    const connections: { a: number; b: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes3D[i].x - nodes3D[j].x;
        const dy = nodes3D[i].y - nodes3D[j].y;
        const dz = nodes3D[i].z - nodes3D[j].z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 0.48) {
          connections.push({ a: i, b: j });
        }
      }
    }

    // Data packets traveling on connections
    const packets: { connIdx: number; progress: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) {
      packets.push({
        connIdx: Math.floor(Math.random() * connections.length),
        progress: Math.random(),
        speed: 0.006 + Math.random() * 0.008,
      });
    }

    // ── Background Star/Particle Field ──
    const FIELD_COUNT = 180;
    const field: { x: number; y: number; z: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < FIELD_COUNT; i++) {
      field.push({
        x: (Math.random() - 0.5) * 2.5,
        y: (Math.random() - 0.5) * 2.5,
        z: (Math.random() - 0.5) * 2.0,
        size: Math.random() * 0.8 + 0.3,
        opacity: Math.random() * 0.3 + 0.08,
      });
    }

    // ── 3D Grid Wave at Bottom ──
    const GRID_W = 14;
    const GRID_H = 14;
    const gridPoints: { x: number; y: number }[] = [];
    for (let r = 0; r < GRID_H; r++) {
      for (let c = 0; c < GRID_W; c++) {
        gridPoints.push({
          x: (c / (GRID_W - 1) - 0.5) * 2.2,
          y: (r / (GRID_H - 1) - 0.5) * 2.2,
        });
      }
    }

    const draw = () => {
      timeRef.current += 0.004;
      const t = timeRef.current;
      const w = W(), h = H();
      const cx = w / 2, cy = h / 2;

      ctx.clearRect(0, 0, w, h);

      // Background Base Fill
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // Soft breathing radial volumetric glow behind core
      const corePulse = 1 + Math.sin(t * 1.5) * 0.06;
      const radGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45 * corePulse);
      radGlow.addColorStop(0, 'rgba(255,255,255,0.025)');
      radGlow.addColorStop(0.5, 'rgba(255,255,255,0.008)');
      radGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGlow;
      ctx.fillRect(0, 0, w, h);

      // ── 3D Rotations ──
      // Slowly spin the network on both axes
      const rotY = t * 0.12;
      const rotX = Math.PI * 0.12 + Math.sin(t * 0.06) * 0.1;
      
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY), sinY = Math.sin(rotY);

      const rotate3D = (pt: { x: number; y: number; z: number }) => {
        // Rotate Y
        let x1 = pt.x * cosY - pt.z * sinY;
        let z1 = pt.z * cosY + pt.x * sinY;
        // Rotate X
        let y2 = pt.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + pt.y * sinX;
        return { x: x1, y: y2, z: z2 };
      };

      // ── 1. Draw Background Particle Field ──
      field.forEach((p) => {
        // Slowly drift particles closer on Z axis
        p.z -= 0.0012;
        if (p.z < -1.0) p.z = 1.0; // Wrap around

        const rot = rotate3D(p);
        const zDepth = rot.z + 1.2; // Shift to positive coordinates
        if (zDepth <= 0.1) return;

        const scale = FOV / (FOV + rot.z * 100);
        const px = cx + rot.x * scale * w * 0.55;
        const py = cy + rot.y * scale * h * 0.55;

        if (px >= 0 && px <= w && py >= 0 && py <= h) {
          const alpha = p.opacity * (1.2 - Math.abs(p.z)) * (zDepth / 2.2);
          ctx.beginPath();
          ctx.arc(px, py, p.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${Math.max(0, Math.min(1, alpha))})`;
          ctx.fill();
        }
      });

      // ── 2. Draw 3D Grid Wave (Computational Topology at Bottom) ──
      const projectedGrid: { px: number; py: number; alpha: number }[] = [];
      gridPoints.forEach((pt) => {
        // Calculate height (z) using sine/cosine wave simulations
        const dist = Math.sqrt(pt.x * pt.x + pt.y * pt.y);
        const waveZ = -0.3 + Math.sin(pt.x * 3.5 + t * 0.8) * Math.cos(pt.y * 3.5 + t * 0.6) * 0.08 * Math.exp(-dist * 0.3);

        const rotated = rotate3D({ x: pt.x, y: 0.55 + waveZ, z: pt.y });
        const scale = FOV / (FOV + rotated.z * 90);
        const px = cx + rotated.x * scale * w * 0.55;
        const py = cy + rotated.y * scale * h * 0.55;
        const alpha = (1 - Math.min(1, dist / 1.5)) * 0.14 * (scale > 0.8 ? 1.0 : scale);

        projectedGrid.push({ px, py, alpha });
      });

      // Render grid lines
      ctx.lineWidth = 0.5;
      for (let r = 0; r < GRID_H; r++) {
        for (let c = 0; c < GRID_W; c++) {
          const idx = r * GRID_W + c;
          const curr = projectedGrid[idx];

          // Link horizontal
          if (c < GRID_W - 1) {
            const nextH = projectedGrid[idx + 1];
            ctx.beginPath();
            ctx.moveTo(curr.px, curr.py);
            ctx.lineTo(nextH.px, nextH.py);
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(curr.alpha, nextH.alpha)})`;
            ctx.stroke();
          }
          // Link vertical
          if (r < GRID_H - 1) {
            const nextV = projectedGrid[idx + GRID_W];
            ctx.beginPath();
            ctx.moveTo(curr.px, curr.py);
            ctx.lineTo(nextV.px, nextV.py);
            ctx.strokeStyle = `rgba(255,255,255,${Math.min(curr.alpha, nextV.alpha)})`;
            ctx.stroke();
          }
        }
      }

      // ── 3. Project 3D Sphere Network Nodes ──
      const projectedNodes = nodes3D.map((n) => {
        const rot = rotate3D(n);
        const scale = FOV / (FOV + rot.z * 110);
        const px = cx + rot.x * scale * w * 0.45;
        const py = cy + rot.y * scale * h * 0.45;
        const alpha = (rot.z + 1) / 2.0; // 0 (back) to 1 (front)
        return { px, py, z: rot.z, scale, alpha };
      });

      // ── 4. Draw Floating Orbital Paths ──
      const ORBITS = 3;
      for (let o = 0; o < ORBITS; o++) {
        const orbitR = 0.45 + o * 0.12;
        const inclination = (o - 1) * Math.PI * 0.18;
        
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2; a += 0.1) {
          // Circular orbit tilted
          const localX = orbitR * Math.cos(a);
          const localY = orbitR * Math.sin(a) * Math.cos(inclination);
          const localZ = orbitR * Math.sin(a) * Math.sin(inclination);
          const rot = rotate3D({ x: localX, y: localY, z: localZ });
          
          const scale = FOV / (FOV + rot.z * 110);
          const px = cx + rot.x * scale * w * 0.45;
          const py = cy + rot.y * scale * h * 0.45;

          if (a === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.strokeStyle = `rgba(255,255,255,${0.035 - o * 0.01})`;
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // ── 5. Draw Network Connections ──
      connections.forEach((conn) => {
        const nodeA = projectedNodes[conn.a];
        const nodeB = projectedNodes[conn.b];

        // Only draw if both are visible/scaled
        const avgZ = (nodeA.z + nodeB.z) / 2;
        const baseAlpha = 0.05 + ((avgZ + 1.0) / 2.0) * 0.08; // Stronger in front
        ctx.beginPath();
        ctx.moveTo(nodeA.px, nodeA.py);
        ctx.lineTo(nodeB.px, nodeB.py);
        ctx.strokeStyle = `rgba(255,255,255,${baseAlpha})`;
        ctx.lineWidth = 0.5 + ((avgZ + 1.0) / 2.0) * 0.5;
        ctx.stroke();
      });

      // ── 6. Draw Network Nodes ──
      projectedNodes.forEach((node) => {
        const size = (1.2 + node.alpha * 1.5) * node.scale;
        
        // Draw halo
        ctx.beginPath();
        ctx.arc(node.px, node.py, size * 2.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${node.alpha * 0.06})`;
        ctx.fill();

        // Draw node center
        ctx.beginPath();
        ctx.arc(node.px, node.py, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.25 + node.alpha * 0.55})`;
        ctx.fill();
      });

      // ── 7. Draw Live Data Packets (Agent Streams) ──
      packets.forEach((pkt) => {
        pkt.progress += pkt.speed;
        if (pkt.progress >= 1.0) {
          pkt.progress = 0;
          pkt.connIdx = Math.floor(Math.random() * connections.length);
        }

        const conn = connections[pkt.connIdx];
        if (!conn) return;

        const nodeA = projectedNodes[conn.a];
        const nodeB = projectedNodes[conn.b];

        const px = nodeA.px + (nodeB.px - nodeA.px) * pkt.progress;
        const py = nodeA.py + (nodeB.py - nodeA.py) * pkt.progress;
        const avgAlpha = (nodeA.alpha + nodeB.alpha) / 2;

        // Glowing stream packet
        ctx.beginPath();
        ctx.arc(px, py, 2.5 * ((nodeA.scale + nodeB.scale) / 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${avgAlpha * 0.95})`;
        ctx.fill();

        // Small halo
        ctx.beginPath();
        ctx.arc(px, py, 6 * ((nodeA.scale + nodeB.scale) / 2), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${avgAlpha * 0.12})`;
        ctx.fill();
      });

      // ── 8. Draw Central Core (Floating Intelligence Nucleus) ──
      const pulseSize = (0.045 + Math.sin(t * 1.5) * 0.003) * Math.min(w, h);
      
      // Core radial glows (layered for volume)
      for (let g = 4; g > 0; g--) {
        const radius = pulseSize * (g * 0.7);
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
        gr.addColorStop(0, `rgba(255,255,255,${0.03 / g})`);
        gr.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = gr;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Hyper-dense central point cloud core
      const coreDensity = 60;
      for (let i = 0; i < coreDensity; i++) {
        const phi = (i / coreDensity) * Math.PI * 2 + t * 0.8;
        const distRatio = Math.sin(i * 3.7 + t) * 0.5 + 0.5;
        const dist = pulseSize * 0.22 * distRatio;
        const px = cx + Math.cos(phi) * dist;
        const py = cy + Math.sin(phi) * dist;

        ctx.beginPath();
        ctx.arc(px, py, 0.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.35 + (1 - distRatio) * 0.5})`;
        ctx.fill();
      }

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
};

// ── Glassmorphic Testimonial Card ──────────────────────────────────────────
const TestimonialCard: React.FC<{ testimonial: Testimonial; style?: React.CSSProperties; className?: string }> = ({
  testimonial, style, className = ""
}) => (
  <div
    className={`absolute backdrop-blur-2xl border border-white/[0.04] rounded-2xl p-5 w-64 select-none hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 ${className}`}
    style={{
      background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255,255,255,0.03)',
      ...style,
    }}
  >
    <div className="flex items-center gap-3 mb-3.5">
      <AbstractAvatar name={testimonial.name} />
      <div className="min-w-0">
        <p className="text-[12px] font-semibold text-white tracking-tight leading-none truncate">{testimonial.name}</p>
        <p className="text-[10px] text-white/40 font-mono tracking-tight mt-0.5 truncate">{testimonial.handle}</p>
      </div>
    </div>
    <p className="text-[11px] leading-relaxed text-white/55 font-light tracking-wide">{testimonial.text}</p>
  </div>
);

// ── Main Redesigned Component ────────────────────────────────────────────────
export const SignInPage: React.FC<SignInPageProps> = ({
  testimonials = [],
  onSignIn,
  onGoogleSignIn,
  onResetPassword,
  onCreateAccount,
  onBack,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Floating keyframe animations configured inside CSS via tailwind/custom.
  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-[#000000] text-white overflow-hidden font-sans relative">
      
      {/* Dynamic procedural noise overlay */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none z-20"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* ── LEFT: Spacious Luxury Form Panel ── */}
      <section className="flex-1 flex items-center justify-center px-8 py-16 md:px-20 relative z-10 bg-black">
        <div className="w-full max-w-[390px] flex flex-col justify-between h-full max-h-[640px]">
          
          {/* Back button */}
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/80 transition-colors duration-200 cursor-pointer group w-fit animate-element animate-delay-100"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-[12px] font-medium tracking-wide">Back</span>
            </button>
          )}

          {/* Logo & Branding */}
          <div className="animate-element animate-delay-100">
            <Logo className="h-9 w-auto object-contain" variant="dark" />
          </div>

          {/* Headline Content */}
          <div className="my-auto py-10">
            <div className="mb-8">
              <h1 className="text-[34px] font-light text-white tracking-tight leading-[1.15] mb-4 animate-element animate-delay-200">
                Access your<br />
                <span className="font-semibold text-white">intelligence layer</span>
              </h1>
              <p className="text-[13px] text-white/40 leading-relaxed font-light tracking-wide animate-element animate-delay-300">
                Sign in to access AI agents, conversations, memory, workflows and premium tools.
              </p>
            </div>

            {/* Forms */}
            <form className="space-y-4 animate-element animate-delay-400" onSubmit={onSignIn}>
              {/* Email */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em]">
                  Email Address
                </label>
                <div
                  className="relative rounded-full transition-all duration-300"
                  style={{
                    background: focusedField === 'email' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: focusedField === 'email' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'email' 
                      ? 'inset 0 1px 2px rgba(255,255,255,0.04), 0 0 16px rgba(255,255,255,0.06)' 
                      : 'inset 0 1px 2px rgba(255,255,255,0.02)',
                  }}
                >
                  <input
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@domain.com"
                    className="w-full bg-transparent text-[13px] px-5 py-3.5 rounded-full focus:outline-none text-white placeholder:text-white/20 font-light"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em]">
                  Password
                </label>
                <div
                  className="relative rounded-full transition-all duration-300"
                  style={{
                    background: focusedField === 'password' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                    border: focusedField === 'password' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.07)',
                    boxShadow: focusedField === 'password' 
                      ? 'inset 0 1px 2px rgba(255,255,255,0.04), 0 0 16px rgba(255,255,255,0.06)' 
                      : 'inset 0 1px 2px rgba(255,255,255,0.02)',
                  }}
                >
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••••••"
                    className="w-full bg-transparent text-[13px] px-5 py-3.5 pr-12 rounded-full focus:outline-none text-white placeholder:text-white/20 font-light"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-5 flex items-center text-white/30 hover:text-white/70 transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center justify-between pt-1 pb-2">
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <div className="relative flex items-center">
                    <input type="checkbox" name="rememberMe" className="custom-checkbox h-3.5 w-3.5 border-white/20 checked:bg-white checked:border-white transition-all duration-300" />
                  </div>
                  <span className="text-[12px] text-white/35 group-hover:text-white/60 transition-colors font-light">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={onResetPassword}
                  className="text-[12px] text-white/35 hover:text-white/60 transition-colors font-light"
                >
                  Forgot password
                </button>
              </div>

              {/* Sign In Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full rounded-full py-3.5 text-[13px] font-semibold tracking-wide transition-all duration-300 cursor-pointer text-black bg-white hover:bg-zinc-100 hover:scale-[1.01]"
                  style={{
                    boxShadow: '0 4px 20px rgba(255,255,255,0.08)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(255,255,255,0.18)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,255,255,0.08)';
                  }}
                >
                  Sign In →
                </button>
              </div>
            </form>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-6 animate-element animate-delay-500">
              <span className="w-full border-t border-white/[0.06]" />
              <span className="px-4 text-[10px] text-white/30 bg-black absolute uppercase tracking-[0.1em]">or continue with</span>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={onGoogleSignIn}
              className="w-full flex items-center justify-center gap-2.5 rounded-full py-3.5 text-[13px] font-medium text-white/70 hover:text-white transition-all duration-300 cursor-pointer border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.02] animate-element animate-delay-600"
              style={{
                background: 'rgba(255,255,255,0.01)',
              }}
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Footer Navigation */}
          <p className="text-center text-[12px] text-white/30 animate-element animate-delay-700">
            New to our platform?{' '}
            <button
              type="button"
              onClick={onCreateAccount}
              className="text-white/60 hover:text-white font-medium transition-colors underline underline-offset-4 cursor-pointer"
            >
              Create Account
            </button>
          </p>
        </div>
      </section>

      {/* ── Vertical minimalist separator ── */}
      <div className="hidden md:block w-px bg-white/[0.05] self-stretch" />

      {/* ── RIGHT: Deep Cinematic Visual Panel ── */}
      <section className="hidden md:flex flex-1 relative overflow-hidden bg-black select-none">
        
        {/* Canvas Engine */}
        <IntelligenceCanvas />

        {/* Floating Title Tag */}
        <div className="absolute top-10 left-10 z-10 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/75 animate-ping" />
          <span className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-[0.2em] select-none">
            Intelligence Layer · Core.01
          </span>
        </div>

        {/* Floating Micro Statistics */}
        <div className="absolute top-10 right-10 z-10 flex flex-col gap-3 text-right">
          {[
            { label: 'Neural Threads', value: '24,812 / sec' },
            { label: 'Autonomous Agents', value: '1,492 online' },
            { label: 'Quantum Sync', value: '99.98% uptime' },
          ].map((stat, idx) => (
            <div key={stat.label} className="animate-element" style={{ animationDelay: `${800 + idx * 100}ms` }}>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.1em]">{stat.label}</p>
              <p className="text-[12px] font-mono font-medium text-white/50">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* ── Testimonial Floating Grid (Partially Overlapping) ── */}
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="relative w-full h-full">
            {testimonials[0] && (
              <TestimonialCard
                testimonial={testimonials[0]}
                className="pointer-events-auto animate-testimonial animate-delay-800"
                style={{
                  top: '25%',
                  left: '12%',
                  animationName: 'float',
                  animationDuration: '9s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }}
              />
            )}
            
            {testimonials[1] && (
              <TestimonialCard
                testimonial={testimonials[1]}
                className="pointer-events-auto animate-testimonial animate-delay-1000"
                style={{
                  bottom: '22%',
                  right: '10%',
                  animationName: 'float',
                  animationDuration: '10s',
                  animationDelay: '1.5s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }}
              />
            )}

            {testimonials[2] && (
              <TestimonialCard
                testimonial={testimonials[2]}
                className="pointer-events-auto animate-testimonial animate-delay-1200 md:opacity-80 lg:opacity-100"
                style={{
                  bottom: '8%',
                  left: '16%',
                  animationName: 'float',
                  animationDuration: '8s',
                  animationDelay: '0.7s',
                  animationIterationCount: 'infinite',
                  animationTimingFunction: 'ease-in-out',
                }}
              />
            )}
          </div>
        </div>

        {/* Global CSS Style tag for card bobbing animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
            100% { transform: translateY(0px); }
          }
        `}} />

        {/* Subtle radial shadow overlay at edges to draw focus inward */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%)' }}
        />
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)' }}
        />
      </section>
    </div>
  );
};
