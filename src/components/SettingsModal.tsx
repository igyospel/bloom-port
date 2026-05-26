import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  ExternalLink
} from 'lucide-react';
import { cn } from '../lib/utils';
import { User as AuthUser } from '../context/AuthContext';

interface SettingsModalProps {
  onClose: () => void;
  user: AuthUser;
  updateProfile: (name: string, pfpUrl?: string) => Promise<{ error: any }>;
}

type TabType = 'profile' | 'security' | 'api' | 'notifications' | 'billing' | 'team';

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
}

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Admin' | 'Member';
}

export default function SettingsModal({ onClose, user, updateProfile }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  
  // Profile settings state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [pfpUrl, setPfpUrl] = useState(user.avatarUrl);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Security settings state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [tfaEnabled, setTfaEnabled] = useState(false);
  const [secSuccess, setSecSuccess] = useState(false);

  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    { id: '1', name: 'Default Production Key', key: 'bp_live_3go62TzOrGMJf1kn0bFdCQ', created: '2026-05-25' }
  ]);
  const [newKeyName, setNewKeyName] = useState('');
  const [copiedKeyId, setCopiedKeyId] = useState<string | null>(null);

  // Notification settings state
  const [notifs, setNotifs] = useState({
    emailAlerts: true,
    weeklyDigest: false,
    sounds: true,
    systemAnnouncements: true,
  });

  // Billing settings state
  const [creditsRefillActive, setCreditsRefillActive] = useState(true);

  // Team settings state
  const [workspaceName, setWorkspaceName] = useState('AI Infrastructure Team');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Admin' | 'Member'>('Member');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    { id: '1', name: user.name, email: user.email, role: 'Owner' },
    { id: '2', name: 'Sarah Chen', email: 'sarah.c@bloomport.fun', role: 'Admin' }
  ]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);
    
    const { error } = await updateProfile(name, pfpUrl);
    setProfileSaving(false);
    if (!error) {
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      alert(error.message || 'Failed to update profile');
    }
  };

  const handleSecuritySave = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    setSecSuccess(true);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSecSuccess(false), 3000);
  };

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    
    const randomChars = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: `bp_live_${randomChars.substring(0, 22)}`,
      created: new Date().toISOString().split('T')[0]
    };
    
    setApiKeys([...apiKeys, newKey]);
    setNewKeyName('');
  };

  const handleDeleteKey = (id: string) => {
    setApiKeys(apiKeys.filter(k => k.id !== id));
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
      role: inviteRole
    };

    setTeamMembers([...teamMembers, newMember]);
    setInviteEmail('');
    alert(`Invite sent to ${inviteEmail}!`);
  };

  const handleDeleteMember = (id: string) => {
    if (id === '1') {
      alert("You cannot remove yourself from the workspace!");
      return;
    }
    setTeamMembers(teamMembers.filter(m => m.id !== id));
  };

  const sidebarItems = [
    { type: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
    { type: 'security', label: 'Security', icon: <Lock className="w-4 h-4" /> },
    { type: 'api', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    { type: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { type: 'billing', label: 'Billing & Plan', icon: <CreditCard className="w-4 h-4" /> },
    { type: 'team', label: 'Workspace Team', icon: <Users className="w-4 h-4" /> },
  ];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="relative w-full max-w-4xl h-[600px] rounded-2xl border border-white/10 bg-neutral-950 text-white flex overflow-hidden shadow-2xl z-10"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-full transition-all cursor-pointer z-30"
          aria-label="Close settings"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Sidebar Nav */}
        <aside className="w-[220px] border-r border-white/10 bg-black/40 flex flex-col p-4 shrink-0">
          <div className="flex items-center gap-2 mb-8 px-2 pt-2 select-none">
            <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold font-mono tracking-widest uppercase text-white/60">Settings Dashboard</span>
          </div>

          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.type}
                onClick={() => setActiveTab(item.type as TabType)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium tracking-wide transition-all cursor-pointer text-left",
                  activeTab === item.type 
                    ? "bg-white text-black font-semibold shadow-lg"
                    : "text-white/60 hover:text-white hover:bg-white/[0.04]"
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          <div className="px-3 py-2.5 rounded-xl border border-white/5 bg-white/[0.01] select-none">
            <p className="text-[10px] text-white/30 font-semibold tracking-wider uppercase">Bloomport Pro</p>
            <p className="text-[11px] text-white/70 font-mono mt-0.5">Active Sandbox</p>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 overflow-y-auto p-8 pr-10 font-sans">
          
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Profile Details</h2>
                <p className="text-xs text-white/50 mt-1">Manage your public information and avatar profile image.</p>
              </div>

              <form onSubmit={handleProfileSave} className="space-y-5">
                {/* Avatar Preview */}
                <div className="flex items-center gap-5 pb-2">
                  <div className="w-16 h-16 rounded-full bg-white/5 border border-white/15 overflow-hidden flex items-center justify-center relative group">
                    {pfpUrl ? (
                      <img src={pfpUrl} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-white/30" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-white/80">Profile Picture URL</label>
                    <input 
                      type="url"
                      value={pfpUrl}
                      onChange={(e) => setPfpUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className="w-full max-w-sm bg-white/[0.04] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Full Name</label>
                    <input 
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-white/70">Email Address</label>
                    <input 
                      type="email"
                      disabled
                      value={email}
                      className="w-full bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 text-xs text-white/40 cursor-not-allowed"
                      title="Email updates are restricted in the sandbox."
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {profileSuccess && "✓ Profile details updated successfully!"}
                  </span>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="px-5 py-2.5 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Security Settings</h2>
                <p className="text-xs text-white/50 mt-1">Configure credentials and multi-factor authorization safeguards.</p>
              </div>

              <form onSubmit={handleSecuritySave} className="space-y-5">
                <div className="space-y-4">
                  <div className="space-y-1.5 max-w-md">
                    <label className="text-xs font-semibold text-white/70">Current Password</label>
                    <input 
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4 max-w-md">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/70">New Password</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-white/70">Confirm New Password</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                      />
                    </div>
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full" />

                {/* MFA Section */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/[0.02]">
                  <div className="space-y-1 max-w-[80%]">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-white/60" />
                      <span className="text-xs font-bold tracking-wide">Two-Factor Authentication (2FA)</span>
                    </div>
                    <p className="text-[10px] text-white/40 leading-normal">Safeguard your sign-ins by requesting an extra code from a synchronized authenticator app.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTfaEnabled(!tfaEnabled)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      tfaEnabled ? "bg-white" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                        tfaEnabled ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                      )}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-white/10 pt-5">
                  <span className="text-[10px] text-emerald-400 font-medium">
                    {secSuccess && "✓ Password security changed successfully!"}
                  </span>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Update Credentials
                  </button>
                </div>
              </form>
            </motion.div>
          )}

          {/* API KEYS TAB */}
          {activeTab === 'api' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Developer API Keys</h2>
                <p className="text-xs text-white/50 mt-1">Authenticate server-side application requests using secure keys.</p>
              </div>

              {/* Generate Key Form */}
              <form onSubmit={handleGenerateKey} className="flex gap-2 items-end bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Key Designation Name</label>
                  <input 
                    type="text"
                    required
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    placeholder="e.g. Local Server Dev"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                  />
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Generate
                </button>
              </form>

              {/* API Keys List */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Active API Keys</label>
                
                {apiKeys.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-white/10 rounded-xl text-white/30 text-xs">
                    No active API keys generated.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {apiKeys.map((keyObj) => (
                      <div key={keyObj.id} className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02] rounded-xl text-xs">
                        <div className="space-y-1">
                          <p className="font-semibold text-white">{keyObj.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-white/50 text-[11px] bg-black/40 px-2 py-0.5 rounded border border-white/5 select-all">{keyObj.key}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyKey(keyObj.key, keyObj.id)}
                              className="text-white/40 hover:text-white transition-colors cursor-pointer"
                              title="Copy API Key"
                            >
                              {copiedKeyId === keyObj.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                          <p className="text-[10px] text-white/30">Generated on {keyObj.created}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteKey(keyObj.id)}
                          className="p-2 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Revoke Key"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Notifications Center</h2>
                <p className="text-xs text-white/50 mt-1">Configure where and how Bloomport delivers updates and logs.</p>
              </div>

              <div className="space-y-4">
                {[
                  { key: 'emailAlerts', label: 'Credit Depletion Alerts', desc: 'Notify me via email when my compute credit allocation falls below 2,000 credits.' },
                  { key: 'weeklyDigest', label: 'Weekly Performance Digest', desc: 'Receive a summarized weekly analysis of my focus trends, habit streaks, and credit savings.' },
                  { key: 'sounds', label: 'Timer & System Sounds', desc: 'Enable audio sound feedback for Pomodoro focus sessions and checklist completion.' },
                  { key: 'systemAnnouncements', label: 'New Model & Feature Announcements', desc: 'Receive system alerts whenever new optimized AI models (e.g. BP011) are deployed.' }
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:border-white/10 transition-all">
                    <div className="space-y-0.5 max-w-[80%]">
                      <span className="text-xs font-semibold text-white/90">{item.label}</span>
                      <p className="text-[10px] text-white/40 leading-normal">{item.desc}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotifs({ ...notifs, [item.key]: !notifs[item.key as keyof typeof notifs] })}
                      className={cn(
                        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                        notifs[item.key as keyof typeof notifs] ? "bg-white" : "bg-white/10"
                      )}
                    >
                      <span
                        className={cn(
                          "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                          notifs[item.key as keyof typeof notifs] ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* BILLING TAB */}
          {activeTab === 'billing' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Billing & Subscription</h2>
                <p className="text-xs text-white/50 mt-1">Review plan quotas, token balance rates, and billing details.</p>
              </div>

              {/* Plan Card */}
              <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">Bloomport Pro Workspace</span>
                    <span className="text-[8px] font-bold font-mono bg-white text-black px-1.5 py-0.5 rounded tracking-wide uppercase">Active</span>
                  </div>
                  <p className="text-xs text-white/50 leading-relaxed">Your workspace is on the Unlimited Pro tier. Auto-refills are active.</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40">Next billing date</p>
                  <p className="text-sm font-semibold font-mono text-white mt-0.5">June 26, 2026</p>
                </div>
              </div>

              {/* Subscriptions Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-white/80">
                    <Info className="w-4 h-4 text-white/40" />
                    <span>Compute Allowances</span>
                  </div>
                  <p className="text-[10px] text-white/40 leading-normal">Each query using BP011 - 3.0 consumes roughly ~100-300 credits based on context length.</p>
                </div>

                {/* Auto Refill Toggle */}
                <div className="p-4 rounded-xl border border-white/5 bg-white/[0.01] flex items-center justify-between">
                  <div className="space-y-0.5 max-w-[70%]">
                    <span className="text-xs font-semibold text-white/80">Auto Refill Credits</span>
                    <p className="text-[10px] text-white/40 leading-normal">Refills 10,000 compute credits when balance drops to zero.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCreditsRefillActive(!creditsRefillActive)}
                    className={cn(
                      "relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                      creditsRefillActive ? "bg-white" : "bg-white/10"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block h-4 w-4 transform rounded-full shadow ring-0 transition duration-200 ease-in-out",
                        creditsRefillActive ? "translate-x-4 bg-black" : "translate-x-0 bg-white"
                      )}
                    />
                  </button>
                </div>
              </div>

              {/* Pricing Redirect CTA */}
              <div className="flex items-center justify-between border-t border-white/10 pt-5">
                <a 
                  href="https://supabase.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white transition-colors"
                >
                  <span>Access Supabase Dashboard</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <button
                  type="button"
                  onClick={() => alert("Billing details editing restricted in the developer preview sandbox.")}
                  className="px-5 py-2.5 border border-white/10 hover:border-white/20 rounded-lg text-xs font-bold uppercase tracking-wider text-white hover:bg-white/5 active:scale-[0.98] transition-all cursor-pointer"
                >
                  Manage Invoices
                </button>
              </div>
            </motion.div>
          )}

          {/* WORKSPACE TEAM TAB */}
          {activeTab === 'team' && (
            <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <div>
                <h2 className="text-xl font-bold tracking-tight text-white">Workspace Team</h2>
                <p className="text-xs text-white/50 mt-1">Manage team members, roles, and authorization levels for this workspace.</p>
              </div>

              {/* Workspace Rename */}
              <div className="space-y-1.5 max-w-sm">
                <label className="text-xs font-semibold text-white/70">Workspace Name</label>
                <input 
                  type="text"
                  required
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-white/30"
                />
              </div>

              <div className="h-px bg-white/10 w-full" />

              {/* Invite Member Form */}
              <form onSubmit={handleInviteMember} className="flex gap-2 items-end bg-white/[0.02] border border-white/5 p-4 rounded-xl">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-white/70">Invite Coworker Email</label>
                  <input 
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="teammate@company.com"
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
                  />
                </div>
                <div className="w-[120px] space-y-1.5 shrink-0">
                  <label className="text-xs font-semibold text-white/70">Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as 'Admin' | 'Member')}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-lg py-2 px-3 text-xs text-white focus:outline-none focus:border-white/30 cursor-pointer"
                  >
                    <option value="Member" className="bg-neutral-900 text-white">Member</option>
                    <option value="Admin" className="bg-neutral-900 text-white">Admin</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="h-9 px-4 bg-white text-black rounded-lg text-xs font-bold uppercase tracking-wide hover:bg-neutral-200 active:scale-[0.98] transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Invite
                </button>
              </form>

              {/* Team Members List */}
              <div className="space-y-2.5">
                <label className="text-[10px] font-semibold tracking-wider text-white/40 uppercase">Active Workspace Members</label>
                
                <div className="space-y-2">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center justify-between p-3 border border-white/10 bg-white/[0.02] rounded-xl text-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/15 border border-white/10 flex items-center justify-center font-bold text-white uppercase text-xs">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{member.name}</p>
                          <p className="text-[10px] text-white/40">{member.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-semibold tracking-wide text-white/50 uppercase bg-white/[0.05] border border-white/5 px-2 py-0.5 rounded">
                          {member.role}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleDeleteMember(member.id)}
                          className="p-1.5 text-white/40 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all cursor-pointer"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

        </main>
      </motion.div>
    </div>
  );
}
