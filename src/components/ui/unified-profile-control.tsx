import { useState, useRef, useEffect, useCallback, type ReactNode, type ChangeEvent } from 'react';
import {
  Wallet,
  ChevronDown,
  ChevronRight,
  UserIcon,
  CopyIcon,
  CheckIcon,
  LogOutIcon,
  CircleUserRound,
  CameraIcon,
  Activity,
  Settings,
  Bell,
  ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCredits } from '../../context/CreditContext';
import { useAuth } from '../../context/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';
import RewardedAdModal from '../RewardedAdModal';
import SettingsModal, { TabType } from '../SettingsModal';
import { cn } from '../../lib/utils';

// ── Dropdown Particle Flow Background Component ──────────────────────────────
const DropdownParticleField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      phase: number;
      alpha: number;
    }

    const particles: Particle[] = [];
    const particleCount = 45;

    // Generate particles clustered on the right side
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: w * 0.45 + Math.random() * (w * 0.55),
        y: Math.random() * h,
        size: Math.random() * 0.8 + 0.4,
        speedY: -0.15 - Math.random() * 0.2, // Move upward
        phase: Math.random() * Math.PI * 2,
        alpha: 0.03 + Math.random() * 0.12,
      });
    }

    let animationFrameId: number;
    let time = 0;

    const draw = () => {
      time += 0.01;
      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        
        // Wrap around top/bottom
        if (p.y < -10) {
          p.y = h + 10;
          p.x = w * 0.45 + Math.random() * (w * 0.55);
        }

        // Horizontal waving motion
        const currentX = p.x + Math.sin(time * 0.6 + p.phase) * 12;

        ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(currentX, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 right-0 bottom-0 w-[120px] h-full pointer-events-none z-0 rounded-r-[14px]"
      style={{ display: 'block' }}
    />
  );
};

