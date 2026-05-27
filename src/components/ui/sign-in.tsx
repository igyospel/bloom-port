import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mail, RotateCcw } from 'lucide-react';
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
  testimonials?: Testimonial[];
  onSendOtp?: (email: string) => Promise<{ error: any }>;
  onVerifyOtp?: (email: string, token: string) => Promise<{ error: any }>;
  onGoogleSignIn?: () => void;
  onCreateAccount?: () => void;
  onBack?: () => void;
  onSuccess?: () => void;
}

// ── Abstract Computational Avatar ──────────────────────────────────────────
const AbstractAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();
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
    const FOV = 220;

    const NODE_COUNT = 36;
    const nodes3D: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      const theta = Math.acos(-1 + (2 * i) / NODE_COUNT);
      const phi = Math.sqrt(NODE_COUNT * Math.PI) * theta;
      const r = 0.58;
      nodes3D.push({ x: r * Math.sin(theta) * Math.cos(phi), y: r * Math.sin(theta) * Math.sin(phi), z: r * Math.cos(theta) });
    }

    const connections: { a: number; b: number }[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      for (let j = i + 1; j < NODE_COUNT; j++) {
        const dx = nodes3D[i].x - nodes3D[j].x, dy = nodes3D[i].y - nodes3D[j].y, dz = nodes3D[i].z - nodes3D[j].z;
        if (Math.sqrt(dx*dx + dy*dy + dz*dz) < 0.48) connections.push({ a: i, b: j });
      }
    }

    const packets: { connIdx: number; progress: number; speed: number }[] = [];
    for (let i = 0; i < 6; i++) packets.push({ connIdx: Math.floor(Math.random() * connections.length), progress: Math.random(), speed: 0.006 + Math.random() * 0.008 });

    const FIELD_COUNT = 180;
    const field: { x: number; y: number; z: number; size: number; opacity: number }[] = [];
    for (let i = 0; i < FIELD_COUNT; i++) field.push({ x: (Math.random()-0.5)*2.5, y: (Math.random()-0.5)*2.5, z: (Math.random()-0.5)*2.0, size: Math.random()*0.8+0.3, opacity: Math.random()*0.3+0.08 });

    const GRID_W = 14, GRID_H = 14;
    const gridPoints: { x: number; y: number }[] = [];
    for (let r = 0; r < GRID_H; r++) for (let c = 0; c < GRID_W; c++) gridPoints.push({ x: (c/(GRID_W-1)-0.5)*2.2, y: (r/(GRID_H-1)-0.5)*2.2 });

    const draw = () => {
      timeRef.current += 0.004;
      const t = timeRef.current, w = W(), h = H(), cx = w/2, cy = h/2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000000'; ctx.fillRect(0, 0, w, h);
      const corePulse = 1 + Math.sin(t * 1.5) * 0.06;
      const radGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, w * 0.45 * corePulse);
      radGlow.addColorStop(0, 'rgba(255,255,255,0.025)'); radGlow.addColorStop(0.5, 'rgba(255,255,255,0.008)'); radGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = radGlow; ctx.fillRect(0, 0, w, h);
      const rotY = t * 0.12, rotX = Math.PI * 0.12 + Math.sin(t * 0.06) * 0.1;
      const cosX = Math.cos(rotX), sinX = Math.sin(rotX), cosY = Math.cos(rotY), sinY = Math.sin(rotY);
      const rotate3D = (pt: { x: number; y: number; z: number }) => { const x1 = pt.x*cosY - pt.z*sinY, z1 = pt.z*cosY + pt.x*sinY, y2 = pt.y*cosX - z1*sinX, z2 = z1*cosX + pt.y*sinX; return { x: x1, y: y2, z: z2 }; };
      field.forEach((p) => { p.z -= 0.0012; if (p.z < -1.0) p.z = 1.0; const rot = rotate3D(p), zDepth = rot.z + 1.2; if (zDepth <= 0.1) return; const scale = FOV/(FOV+rot.z*100), px = cx+rot.x*scale*w*0.55, py = cy+rot.y*scale*h*0.55; if (px>=0&&px<=w&&py>=0&&py<=h) { const alpha = p.opacity*(1.2-Math.abs(p.z))*(zDepth/2.2); ctx.beginPath(); ctx.arc(px,py,p.size*scale,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${Math.max(0,Math.min(1,alpha))})`; ctx.fill(); } });
      const projectedGrid: { px: number; py: number; alpha: number }[] = [];
      gridPoints.forEach((pt) => { const dist = Math.sqrt(pt.x*pt.x+pt.y*pt.y), waveZ = -0.3+Math.sin(pt.x*3.5+t*0.8)*Math.cos(pt.y*3.5+t*0.6)*0.08*Math.exp(-dist*0.3), rotated = rotate3D({x:pt.x,y:0.55+waveZ,z:pt.y}), scale = FOV/(FOV+rotated.z*90), px = cx+rotated.x*scale*w*0.55, py = cy+rotated.y*scale*h*0.55, alpha = (1-Math.min(1,dist/1.5))*0.14*(scale>0.8?1.0:scale); projectedGrid.push({px,py,alpha}); });
      ctx.lineWidth = 0.5;
      for (let r = 0; r < GRID_H; r++) for (let c = 0; c < GRID_W; c++) { const idx=r*GRID_W+c, curr=projectedGrid[idx]; if (c<GRID_W-1) { const nH=projectedGrid[idx+1]; ctx.beginPath(); ctx.moveTo(curr.px,curr.py); ctx.lineTo(nH.px,nH.py); ctx.strokeStyle=`rgba(255,255,255,${Math.min(curr.alpha,nH.alpha)})`; ctx.stroke(); } if (r<GRID_H-1) { const nV=projectedGrid[idx+GRID_W]; ctx.beginPath(); ctx.moveTo(curr.px,curr.py); ctx.lineTo(nV.px,nV.py); ctx.strokeStyle=`rgba(255,255,255,${Math.min(curr.alpha,nV.alpha)})`; ctx.stroke(); } }
      const projectedNodes = nodes3D.map((n) => { const rot = rotate3D(n), scale = FOV/(FOV+rot.z*110), px = cx+rot.x*scale*w*0.45, py = cy+rot.y*scale*h*0.45, alpha = (rot.z+1)/2.0; return {px,py,z:rot.z,scale,alpha}; });
      for (let o = 0; o < 3; o++) { const orbitR=0.45+o*0.12, inc=(o-1)*Math.PI*0.18; ctx.beginPath(); for (let a=0;a<=Math.PI*2;a+=0.1) { const lX=orbitR*Math.cos(a),lY=orbitR*Math.sin(a)*Math.cos(inc),lZ=orbitR*Math.sin(a)*Math.sin(inc),rot=rotate3D({x:lX,y:lY,z:lZ}),scale=FOV/(FOV+rot.z*110),px=cx+rot.x*scale*w*0.45,py=cy+rot.y*scale*h*0.45; if(a===0)ctx.moveTo(px,py);else ctx.lineTo(px,py); } ctx.strokeStyle=`rgba(255,255,255,${0.035-o*0.01})`; ctx.lineWidth=0.8; ctx.stroke(); }
      connections.forEach((conn) => { const nA=projectedNodes[conn.a],nB=projectedNodes[conn.b],avgZ=(nA.z+nB.z)/2,baseAlpha=0.05+((avgZ+1.0)/2.0)*0.08; ctx.beginPath(); ctx.moveTo(nA.px,nA.py); ctx.lineTo(nB.px,nB.py); ctx.strokeStyle=`rgba(255,255,255,${baseAlpha})`; ctx.lineWidth=0.5+((avgZ+1.0)/2.0)*0.5; ctx.stroke(); });
      projectedNodes.forEach((node) => { const size=(1.2+node.alpha*1.5)*node.scale; ctx.beginPath(); ctx.arc(node.px,node.py,size*2.8,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${node.alpha*0.06})`; ctx.fill(); ctx.beginPath(); ctx.arc(node.px,node.py,size,0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${0.25+node.alpha*0.55})`; ctx.fill(); });
      packets.forEach((pkt) => { pkt.progress+=pkt.speed; if(pkt.progress>=1.0){pkt.progress=0;pkt.connIdx=Math.floor(Math.random()*connections.length);} const conn=connections[pkt.connIdx]; if(!conn)return; const nA=projectedNodes[conn.a],nB=projectedNodes[conn.b],px=nA.px+(nB.px-nA.px)*pkt.progress,py=nA.py+(nB.py-nA.py)*pkt.progress,avgAlpha=(nA.alpha+nB.alpha)/2; ctx.beginPath(); ctx.arc(px,py,2.5*((nA.scale+nB.scale)/2),0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${avgAlpha*0.95})`; ctx.fill(); ctx.beginPath(); ctx.arc(px,py,6*((nA.scale+nB.scale)/2),0,Math.PI*2); ctx.fillStyle=`rgba(255,255,255,${avgAlpha*0.12})`; ctx.fill(); });
      const pulseSize=(0.045+Math.sin(t*1.5)*0.003)*Math.min(w,h);
      for(let g=4;g>0;g--){const radius=pulseSize*(g*0.7),gr=ctx.createRadialGradient(cx,cy,0,cx,cy,radius);gr.addColorStop(0,`rgba(255,255,255,${0.03/g})`);gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.beginPath();ctx.arc(cx,cy,radius,0,Math.PI*2);ctx.fill();}
      for(let i=0;i<60;i++){const phi=(i/60)*Math.PI*2+t*0.8,dR=Math.sin(i*3.7+t)*0.5+0.5,dist=pulseSize*0.22*dR,px=cx+Math.cos(phi)*dist,py=cy+Math.sin(phi)*dist;ctx.beginPath();ctx.arc(px,py,0.8,0,Math.PI*2);ctx.fillStyle=`rgba(255,255,255,${0.35+(1-dR)*0.5})`;ctx.fill();}
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(animRef.current); };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" style={{ display: 'block' }} />;
};

