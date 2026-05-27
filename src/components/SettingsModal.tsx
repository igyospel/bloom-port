import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  User, 
  Lock, 
  Key, 
  Bell, 
  CreditCard, 
  Users, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Shield, 
  Info,
  ExternalLink,
  Cpu,
  Fingerprint,
  Radio,
  FileText,
  AlertTriangle,
  Github,
  CheckCircle,
  TrendingUp,
  Zap,
  Activity,
  Layers,
  ArrowUpRight,
  Sparkles,
  Terminal,
  Grid,
  Upload,
  Camera
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User as AuthUser } from '../context/AuthContext';
import { useCredits } from '../context/CreditContext';

interface SettingsModalProps {
  onClose: () => void;
  user: AuthUser;
  updateProfile: (name: string, pfpUrl?: string) => Promise<{ error: any }>;
}

type TabType = 
  | 'profile' 
  | 'security' 
  | 'api' 
  | 'notifications' 
  | 'billing' 
  | 'team' 
  | 'integrations' 
  | 'preferences' 
  | 'logs' 
  | 'danger';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  usage: number;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
  status: 'online' | 'offline';
  agentAccess: number;
}

interface Suggestion {
  id: string;
  text: string;
  impact: string;
  trustIncrease: string;
  done: boolean;
}