export function UnifiedProfileControl() {
  const { credits } = useCredits();
  const { user, logout, updateUserPfp, updateProfile } = useAuth();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [adOpen, setAdOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<TabType>('profile');

  useEffect(() => {
    const handleOpenSettings = (e: Event) => {
      const customEvent = e as CustomEvent;
      const tab = (customEvent.detail?.tab || 'profile') as TabType;
      setSettingsTab(tab);
      setSettingsOpen(true);
    };
    window.addEventListener('bloomport-open-settings', handleOpenSettings);
    return () => {
      window.removeEventListener('bloomport-open-settings', handleOpenSettings);
    };
  }, []);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Cleanup timeout
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const handleCopy = useCallback(async () => {
    if (!user) return;
    try {
      await navigator.clipboard.writeText(user.email);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      console.warn('Failed to copy email');
    }
  }, [user]);

  const handlePfpUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      updateUserPfp(url);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [user, updateUserPfp]);

  if (!user) return null;

  return (
    <div className="relative font-sans" ref={dropdownRef}>
      {/* ── TOP NAVIGATION CONTROL (Unified Pill) ── */}
      <div
        className={cn(
          "h-[32px] rounded-full flex items-center bg-white/[0.02] border border-white/[0.08] backdrop-blur-[20px] px-0.5",
          "shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,_0_0_15px_rgba(255,255,255,0.01)]",
          "hover:border-white/[0.16] hover:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,_0_0_20px_rgba(255,255,255,0.04)]",
          "transition-all duration-250 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
      >
        {/* Left Side: Energy/Credit Trigger */}
        <button
          onClick={() => setAdOpen(true)}
          title="Watch an ad to earn +1,000 credits"
          className="h-full flex items-center gap-1 px-2.5 hover:opacity-85 active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <Wallet className="w-3 h-3 text-white fill-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]" />
          </div>
          <span className="text-[11px] font-sans font-medium text-white tracking-[-0.02em] select-none">
            {credits.toLocaleString()}
          </span>
        </button>

        {/* Vertical Divider */}
        <div className="w-px h-3.5 bg-white/10 shrink-0" />

        {/* Right Side: Profile / Dropdown Trigger */}
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="h-full flex items-center gap-1.5 pl-2 pr-2.5 hover:opacity-85 transition-all duration-200 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-white/5 blur-[2px] -z-10" />
            
            <Avatar className="h-6 w-6 ring-1 ring-white/20">
              {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="Profile" /> : null}
              <AvatarFallback className="bg-white/10 text-white/50 text-[9px] font-bold">
                <CircleUserRound className="h-3 w-3" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-white border border-[#0d0d0d]" />
          </div>

          <ChevronDown
            className={cn(
              "w-3 h-3 text-white opacity-40 transition-transform duration-300",
              dropdownOpen && "rotate-180"
            )}
          />
        </button>
      </div>

      {/* ── DROPDOWN PANEL ── */}
      <AnimatePresence>
        {dropdownOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: -8 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              "absolute right-0 top-full mt-2 w-[220px] rounded-[14px] py-0.5 z-50 overflow-hidden",
              "bg-[#0a0a0a]/96 border border-white/[0.08] backdrop-blur-[24px]",
              "shadow-[0_1px_0_rgba(255,255,255,0.08)_inset,_0_0_60px_rgba(255,255,255,0.03)]"
            )}
          >
            {/* Dynamic particle field waving on the right side */}
            <DropdownParticleField />

            {/* Subtle noise texture overlay */}
            <div className="absolute inset-0 opacity-[0.015] pointer-events-none z-10"
              style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
            />

            {/* HEADER SECTION */}
            <div className="px-3 py-3 flex items-center gap-2.5 relative z-20">
              {/* Avatar with subtle glow and rings */}
              <div className="relative shrink-0 flex items-center justify-center">
                <div className="absolute -inset-1 rounded-full bg-white/[0.04] blur-[3px] -z-10" />
                <div className="absolute -inset-0.5 rounded-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)] -z-10" />
                
                <Avatar className="h-8 w-8 ring-1 ring-white/20">
                  {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="Profile" /> : null}
                  <AvatarFallback className="bg-white/10 text-white/40">
                    <CircleUserRound className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-white border border-[#0a0a0a]" />
              </div>

              {/* User Metadata */}
              <div className="flex flex-col items-start text-left min-w-0">
                <p className="text-xs font-semibold tracking-[-0.02em] text-white truncate w-full">
                  {user.name}
                </p>
                <p className="text-[10px] text-white/40 tracking-[-0.02em] mb-1 truncate w-full">
                  {user.email}
                </p>
                {/* Pro Plan Badge */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[8px] font-semibold bg-white/[0.05] border border-white/[0.08] text-white/80">
                  Pro Plan
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] w-full" />

            {/* MENU ITEMS (Height 32px per row) */}
            <div className="py-0.5 relative z-20">
              <DropdownRowItem
                onClick={() => {
                  setDropdownOpen(false);
                  setAdOpen(true);
                }}
                icon={<Wallet className="w-3 h-3" />}
                label="Credits"
              />
              <DropdownRowItem
                onClick={() => {
                  setDropdownOpen(false);
                  alert("Analytics dashboard integration in progress.");
                }}
                icon={<Activity className="w-3 h-3" />}
                label="Analytics"
              />
              <DropdownRowItem
                onClick={() => {
                  setDropdownOpen(false);
                  setSettingsOpen(true);
                }}
                icon={<Settings className="w-3 h-3" />}
                label="Settings"
              />
              <DropdownRowItem
                onClick={() => {
                  setDropdownOpen(false);
                  alert("Notifications center integration in progress.");
                }}
                icon={<Bell className="w-3 h-3" />}
                label="Notifications"
              />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] w-full" />

            {/* WORKSPACE SECTION */}
            <div
              onClick={() => {
                setDropdownOpen(false);
                alert("Switch workspace flow in progress.");
              }}
              className="px-3 py-2.5 flex items-center justify-between hover:bg-white/[0.02] cursor-pointer group transition-all duration-200 relative z-20"
            >
              <div className="flex flex-col items-start text-left min-w-0">
                <span className="text-[8px] uppercase font-semibold text-white/30 tracking-[0.08em] select-none">
                  Current Workspace
                </span>
                <span className="text-[11px] font-medium text-white/80 mt-0.5 group-hover:text-white transition-colors duration-200 truncate w-[150px]">
                  AI Infrastructure Team
                </span>
              </div>
              <ArrowRight className="text-white/30 w-3 h-3 group-hover:translate-x-0.5 transition-all duration-200 shrink-0" />
            </div>

            {/* Divider */}
            <div className="h-px bg-white/[0.06] w-full" />

            {/* FOOTER SECTION (Logout) */}
            <div className="p-0.5 relative z-20">
              <button
                onClick={() => {
                  setDropdownOpen(false);
                  logout();
                  window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'landing' }));
                }}
                className={cn(
                  "w-full h-8 flex items-center px-2.5 rounded-[10px] hover:bg-white/[0.04] transition-all duration-200 cursor-pointer text-left",
                  "text-[11px] font-medium text-white/70 hover:text-white"
                )}
              >
                <LogOutIcon className="text-white/40 w-3 h-3 mr-2" />
                <span>Logout</span>
              </button>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handlePfpUpload}
        className="hidden"
        aria-hidden
      />

      {/* Reward Credits Modal */}
      <RewardedAdModal isOpen={adOpen} onClose={() => setAdOpen(false)} />

      {/* Settings Modal */}
      <AnimatePresence>
        {settingsOpen && (
          <SettingsModal 
            onClose={() => setSettingsOpen(false)} 
            user={user} 
            updateProfile={updateProfile} 
            initialTab={settingsTab}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================================================================== */
// Dropdown row item component (Height 32px, hover/active states)
interface DropdownRowItemProps {
  onClick: () => void;
  icon: ReactNode;
  label: string;
}

function DropdownRowItem({ onClick, icon, label }: DropdownRowItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full h-[32px] flex items-center px-3 transition-all duration-200 cursor-pointer text-left group",
        "hover:bg-white/[0.04] active:bg-white/[0.06]"
      )}
    >
      {/* Icon (glows white on hover) */}
      <span className="text-white/50 w-3 h-3 mr-2 group-hover:text-white group-hover:drop-shadow-[0_0_3px_rgba(255,255,255,0.4)] transition-all duration-200">
        {icon}
      </span>
      {/* Label */}
      <span className="text-[11px] font-medium text-white/80 group-hover:text-white transition-colors duration-200">
        {label}
      </span>
      {/* Chevron Right */}
      <ChevronRight className="text-white/20 w-3 h-3 ml-auto group-hover:text-white/40 transition-colors duration-200" />
    </button>
  );
}