// ── Glassmorphic Testimonial Card ──────────────────────────────────────────
const TestimonialCard: React.FC<{ testimonial: Testimonial; style?: React.CSSProperties; className?: string }> = ({ testimonial, style, className = "" }) => (
  <div
    className={`absolute backdrop-blur-2xl border border-white/[0.04] rounded-2xl p-5 w-64 select-none hover:border-white/[0.12] transition-all duration-500 hover:-translate-y-1 ${className}`}
    style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)', boxShadow: '0 12px 40px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.03)', ...style }}
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

// ── OTP Code Input (6 boxes) ─────────────────────────────────────────────────
const OtpInput: React.FC<{ value: string; onChange: (v: string) => void; disabled?: boolean }> = ({ value, onChange, disabled }) => {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (idx: number, char: string) => {
    if (!/^\d*$/.test(char)) return;
    const arr = value.padEnd(6, ' ').split('');
    arr[idx] = char.slice(-1) || ' ';
    const newVal = arr.join('').trimEnd();
    onChange(newVal);
    if (char && idx < 5) inputs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !value[idx] && idx > 0) {
      inputs.current[idx - 1]?.focus();
      const arr = value.padEnd(6, ' ').split('');
      arr[idx - 1] = ' ';
      onChange(arr.join('').trimEnd());
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    onChange(pasted);
    inputs.current[Math.min(pasted.length, 5)]?.focus();
  };

  return (
    <div className="flex gap-2.5 justify-center">
      {Array.from({ length: 6 }).map((_, idx) => (
        <input
          key={idx}
          ref={(el) => { inputs.current[idx] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={value[idx] || ''}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          className="w-11 h-13 text-center text-[20px] font-mono font-semibold text-white bg-transparent border rounded-xl focus:outline-none transition-all duration-200 disabled:opacity-40"
          style={{
            height: '52px',
            border: value[idx] ? '1px solid rgba(255,255,255,0.4)' : '1px solid rgba(255,255,255,0.12)',
            background: value[idx] ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
            boxShadow: value[idx] ? '0 0 12px rgba(255,255,255,0.08)' : 'none',
          }}
        />
      ))}
    </div>
  );
};

// ── Main Sign In Page ────────────────────────────────────────────────────────
export const SignInPage: React.FC<SignInPageProps> = ({
  testimonials = [],
  onSendOtp,
  onVerifyOtp,
  onGoogleSignIn,
  onCreateAccount,
  onBack,
  onSuccess,
}) => {
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  // Auto-verify when all 6 digits entered
  useEffect(() => {
    if (otp.length === 6 && step === 'otp') {
      handleVerify();
    }
  }, [otp]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const result = onSendOtp ? await onSendOtp(email) : { error: null };
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Failed to send code. Please try again.');
    } else {
      setStep('otp');
      setResendCooldown(60);
    }
  };

  const handleVerify = async () => {
    if (otp.length !== 6 || loading) return;
    setLoading(true);
    setError('');
    const result = onVerifyOtp ? await onVerifyOtp(email, otp) : { error: null };
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Invalid code. Please try again.');
      setOtp('');
    } else {
      onSuccess?.();
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    setOtp('');
    const result = onSendOtp ? await onSendOtp(email) : { error: null };
    setLoading(false);
    if (result.error) {
      setError(result.error.message || 'Failed to resend code.');
    } else {
      setResendCooldown(60);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row w-[100dvw] bg-[#000000] text-white overflow-hidden font-sans relative">
      {/* Noise overlay */}
      <div className="absolute inset-0 opacity-[0.018] pointer-events-none z-20"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* ── LEFT: Form Panel ── */}
      <section className="flex-1 flex items-center justify-center px-8 py-16 md:px-20 relative z-10 bg-black">
        <div className="w-full max-w-[390px] flex flex-col justify-between h-full max-h-[640px]">

          {/* Back button */}
          {onBack && (
            <button
              type="button"
              onClick={step === 'otp' ? () => { setStep('email'); setOtp(''); setError(''); } : onBack}
              className="flex items-center gap-1.5 text-white/35 hover:text-white/80 transition-colors duration-200 cursor-pointer group w-fit"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform duration-200" />
              <span className="text-[12px] font-medium tracking-wide">
                {step === 'otp' ? 'Change email' : 'Back'}
              </span>
            </button>
          )}

          {/* Logo */}
          <div>
            <Logo className="h-9 w-auto object-contain" variant="dark" />
          </div>

          {/* Content */}
          <div className="my-auto py-10">

            {/* ── STEP 1: Email input ── */}
            {step === 'email' && (
              <div>
                <div className="mb-8">
                  <h1 className="text-[34px] font-light text-white tracking-tight leading-[1.15] mb-4">
                    Access your<br />
                    <span className="font-semibold text-white">intelligence layer</span>
                  </h1>
                  <p className="text-[13px] text-white/40 leading-relaxed font-light tracking-wide">
                    Enter your email — we'll send you a verification code to sign in.
                  </p>
                </div>

                <form className="space-y-4" onSubmit={handleSendOtp}>
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-semibold text-white/35 uppercase tracking-[0.15em]">
                      Email Address
                    </label>
                    <div
                      className="relative rounded-full transition-all duration-300"
                      style={{
                        background: focusedField === 'email' ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.01)',
                        border: focusedField === 'email' ? '1px solid rgba(255,255,255,0.22)' : '1px solid rgba(255,255,255,0.07)',
                        boxShadow: focusedField === 'email' ? '0 0 16px rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      <input
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

                  {error && (
                    <p className="text-[12px] text-red-400/80 font-light px-1">{error}</p>
                  )}

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={loading || !email}
                      className="w-full rounded-full py-3.5 text-[13px] font-semibold tracking-wide transition-all duration-300 cursor-pointer text-black bg-white hover:bg-zinc-100 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                      style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.08)' }}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Sending code...
                        </span>
                      ) : (
                        <>
                          <Mail className="w-4 h-4" />
                          Send Verification Code
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Divider */}
                <div className="relative flex items-center justify-center my-6">
                  <span className="w-full border-t border-white/[0.06]" />
                  <span className="px-4 text-[10px] text-white/30 bg-black absolute uppercase tracking-[0.1em]">or continue with</span>
                </div>

                {/* Google */}
                <button
                  type="button"
                  onClick={onGoogleSignIn}
                  className="w-full flex items-center justify-center gap-2.5 rounded-full py-3.5 text-[13px] font-medium text-white/70 hover:text-white transition-all duration-300 cursor-pointer border border-white/[0.08] hover:border-white/[0.18] hover:bg-white/[0.02]"
                  style={{ background: 'rgba(255,255,255,0.01)' }}
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </div>
            )}

            {/* ── STEP 2: OTP input ── */}
            {step === 'otp' && (
              <div>
                <div className="mb-8">
                  <div className="flex items-center justify-center mb-5">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 0 30px rgba(255,255,255,0.04)' }}
                    >
                      <Mail className="w-6 h-6 text-white/70" />
                    </div>
                  </div>
                  <h1 className="text-[30px] font-light text-white tracking-tight leading-[1.2] mb-3 text-center">
                    Check your<br />
                    <span className="font-semibold">inbox</span>
                  </h1>
                  <p className="text-[13px] text-white/40 leading-relaxed font-light tracking-wide text-center">
                    We sent a 6-digit code to<br />
                    <span className="text-white/70 font-medium">{email}</span>
                  </p>
                </div>

                <div className="space-y-6">
                  <OtpInput value={otp} onChange={setOtp} disabled={loading} />

                  {error && (
                    <p className="text-[12px] text-red-400/80 font-light text-center">{error}</p>
                  )}

                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={otp.length !== 6 || loading}
                    className="w-full rounded-full py-3.5 text-[13px] font-semibold tracking-wide transition-all duration-300 cursor-pointer text-black bg-white hover:bg-zinc-100 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
                    style={{ boxShadow: '0 4px 20px rgba(255,255,255,0.08)' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Verifying...
                      </span>
                    ) : 'Verify & Sign In →'}
                  </button>

                  {/* Resend */}
                  <div className="text-center">
                    <p className="text-[12px] text-white/30">
                      Didn't receive it?{' '}
                      {resendCooldown > 0 ? (
                        <span className="text-white/25">Resend in {resendCooldown}s</span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResend}
                          className="text-white/60 hover:text-white font-medium transition-colors underline underline-offset-4 cursor-pointer inline-flex items-center gap-1"
                        >
                          <RotateCcw className="w-3 h-3" /> Resend code
                        </button>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <p className="text-center text-[12px] text-white/30">
            New to Bloomport?{' '}
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

      {/* Vertical separator */}
      <div className="hidden md:block w-px bg-white/[0.05] self-stretch" />

      {/* ── RIGHT: Visual Panel ── */}
      <section className="hidden md:flex flex-1 relative overflow-hidden bg-black select-none">
        <IntelligenceCanvas />

        <div className="absolute top-10 left-10 z-10 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full bg-white/75 animate-ping" />
          <span className="text-[10px] font-mono font-medium text-white/40 uppercase tracking-[0.2em]">
            Intelligence Layer · Core.01
          </span>
        </div>

        <div className="absolute top-10 right-10 z-10 flex flex-col gap-3 text-right">
          {[
            { label: 'Neural Threads', value: '24,812 / sec' },
            { label: 'Autonomous Agents', value: '1,492 online' },
            { label: 'Quantum Sync', value: '99.98% uptime' },
          ].map((stat, idx) => (
            <div key={stat.label} style={{ animationDelay: `${800 + idx * 100}ms` }}>
              <p className="text-[9px] font-mono text-white/20 uppercase tracking-[0.1em]">{stat.label}</p>
              <p className="text-[12px] font-mono font-medium text-white/50">{stat.value}</p>
            </div>
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="relative w-full h-full">
            {testimonials[0] && (
              <TestimonialCard testimonial={testimonials[0]} className="pointer-events-auto"
                style={{ top: '25%', left: '12%', animationName: 'float', animationDuration: '9s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }} />
            )}
            {testimonials[1] && (
              <TestimonialCard testimonial={testimonials[1]} className="pointer-events-auto"
                style={{ bottom: '22%', right: '10%', animationName: 'float', animationDuration: '10s', animationDelay: '1.5s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }} />
            )}
            {testimonials[2] && (
              <TestimonialCard testimonial={testimonials[2]} className="pointer-events-auto"
                style={{ bottom: '8%', left: '16%', animationName: 'float', animationDuration: '8s', animationDelay: '0.7s', animationIterationCount: 'infinite', animationTimingFunction: 'ease-in-out' }} />
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `@keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }` }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(circle at center, transparent 30%, rgba(0,0,0,0.85) 100%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 20%, transparent 80%, rgba(0,0,0,0.4) 100%)' }} />
      </section>
    </div>
  );
};