export default function SettingsModal({ onClose, user, updateProfile }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const { credits } = useCredits();
  
  // Profile settings state (persisted locally)
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pfpUrl, setPfpUrl] = useState<string>(() => localStorage.getItem('bp_settings_pfp') || user.avatarUrl || '');
  const [username, setUsername] = useState(() => localStorage.getItem('bp_settings_username') || 'argadev');
  const [website, setWebsite] = useState(() => localStorage.getItem('bp_settings_website') || '');
  const [location, setLocation] = useState(() => localStorage.getItem('bp_settings_location') || 'Jakarta, ID');
  const [company, setCompany] = useState(() => localStorage.getItem('bp_settings_company') || 'Bloomport AI');
  const [bio, setBio] = useState(() => localStorage.getItem('bp_settings_bio') || 'Building autonomous agentic workflows and mindful developer systems.');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPfpUrl(dataUrl);
      localStorage.setItem('bp_settings_pfp', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPfpUrl('');
    localStorage.removeItem('bp_settings_pfp');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Security settings state (persisted locally)
  const [tfaEnabled, setTfaEnabled] = useState(() => localStorage.getItem('bp_settings_tfa') === 'true');
  const [passkeyEnabled, setPasskeyEnabled] = useState(() => localStorage.getItem('bp_settings_passkey') !== 'false');
  const [secSuccess, setSecSuccess] = useState(false);

  // API Keys state (persisted locally)
  const [apiKeys, setApiKeys] = useState<ApiKey[]>(() => {
    const savedKeys = localStorage.getItem('bp_settings_apikeys');
    if (savedKeys) {
      try { return JSON.parse(savedKeys); } catch (e) {}
    }
    return [
      { id: '1', name: 'Production Gateway Key', key: 'bp_live_7x88fA99dJi81Lkn0bFdCQ', created: '2026-05-25', usage: 142050 },
      { id: '2', name: 'Staging Development Key', key: 'bp_test_3go62TzOrGMJf1kn0bFdCQ', created: '2026-05-26', usage: 8200 }
    ];
  });
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Notification settings state (persisted locally)
  const [notifs, setNotifs] = useState(() => {
    const saved = localStorage.getItem('bp_settings_notifs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      criticalAlerts: true,
      operationalLogs: true,
      productUpdates: false,
      agentEvents: true,
      aiSummarizer: true
    };
  });

  // AI Preferences state (persisted locally)
  const [aiPrefs, setAiPrefs] = useState(() => {
    const saved = localStorage.getItem('bp_settings_aiprefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      autonomousActions: true,
      agentPermissions: false,
      autoDeploy: true,
      autoRefactoring: false,
      autoBugFixes: true
    };
  });

  // Billing settings state
  const [creditsRefillActive, setCreditsRefillActive] = useState(true);

  // Team settings state (persisted locally)
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(() => {
    const savedTeam = localStorage.getItem('bp_settings_team');
    if (savedTeam) {
      try { return JSON.parse(savedTeam); } catch (e) {}
    }
    return [
      { id: '1', name: user.name, email: user.email, role: 'Owner', status: 'online', agentAccess: 42 },
      { id: '2', name: 'Sarah Chen', email: 'sarah.c@bloomport.fun', role: 'Member', status: 'online', agentAccess: 12 },
      { id: '3', name: 'Alex Mercer', email: 'alex.m@bloomport.fun', role: 'Admin', status: 'offline', agentAccess: 28 }
    ];
  });
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');

  // Suggestions state
  const [suggestions, setSuggestions] = useState<Suggestion[]>([
    { id: '1', text: 'Add company website link', impact: 'Medium', trustIncrease: '+5%', done: false },
    { id: '2', text: 'Enable biometric passkey login', impact: 'High', trustIncrease: '+15%', done: true },
    { id: '3', text: 'Connect verified GitHub organization', impact: 'High', trustIncrease: '+20%', done: false },
    { id: '4', text: 'Enable hardware-key 2FA protection', impact: 'High', trustIncrease: '+10%', done: false }
  ]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    
    // Pass pfpUrl directly — AuthContext handles data URLs for local state,
    // and skips writing data URLs to the DB automatically
    const { error } = await updateProfile(name, pfpUrl);
    setProfileSaving(false);
    if (!error) {
      localStorage.setItem('bp_settings_username', username);
      localStorage.setItem('bp_settings_website', website);
      localStorage.setItem('bp_settings_location', location);
      localStorage.setItem('bp_settings_company', company);
      localStorage.setItem('bp_settings_bio', bio);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    const randomChars = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: `bp_live_${randomChars.substring(0, 22)}`,
      created: new Date().toISOString().split('T')[0],
      usage: 0
    };
    
    const nextKeys = [...apiKeys, newKey];
    setApiKeys(nextKeys);
    localStorage.setItem('bp_settings_apikeys', JSON.stringify(nextKeys));
    setNewKeyName('');
  };

  const handleDeleteKey = (id: string) => {
    const nextKeys = apiKeys.filter(k => k.id !== id);
    setApiKeys(nextKeys);
    localStorage.setItem('bp_settings_apikeys', JSON.stringify(nextKeys));
  };

  const handleCopyKey = (key: string, id: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKeyId(id);
    setTimeout(() => setCopiedKeyId(null), 2000);
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail.trim(),
      role: inviteRole,
      status: 'offline',
      agentAccess: 5
    };

    const nextTeam = [...teamMembers, newMember];
    setTeamMembers(nextTeam);
    localStorage.setItem('bp_settings_team', JSON.stringify(nextTeam));
    setInviteEmail('');
    alert(`Teammate invite sent to ${inviteEmail}!`);
  };

  const handleTriggerSuggestion = (id: string) => {
    setSuggestions(suggestions.map(s => s.id === id ? { ...s, done: true } : s));
  };

  const sidebarItems = [
    { type: 'profile', label: 'Profile Identity', icon: <User className="w-3.5 h-3.5" /> },
    { type: 'security', label: 'Security Protocols', icon: <Shield className="w-3.5 h-3.5" /> },
    { type: 'api', label: 'API Gateways', icon: <Key className="w-3.5 h-3.5" /> },
    { type: 'preferences', label: 'AI Control Panel', icon: <Cpu className="w-3.5 h-3.5" /> },
    { type: 'team', label: 'Workspace Team', icon: <Users className="w-3.5 h-3.5" /> },
    { type: 'notifications', label: 'Smart Alerts', icon: <Bell className="w-3.5 h-3.5" /> },
    { type: 'billing', label: 'Billing & Quotas', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { type: 'integrations', label: 'Integrations', icon: <Grid className="w-3.5 h-3.5" /> },
    { type: 'logs', label: 'Audit Telemetry', icon: <FileText className="w-3.5 h-3.5" /> },
    { type: 'danger', label: 'Danger Zone', icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  ];

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Dark Ambient Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-[#030303]/90 backdrop-blur-md"
      />

      {/* Grid Pattern Mesh Overlay */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none mix-blend-overlay"
        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.95\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\'/%3E%3C/svg%3E")', backgroundRepeat: 'repeat' }}
      />

      {/* Futuristic Settings Modal Console */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.97, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="relative w-full max-w-5xl h-[100dvh] md:h-[700px] rounded-none md:rounded-xl border-0 md:border border-white/[0.08] bg-[#050505] text-white flex flex-col md:flex-row overflow-hidden shadow-[0_0_80px_rgba(255,255,255,0.02)] z-10 font-sans"
      >
        {/* Soft Radial Ambient Glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.02),transparent_70%)] pointer-events-none z-0" />
        
        {/* Top-right Console Close (Desktop Only) */}
        <button 
          onClick={onClose}
          className="hidden md:flex absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-lg border border-transparent hover:border-white/10 transition-all cursor-pointer z-30"
          aria-label="Close panel"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Mobile Header Console */}
        <div className="flex md:hidden items-center justify-between px-4 py-3 border-b border-white/[0.08] bg-black/40 z-20 shrink-0 select-none">
          <div className="flex items-center gap-2.5">
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <span className="text-[10px] font-bold font-sans tracking-[0.2em] uppercase text-white/55">Bloomport Console</span>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-white/40 hover:text-white hover:bg-white/5 rounded-md transition-all cursor-pointer"
            aria-label="Close panel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mobile Horizontal Navigation Tabs */}
        <div className="flex md:hidden border-b border-white/[0.08] bg-black/60 p-2.5 sticky top-0 z-20 overflow-x-auto gap-1 scrollbar-none shrink-0 select-none">
          {sidebarItems.map((item) => (
            <button
              key={item.type}
              onClick={() => setActiveTab(item.type as TabType)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-mono tracking-wide uppercase transition-all whitespace-nowrap cursor-pointer border border-transparent",
                activeTab === item.type 
                  ? "bg-white text-black font-bold shadow-md"
                  : "text-white/45 hover:text-white/80 hover:bg-white/[0.02]"
              )}
            >
              {item.icon}
              <span className="ml-1">{item.label}</span>
            </button>
          ))}
        </div>

        {/* ================= LEFT SIDEBAR (Desktop Only) ================= */}
        <aside className="hidden md:flex w-[260px] border-r border-white/[0.08] bg-black/40 flex-col p-4 shrink-0 relative z-10 justify-between">
          <div className="space-y-6">
            {/* Header Identity */}
            <div className="flex items-center gap-2.5 px-2 pt-2 select-none">
              <div className="relative w-4 h-4 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-white/20 animate-ping" />
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <span className="text-[10px] font-bold font-sans tracking-[0.2em] uppercase text-white/55">Bloomport Console</span>
            </div>

            {/* Main Tabs Navigation */}
            <nav className="space-y-0.5">
              {sidebarItems.map((item) => (
                <button
                  key={item.type}
                  onClick={() => setActiveTab(item.type as TabType)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer text-left relative",
                    activeTab === item.type 
                      ? "bg-white/[0.06] text-white border border-white/15 shadow-[0_0_15px_rgba(255,255,255,0.03)]"
                      : "text-white/45 hover:text-white/80 hover:bg-white/[0.02] border border-transparent"
                  )}
                >
                  <span className={cn("transition-colors", activeTab === item.type ? "text-white" : "text-white/40")}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                  {activeTab === item.type && (
                    <span className="absolute right-2.5 w-1 h-1 rounded-full bg-white" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Bottom Telemetry Card */}
          <div className="p-3.5 rounded-xl border border-white/[0.06] bg-[#080808] space-y-3 relative overflow-hidden group select-none shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_75%,rgba(255,255,255,0.01)_80%,transparent_85%)] bg-[length:200%_200%] animate-shine pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-[9px] uppercase tracking-wider font-sans font-bold text-white/30">Bloomport Pro</span>
              <span className="inline-flex items-center gap-1 text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/15">
                <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> LIVE
              </span>
            </div>
            
            <div className="space-y-1.5 pt-0.5">
              <p className="text-[10px] text-white/40 font-mono">Workspace Health</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div className="h-full bg-white rounded-full" style={{ width: '98%' }} />
                </div>
                <span className="text-[10px] font-bold font-mono text-white/80">98%</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/[0.04] text-[10px] font-mono">
              <div>
                <p className="text-white/30 text-[9px]">Active Agents</p>
                <p className="font-bold text-white/85 mt-0.5">42</p>
              </div>
              <div>
                <p className="text-white/30 text-[9px]">Credits Balance</p>
                <p className="font-bold text-white/85 mt-0.5">{credits.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN CONTENT PANE ================= */}
        <main className="flex-1 overflow-y-auto p-8 pr-10 relative z-10 bg-black/10 select-text">
          <AnimatePresence mode="wait">
            
            {/* 1. PROFILE IDENTITY TAB */}
            {activeTab === 'profile' && (
              <motion.div 
                key="profile"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-8"
              >
                {/* Header Title */}
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <User className="w-5 h-5 text-white/60" /> Profile Identity
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Manage your secure infrastructure developer identity cards.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                  {/* Left Form Settings */}
                  <form onSubmit={handleProfileSave} className="space-y-6">
                    {/* Avatar Upload — Local File / Gallery */}
                    <div className="flex flex-col sm:flex-row items-start gap-6 pb-2">
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileInputChange}
                      />

                      {/* Avatar Preview */}
                      <div
                        className="relative w-20 h-20 shrink-0 cursor-pointer group select-none"
                        onClick={() => fileInputRef.current?.click()}
                        title="Click to upload image"
                      >
                        <div className="absolute inset-0 rounded-full border border-white/10 bg-white/[0.02] flex items-center justify-center overflow-hidden">
                          {pfpUrl ? (
                            <img src={pfpUrl} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            <User className="w-9 h-9 text-white/20" />
                          )}
                        </div>
                        {/* Hover overlay */}
                        <div className="absolute inset-0 rounded-full bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Camera className="w-5 h-5 text-white" />
                        </div>
                        {/* Glow Ring */}
                        <div className="absolute -inset-1.5 rounded-full border border-white/5 bg-transparent pointer-events-none -z-10 animate-pulse" />
                      </div>

                      {/* Drop Zone */}
                      <div
                        className={`flex-1 flex flex-col items-center justify-center gap-3 p-5 rounded-xl border-2 border-dashed transition-all cursor-pointer ${
                          isDragging
                            ? 'border-white/40 bg-white/[0.04]'
                            : 'border-white/10 hover:border-white/20 bg-white/[0.01] hover:bg-white/[0.02]'
                        }`}
                        onClick={() => fileInputRef.current?.click()}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                      >
                        <div className="p-2.5 rounded-full bg-white/[0.05] border border-white/10">
                          <Upload className="w-4 h-4 text-white/50" />
                        </div>
                        <div className="text-center">
                          <p className="text-xs font-mono text-white/70 font-semibold">
                            {pfpUrl ? 'Change Photo' : 'Upload Photo'}
                          </p>
                          <p className="text-[10px] text-white/30 mt-0.5">
                            Click or drag & drop · JPG, PNG, GIF, WebP
                          </p>
                        </div>
                        {pfpUrl && (
                          <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="text-[9px] font-mono uppercase tracking-wider text-white/30 hover:text-red-400 transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Trash2 className="w-2.5 h-2.5" /> Remove photo
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metadata Input Fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Full Name</label>
                        <input 
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/35 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Username</label>
                        <input 
                          type="text"
                          required
                          value={username}
                          onChange={(e) => setUsername(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/35 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Email Address</label>
                        <input 
                          type="email"
                          disabled
                          value={email}
                          className="w-full bg-white/[0.01] border border-white/5 rounded-lg px-3.5 py-2.5 text-xs text-white/40 cursor-not-allowed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Website</label>
                          <span className="text-[9px] font-semibold text-white/25 uppercase tracking-wider bg-white/[0.04] border border-white/8 px-1.5 py-0.5 rounded-full">Optional</span>
                        </div>
                        <div className="relative">
                          <input 
                            type="url"
                            value={website}
                            onChange={(e) => setWebsite(e.target.value)}
                            placeholder="https://yourwebsite.com"
                            className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/35 transition-all pr-8 placeholder:text-white/20"
                          />
                          {website && (
                            <button
                              type="button"
                              onClick={() => setWebsite('')}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/25 hover:text-white/60 transition-colors cursor-pointer"
                              title="Clear website"
                            >
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Location</label>
                        <input 
                          type="text"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/35 transition-all"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Company / Org</label>
                        <input 
                          type="text"
                          value={company}
                          onChange={(e) => setCompany(e.target.value)}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-white/35 transition-all"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Professional Bio</label>
                      <textarea 
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={2}
                        className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white resize-none focus:outline-none focus:border-white/35 transition-all"
                      />
                    </div>

                    <div className="flex items-center justify-between border-t border-white/[0.08] pt-5">
                      <span className="text-[10px] text-emerald-400 font-mono">
                        {profileSuccess && "✓ Profile updates synchronized globally."}
                      </span>
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="px-6 py-2.5 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-lg text-xs font-mono font-bold tracking-wider uppercase disabled:opacity-50 cursor-pointer"
                      >
                        {profileSaving ? 'Synchronizing...' : 'Save Profile'}
                      </button>
                    </div>
                  </form>

                  {/* Right Side Widgets (Identity Insights, Floating Badges, Suggestions) */}
                  <div className="space-y-6 select-none">
                    
                    {/* Identity Insights - AI Reputation Score */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/40">AI Reputation Score</span>
                        <Sparkles className="w-4 h-4 text-white/60 animate-pulse" />
                      </div>
                      
                      <div className="flex items-baseline justify-between">
                        <span className="text-3xl font-bold font-mono tracking-tight text-white">92<span className="text-xs text-white/30 font-normal"> / 100</span></span>
                        <span className="text-[10px] font-mono text-emerald-400">Excellent</span>
                      </div>

                      <div className="h-px bg-white/[0.05]" />

                      <div className="space-y-2 text-[10px] font-mono">
                        <div className="flex justify-between text-white/50">
                          <span>API Activity</span>
                          <span className="text-white/80">Optimal</span>
                        </div>
                        <div className="flex justify-between text-white/50">
                          <span>Project Quality</span>
                          <span className="text-white/80">94%</span>
                        </div>
                        <div className="flex justify-between text-white/50">
                          <span>Team Collab</span>
                          <span className="text-white/80">High</span>
                        </div>
                        <div className="flex justify-between text-white/50">
                          <span>Agent Deployments</span>
                          <span className="text-white/80">42 Active</span>
                        </div>
                      </div>
                    </div>

                    {/* Developer Badges */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 block">Identity Tags</span>
                      <div className="flex flex-wrap gap-1.5">
                        {['Verified Builder', 'AI Agent Owner', 'API Builder', 'Early Adopter', 'Infrastructure Architect'].map((tag) => (
                          <span 
                            key={tag} 
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.03] text-[9px] font-mono text-white/60 tracking-tight transition-all"
                          >
                            <span className="w-1 h-1 rounded-full bg-white/40" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* AI SUGGESTIONS SECTION */}
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/40 flex items-center gap-1.5">
                        <Activity className="w-3.5 h-3.5 text-white/50" /> Profile Optimization
                      </span>
                      <div className="space-y-2">
                        {suggestions.map((s) => (
                          <div 
                            key={s.id} 
                            className={cn(
                              "p-2.5 rounded-lg border text-[11px] font-mono transition-all flex flex-col gap-1.5",
                              s.done 
                                ? "border-white/[0.03] bg-white/[0.01] opacity-40" 
                                : "border-white/[0.06] bg-white/[0.02] hover:border-white/10"
                            )}
                          >
                            <div className="flex justify-between items-start">
                              <span className={cn(s.done ? "line-through text-white/30" : "text-white/85")}>{s.text}</span>
                              <span className={cn(
                                "text-[9px] px-1 py-0.5 rounded",
                                s.impact === 'High' ? 'text-white bg-white/10' : 'text-white/55 bg-white/5'
                              )}>{s.trustIncrease}</span>
                            </div>
                            {!s.done && (
                              <button
                                type="button"
                                onClick={() => handleTriggerSuggestion(s.id)}
                                className="w-fit self-end text-[9px] font-bold text-white hover:underline uppercase tracking-wider flex items-center gap-0.5 cursor-pointer mt-1"
                              >
                                Optimize <ArrowUpRight className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. SECURITY PROTOCOLS TAB */}
            {activeTab === 'security' && (
              <motion.div 
                key="security"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Shield className="w-5 h-5 text-white/60" /> Security Protocols
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Configure hardware authorization and active session controls.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Gauge Card */}
                  <div className="p-5 rounded-xl border border-white/[0.08] bg-[#080808] flex flex-col justify-between h-[160px]">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 block mb-1">Security Health</span>
                      <p className="text-3xl font-mono font-bold text-white">94%</p>
                    </div>
                    <div className="space-y-1">
                      <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: '94%' }} />
                      </div>
                      <p className="text-[9px] font-mono text-emerald-400">✓ Systems protected by modern standards</p>
                    </div>
                  </div>

                  {/* Passkey Card */}
                  <div className="p-5 rounded-xl border border-white/[0.08] bg-[#080808] flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 block">Passkeys</span>
                        <p className="text-xs font-semibold text-white/80">Biometric Touch ID / FaceID</p>
                      </div>
                      <Fingerprint className="w-5 h-5 text-white/45" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono text-white/40">Status: Active</span>
                      <button
                        type="button"
                        onClick={() => setPasskeyEnabled(!passkeyEnabled)}
                        className={cn(
                          "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          passkeyEnabled ? "bg-white" : "bg-white/10"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                          passkeyEnabled ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                        )} />
                      </button>
                    </div>
                  </div>

                  {/* 2FA Card */}
                  <div className="p-5 rounded-xl border border-white/[0.08] bg-[#080808] flex flex-col justify-between h-[160px]">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 block">Two-Factor Auth</span>
                        <p className="text-xs font-semibold text-white/80">Authenticator App Sync</p>
                      </div>
                      <Shield className="w-5 h-5 text-white/45" />
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                      <span className="text-[10px] font-mono text-white/40">Status: Disabled</span>
                      <button
                        type="button"
                        onClick={() => setTfaEnabled(!tfaEnabled)}
                        className={cn(
                          "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          tfaEnabled ? "bg-white" : "bg-white/10"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                          tfaEnabled ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                        )} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Session telemetry and AI logs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 select-none">
                  {/* Session logs */}
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-4">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 block">Active Dev Sessions</span>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-xs font-mono">
                        <div className="space-y-0.5">
                          <p className="text-white/80 font-bold">macOS - Chrome Browser</p>
                          <p className="text-[10px] text-white/30">Jakarta, ID • 103.111.12.9 • Current Session</p>
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-[8px] bg-white/10 px-2 py-0.5 rounded border border-white/[0.08]">
                          ACTIVE
                        </span>
                      </div>
                      <div className="h-px bg-white/[0.04]" />
                      <div className="flex justify-between items-center text-xs font-mono opacity-60">
                        <div className="space-y-0.5">
                          <p className="text-white/80 font-bold">Linux Desktop - CLI Shell</p>
                          <p className="text-[10px] text-white/30">Singapore • 46.101.99.12 • 4 hours ago</p>
                        </div>
                        <button className="text-[9px] font-bold text-white/60 hover:text-white uppercase tracking-wider">Terminate</button>
                      </div>
                    </div>
                  </div>

                  {/* AI Risk suggestions */}
                  <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-3">
                    <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-white/50" /> AI Security Assistant
                    </span>
                    
                    <div className="p-3.5 rounded-lg bg-white/[0.02] border border-white/[0.05] space-y-3">
                      <p className="text-xs text-white/80 leading-relaxed font-mono">
                        "Your current credential profile is secure. We detected a CLI access from Singapore IP 46.101.99.12. If this wasn't you, consider rotating your Staging API Key."
                      </p>
                      <button 
                        onClick={() => alert("Rotating staging key...")}
                        className="px-3.5 py-1.5 border border-white/10 hover:border-white/20 rounded-md text-[10px] font-mono uppercase tracking-wider text-white hover:bg-white/5 transition-all cursor-pointer"
                      >
                        Rotate Staging Key
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 3. API GATEWAYS TAB */}
            {activeTab === 'api' && (
              <motion.div 
                key="api"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Key className="w-5 h-5 text-white/60" /> API Gateways
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Secure integrations keys and query load analytics.</p>
                </div>

                {/* API Request Chart Analytics - Customized SVG */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-[#080808] space-y-4 select-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 block">API Load Metrics (Last 7 Days)</span>
                      <p className="text-xl font-mono font-bold mt-1 text-white">8,428,510 <span className="text-[10px] text-white/40 font-normal">total requests</span></p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-emerald-400">
                      <TrendingUp className="w-3.5 h-3.5" /> +14.2% weekly
                    </div>
                  </div>

                  {/* Clean futuristic SVG line chart */}
                  <div className="w-full h-[120px] pt-4 relative">
                    <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
                          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0%" y1="0%" x2="100%" y2="0%" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      <line x1="0%" y1="100%" x2="100%" y2="100%" stroke="rgba(255,255,255,0.03)" strokeDasharray="3" />
                      {/* Gradient Fill under path */}
                      <path 
                        d="M0 100 Q15 65 30 80 T60 30 T90 50 T120 10 T150 40 L1000 40 L1000 120 L0 120 Z" 
                        fill="url(#chartGlow)"
                        className="w-full"
                        style={{ transform: 'scaleY(0.8) translateY(15px)' }}
                      />
                      {/* Glow Path Line */}
                      <path 
                        d="M0 100 Q15 65 30 80 T60 30 T90 50 T120 10 T150 40" 
                        fill="none" 
                        stroke="#ffffff" 
                        strokeWidth="1.5"
                        className="w-full"
                        style={{ transform: 'scaleY(0.8) translateY(15px)', filter: 'drop-shadow(0 0 4px rgba(255,255,255,0.3))' }}
                      />
                    </svg>
                    {/* Tooltip Dot */}
                    <div className="absolute top-[35px] right-[20%] w-2 h-2 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] border border-black animate-pulse" />
                  </div>
                </div>

                {/* Generate New Key Form */}
                <form onSubmit={handleGenerateKey} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-[#080808] border border-white/[0.08] p-4 rounded-xl">
                  <div className="flex-grow space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Key Description Name</label>
                    <input 
                      type="text"
                      required
                      value={newKeyName}
                      onChange={(e) => setNewKeyName(e.target.value)}
                      placeholder="e.g. CLI Production Client"
                      className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>
                  <button
                    type="submit"
                    className="h-9 px-4 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-lg text-xs font-mono font-bold tracking-wide uppercase flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Generate Key
                  </button>
                </form>

                {/* Key Telemetry Table */}
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-mono tracking-wider text-white/35 block">Active API Credentials</span>
                  {apiKeys.map((keyObj) => (
                    <div key={keyObj.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 border border-white/[0.08] bg-[#080808] rounded-xl text-xs font-mono">
                      <div className="space-y-1.5 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-white">{keyObj.name}</p>
                          <span className="text-[9px] font-mono text-white/30 bg-white/5 px-2 py-0.5 rounded">
                            {keyObj.usage.toLocaleString()} reqs
                          </span>
                        </div>
                        <div className="flex items-center gap-2 max-w-full">
                          <span className="font-mono text-white/50 text-[11px] bg-black border border-white/[0.04] px-2 py-0.5 rounded select-all truncate max-w-[200px] sm:max-w-none">
                            {keyObj.key}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyKey(keyObj.key, keyObj.id)}
                            className="text-white/40 hover:text-white transition-colors cursor-pointer"
                            title="Copy Key"
                          >
                            {copiedKeyId === keyObj.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                        <p className="text-[10px] text-white/25">Generated on {keyObj.created}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteKey(keyObj.id)}
                        className="p-2 text-white/45 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                        title="Delete Gateway Key"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 4. AI CONTROL PANEL TAB */}
            {activeTab === 'preferences' && (
              <motion.div 
                key="preferences"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-white/60" /> AI Control Panel
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Configure automation thresholds and autonomous agent capabilities.</p>
                </div>

                <div className="space-y-4">
                  {[
                    { key: 'autonomousActions', label: 'Autonomous System Actions', desc: 'Allows active agents to perform environment operations (e.g. spin up VMs) autonomously.' },
                    { key: 'agentPermissions', label: 'Strict Agent Guardrails', desc: 'Requires explicit developer key validation before executing critical database edits.' },
                    { key: 'autoDeploy', label: 'Auto Deployments Refinement', desc: 'Auto-deploys staging builds when system health test passes 95% threshold.' },
                    { key: 'autoRefactoring', label: 'Autonomous Code Refactoring', desc: 'Let AI scan codebase during low hours to restructure complexity stubs.' },
                    { key: 'autoBugFixes', label: 'Self-Healing Auto Bug Fixes', desc: 'Automatically write tests and apply fixes for edge-case server crashes.' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#080808] hover:border-white/10 transition-all select-none">
                      <div className="space-y-1 max-w-[80%]">
                        <span className="text-xs font-semibold text-white/90 font-mono">{item.label}</span>
                        <p className="text-[10px] text-white/40 leading-normal">{item.desc}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setAiPrefs({ ...aiPrefs, [item.key]: !aiPrefs[item.key as keyof typeof aiPrefs] })}
                        className={cn(
                          "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                          aiPrefs[item.key as keyof typeof aiPrefs] ? "bg-white" : "bg-white/10"
                        )}
                      >
                        <span
                          className={cn(
                            "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                            aiPrefs[item.key as keyof typeof aiPrefs] ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                          )}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 5. WORKSPACE TEAM TAB */}
            {activeTab === 'team' && (
              <motion.div 
                key="team"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Users className="w-5 h-5 text-white/60" /> Workspace Team
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Administer authorization matrix, members, and active agent limits.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                  {/* Left Column: Form & Members list */}
                  <div className="space-y-6">
                    {/* Invite Member form */}
                    <form onSubmit={handleInviteMember} className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-end bg-[#080808] border border-white/[0.08] p-4 rounded-xl">
                      <div className="flex-grow space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Teammate Email Address</label>
                        <input 
                          type="email"
                          required
                          value={inviteEmail}
                          onChange={(e) => setInviteEmail(e.target.value)}
                          placeholder="teammate@bloomport.fun"
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                        />
                      </div>
                      <div className="w-[120px] space-y-1.5 shrink-0">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-white/50 font-mono">Role</label>
                        <select
                          value={inviteRole}
                          onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                          className="w-full bg-white/[0.03] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                        >
                          <option value="Member" className="bg-[#050505] text-white">Member</option>
                          <option value="Admin" className="bg-[#050505] text-white">Admin</option>
                        </select>
                      </div>
                      <button
                        type="submit"
                        className="h-9 px-4 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-lg text-xs font-mono font-bold uppercase tracking-wide flex items-center justify-center gap-1 cursor-pointer shrink-0"
                      >
                        <Plus className="w-3.5 h-3.5" /> Invite
                      </button>
                    </form>

                    {/* Members List */}
                    <div className="space-y-3">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/35 block">Workspace Core Operator</span>
                      {teamMembers.map((member) => (
                        <div key={member.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 border border-white/[0.08] bg-[#080808] rounded-xl text-xs font-mono">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-8 h-8 rounded-full bg-white/10 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-xs">
                                {member.name.charAt(0)}
                              </div>
                              <span className={cn(
                                "absolute bottom-0 right-0 w-2 h-2 rounded-full border border-black",
                                member.status === 'online' ? "bg-emerald-400" : "bg-white/20"
                              )} />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{member.name}</p>
                              <p className="text-[10px] text-white/40">{member.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <span className="text-[9px] font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded border border-white/[0.06]">
                              {member.role}
                            </span>
                            <span className="text-[10px] text-white/30">{member.agentAccess} agents</span>
                            <button
                              type="button"
                              onClick={() => {
                                if (member.role === 'Owner') return;
                                setTeamMembers(teamMembers.filter(m => m.id !== member.id));
                              }}
                              disabled={member.role === 'Owner'}
                              className="p-1 text-white/40 hover:text-red-400 disabled:opacity-30 disabled:hover:text-white/40 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: AI Suggestion panel */}
                  <div className="space-y-6 select-none">
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-4">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-white/35 block">Team Telemetry</span>
                      
                      <div className="space-y-3 font-mono">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/40">Team Health Score</span>
                          <span className="text-white font-bold">96%</span>
                        </div>
                        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-white" style={{ width: '96%' }} />
                        </div>
                      </div>

                      <div className="h-px bg-white/[0.04]" />

                      <div className="space-y-3">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/30 flex items-center gap-1">
                          <Sparkles className="w-3 h-3" /> AI Suggestion
                        </span>
                        <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.05] text-[11px] font-mono leading-relaxed text-white/70">
                          "Operator <strong className="text-white">Sarah Chen</strong> has completed 48 verified agent builds. Recommended action: Promote to Admin based on workload analytics."
                        </div>
                        <button
                          onClick={() => {
                            setTeamMembers(teamMembers.map(m => m.id === '2' ? { ...m, role: 'Admin' } : m));
                            alert('Sarah Chen promoted to Admin successfully!');
                          }}
                          className="w-full py-2 bg-white text-black hover:bg-neutral-200 active:scale-[0.98] transition-all rounded-lg text-xs font-mono font-bold uppercase cursor-pointer"
                        >
                          Promote Sarah
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 6. SMART ALERTS (NOTIFICATIONS) TAB */}
            {activeTab === 'notifications' && (
              <motion.div 
                key="notifications"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Bell className="w-5 h-5 text-white/60" /> Smart Alerts
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Manage system event feeds, webhooks, and AI summaries.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
                  {/* Left Side Toggles */}
                  <div className="space-y-4">
                    {[
                      { key: 'criticalAlerts', label: 'Critical Outages & Incidents', desc: 'Alert immediately via email/webhooks if agent gateway response latency exceeds 2,500ms.' },
                      { key: 'operationalLogs', label: 'Operational Analytics', desc: 'Daily log summary indicating computational credit allocation and active API usages.' },
                      { key: 'productUpdates', label: 'Product Releases & Specs', desc: 'Receive system alerts whenever new optimized AI models (e.g. BP011) are deployed.' },
                      { key: 'agentEvents', label: 'Agent Specific Events', desc: 'Deployments, context limit alerts, or key revocation notifications.' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] bg-[#080808] hover:border-white/10 transition-all select-none">
                        <div className="space-y-1 max-w-[80%]">
                          <span className="text-xs font-semibold text-white/90 font-mono">{item.label}</span>
                          <p className="text-[10px] text-white/40 leading-normal">{item.desc}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key as keyof typeof notifs] })}
                          className={cn(
                            "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            notifs[item.key as keyof typeof notifs] ? "bg-white" : "bg-white/10"
                          )}
                        >
                          <span
                            className={cn(
                              "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                              notifs[item.key as keyof typeof notifs] ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                            )}
                          />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Right Side: AI Summarizer Preview */}
                  <div className="space-y-6 select-none">
                    <div className="p-4 rounded-xl border border-white/[0.08] bg-[#080808] space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-mono tracking-wider text-white/35">AI Summarizer</span>
                        <button 
                          onClick={() => setNotifs({ ...notifs, aiSummarizer: !notifs.aiSummarizer })}
                          className={cn(
                            "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                            notifs.aiSummarizer ? "bg-white" : "bg-white/10"
                          )}
                        >
                          <span className={cn(
                            "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                            notifs.aiSummarizer ? "translate-x-3 bg-black" : "translate-x-0 bg-white"
                          )} />
                        </button>
                      </div>
                      
                      <p className="text-[11px] font-mono leading-relaxed text-white/40">
                        When active, Bloomport aggregates notification alerts into a single smart feed summary.
                      </p>
                      
                      <div className="h-px bg-white/[0.04]" />

                      <div className="space-y-2 text-[10px] font-mono">
                        <p className="text-white/30 uppercase">Preview Feed Summary</p>
                        <div className="p-2.5 rounded border border-white/5 bg-white/[0.01] text-white/70 leading-normal">
                          "Everything is running smoothly. 3 API Keys are active. Yesterday's usage total was 1.2M requests with no system latency warnings."
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 7. BILLING & QUOTAS TAB */}
            {activeTab === 'billing' && (
              <motion.div 
                key="billing"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-white/60" /> Billing & Quotas
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Review active compute plans, invoices, and credit allocations.</p>
                </div>

                {/* Unlimited Pro Plan Card */}
                <div className="rounded-xl border border-white/[0.08] bg-[#080808] p-5 flex items-center justify-between relative overflow-hidden select-none">
                  <div className="absolute right-0 top-0 w-24 h-24 bg-white/[0.02] rounded-full blur-2xl" />
                  <div className="space-y-1.5 relative z-10">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-sans">Bloomport Unlimited Plan</span>
                      <span className="text-[9px] font-bold font-mono bg-white text-black px-1.5 py-0.5 rounded tracking-wide uppercase">Active</span>
                    </div>
                    <p className="text-xs text-white/45 leading-relaxed font-mono">Continuous dev credits allocation with auto credit refills.</p>
                  </div>
                  <div className="text-right font-mono relative z-10">
                    <p className="text-[10px] text-white/30">Next billing date</p>
                    <p className="text-sm font-semibold text-white mt-0.5">June 26, 2026</p>
                  </div>
                </div>

                {/* Subscriptions Quota details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-[#080808] space-y-2 font-mono">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                      <Info className="w-4 h-4 text-white/45" />
                      <span>Compute Allowances</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-normal">
                      Your current balance is <strong className="text-white">{credits.toLocaleString()} credits</strong>. Staging developer pipelines do not impact production key credits usage.
                    </p>
                  </div>

                  {/* Auto Refill toggle */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-[#080808] flex items-center justify-between font-mono">
                    <div className="space-y-0.5 max-w-[70%]">
                      <span className="text-xs font-semibold text-white/80">Auto Refill Credits</span>
                      <p className="text-[10px] text-white/40 leading-normal">Top up compute credits automatically when threshold falls below 1,000.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setCreditsRefillActive(!creditsRefillActive)}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        creditsRefillActive ? "bg-white" : "bg-white/10"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-black shadow ring-0 transition duration-200 ease-in-out",
                          creditsRefillActive ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                        )}
                      />
                    </button>
                  </div>
                </div>

                {/* External links */}
                <div className="flex items-center justify-between border-t border-white/[0.08] pt-5 font-mono">
                  <a 
                    href="https://supabase.com" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                  >
                    <span>Developer Database Dashboard</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                  <button
                    type="button"
                    onClick={() => alert("Billing updates are restricted in sandbox environments.")}
                    className="px-5 py-2.5 border border-white/10 hover:border-white/20 hover:bg-white/5 active:scale-[0.98] transition-all rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-white cursor-pointer"
                  >
                    Manage Billing Invoices
                  </button>
                </div>
              </motion.div>
            )}

            {/* 8. INTEGRATIONS TAB */}
            {activeTab === 'integrations' && (
              <motion.div 
                key="integrations"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Grid className="w-5 h-5 text-white/60" /> Connected Integrations
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Hook up third-party systems and API endpoints to your workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 select-none">
                  {[
                    { name: 'GitHub Integration', desc: 'Sync repository commits directly with agentic auto-refactoring logs.', icon: <Github className="w-5 h-5" />, status: 'Connected' },
                    { name: 'Vercel Deployment', desc: 'Hook deployment events to automatically rebuild landing dashboards.', icon: <ArrowUpRight className="w-5 h-5" />, status: 'Connected' },
                    { name: 'Slack Notifications', desc: 'Send webhook events and AI summaries straight to dev-ops channels.', icon: <Bell className="w-5 h-5" />, status: 'Not Connected' },
                    { name: 'Supabase Database', desc: 'Synchronize active user tables, RLS policies, and telemetry profiles.', icon: <Layers className="w-5 h-5" />, status: 'Connected' }
                  ].map((int) => (
                    <div key={int.name} className="p-4 rounded-xl border border-white/[0.06] bg-[#080808] hover:border-white/10 transition-all flex flex-col justify-between h-[130px] font-mono">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <span className="text-[10px] text-white/30 uppercase">Service Connector</span>
                          <h4 className="text-xs font-bold text-white">{int.name}</h4>
                          <p className="text-[10px] text-white/40 leading-normal pr-4">{int.desc}</p>
                        </div>
                        <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-white/70">
                          {int.icon}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between border-t border-white/[0.04] pt-2.5">
                        <span className={cn(
                          "text-[9px] px-1.5 py-0.5 rounded font-bold uppercase",
                          int.status === 'Connected' ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/15" : "text-white/30 bg-white/5"
                        )}>{int.status}</span>
                        
                        <button
                          onClick={() => alert(`${int.name} trigger connection...`)}
                          className="text-[9px] font-bold text-white hover:underline uppercase"
                        >
                          Configure →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* 9. AUDIT TELEMETRY LOGS TAB */}
            {activeTab === 'logs' && (
              <motion.div 
                key="logs"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-white/60" /> Audit Telemetry
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Full system activity logs for compliance and infrastructure oversight.</p>
                </div>

                <div className="border border-white/[0.08] bg-[#080808] rounded-xl overflow-hidden font-mono select-none w-full overflow-x-auto">
                  <div className="min-w-[650px]">
                    {/* Logs Header */}
                    <div className="grid grid-cols-4 gap-4 px-4 py-2 bg-white/5 text-[9px] font-bold uppercase text-white/40 tracking-wider">
                      <span>Timestamp</span>
                      <span>Operation Event</span>
                      <span>Operator Identity</span>
                      <span className="text-right">Status Code</span>
                    </div>

                    {/* Logs Feed */}
                    <div className="divide-y divide-white/[0.04] text-[10px] text-white/60 max-h-[400px] overflow-y-auto">
                      {[
                        { time: '2026-05-27 02:18:11', event: 'API_KEY_COPY', user: 'argadev', status: 'SUCCESS' },
                        { time: '2026-05-27 01:52:05', event: 'DEPLOY_AGENT_BP011', user: 'Sarah Chen', status: 'SUCCESS' },
                        { time: '2026-05-27 00:12:44', event: 'PROFILE_SETTING_SYNC', user: 'argadev', status: 'SUCCESS' },
                        { time: '2026-05-26 23:42:01', event: 'TEAM_INVITE_SEND', user: 'argadev', status: 'PENDING' },
                        { time: '2026-05-26 19:10:52', event: 'API_KEY_REVOKE', user: 'Sarah Chen', status: 'SUCCESS' },
                        { time: '2026-05-26 14:02:19', event: 'CREDIT_AUTO_REFILL', user: 'SYSTEM_AUTOPAY', status: 'SUCCESS' }
                      ].map((log, i) => (
                        <div key={i} className="grid grid-cols-4 gap-4 px-4 py-3 hover:bg-white/[0.01] transition-colors">
                          <span className="text-white/40">{log.time}</span>
                          <span className="font-bold text-white/80">{log.event}</span>
                          <span>{log.user}</span>
                          <span className={cn(
                            "text-right font-bold",
                            log.status === 'SUCCESS' ? "text-emerald-400" : log.status === 'PENDING' ? "text-amber-400" : "text-red-400"
                          )}>{log.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* 10. DANGER ZONE TAB */}
            {activeTab === 'danger' && (
              <motion.div 
                key="danger"
                initial={{ opacity: 0, y: 5 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -5 }}
                className="space-y-6"
              >
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white font-mono flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400" /> Danger Zone
                  </h2>
                  <p className="text-xs text-white/45 mt-1 leading-relaxed">Irreversible destructive operations for workspace settings.</p>
                </div>

                <div className="p-6 rounded-xl border border-red-500/20 bg-red-950/5 shadow-[0_0_40px_rgba(239,68,68,0.02)] space-y-6 select-none">
                  <div className="flex items-center gap-3 pb-3 border-b border-red-500/10">
                    <AlertTriangle className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider">Critical Warning</h4>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5 leading-normal">
                        Proceed with caution. Any action performed in this zone cannot be recovered.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4 font-mono">
                    {/* Revoke keys */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center text-xs">
                      <div className="space-y-0.5 max-w-[70%]">
                        <p className="font-bold text-white">Revoke All Active API Keys</p>
                        <p className="text-[10px] text-white/40">Immediately breaks all developer system webhooks and CLI gateways.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm("Are you absolutely sure you want to revoke ALL API keys? This will break production connections immediately.")) {
                            setApiKeys([]);
                            localStorage.setItem('bp_settings_apikeys', JSON.stringify([]));
                            alert("All keys revoked.");
                          }
                        }}
                        className="px-4 py-2 border border-red-500/30 hover:border-red-500 text-red-400 hover:bg-red-500/10 transition-all rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
                      >
                        Revoke Keys
                      </button>
                    </div>

                    <div className="h-px bg-red-500/10" />

                    {/* Delete workspace */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center text-xs">
                      <div className="space-y-0.5 max-w-[70%]">
                        <p className="font-bold text-white">Permanently Delete Workspace</p>
                        <p className="text-[10px] text-white/40">Removes databases, tables, 42 agents setups, and credits cache.</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => {
                          if (confirm("WARNING: Destroying the workspace will wipe all configurations. Confirm deletion?")) {
                            alert("Workspace deletion is disabled in the developer preview sandbox.");
                          }
                        }}
                        className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] transition-all rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer select-none"
                      >
                        Delete Workspace
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </main>
      </motion.div>
    </div>,
    document.body
  );
}
