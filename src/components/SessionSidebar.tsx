import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import { Logo } from './Logo';
import {
  Plus,
  Search,
  MessageSquare,
  Pin,
  Trash2,
  Edit3,
  Sparkles,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
  Check,
  X as CloseIcon,
} from 'lucide-react';
import { useSessions, Session } from '../context/SessionContext';
import AdBanner from './AdBanner';

const groupLabels: Record<string, { label: string; icon: typeof Clock }> = {
  today: { label: 'Today', icon: Sparkles },
  yesterday: { label: 'Yesterday', icon: Clock },
  older: { label: 'Older', icon: Calendar },
};

function SessionIcon({ icon, className }: { icon?: string; className?: string }) {
  if (!icon) return null;
  return <span className={cn('material-symbols-outlined', className)}>{icon}</span>;
}

export default function SessionSidebar({ inDrawer }: { inDrawer?: boolean }) {
  const {
    sessions,
    activeSessionId,
    setActiveSessionId,
    createSession,
    deleteSession,
    renameSession,
    togglePinSession,
  } = useSessions();

  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['today', 'yesterday', 'older'])
  );

  const filteredSessions = useMemo(() => {
    if (!searchQuery.trim()) return sessions;
    const q = searchQuery.toLowerCase();
    return sessions.filter((s) => s.title.toLowerCase().includes(q));
  }, [sessions, searchQuery]);

  const grouped = useMemo(() => {
    const map: Record<string, Session[]> = { today: [], yesterday: [], older: [] };
    for (const s of filteredSessions) {
      map[s.group] ??= [];
      map[s.group].push(s);
    }
    return map;
  }, [filteredSessions]);

  const pinnedSessions = useMemo(
    () => sessions.filter((s) => s.isPinned),
    [sessions]
  );

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const isSearching = searchQuery.trim().length > 0;

  return (
    <aside className={cn(inDrawer ? 'flex' : 'hidden lg:flex', 'flex-col w-[300px] bg-black text-white h-full overflow-hidden border-r border-white/10 z-10 relative shrink-0')}>
      {/* Top Section */}
      <div className="p-5 pb-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-auto" variant="dark" />
            <span className="text-[9px] font-semibold text-white/50 bg-white/[0.06] border border-white/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider scale-95 origin-left">
              LLM Studio
            </span>
          </div>
        </div>

        {/* New Session Button */}
        <button
          onClick={() => createSession()}
          className="w-full py-2.5 px-4 rounded-xl bg-white/[0.03] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 flex items-center gap-2 text-sm font-medium text-white/80 hover:text-white group cursor-pointer"
        >
          <Plus className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />
          <span>New Session</span>
        </button>

        {/* Sessions Section Label & Controls */}
        <div className="flex items-center justify-between text-[10px] font-semibold tracking-[0.15em] text-white/40 uppercase px-1 pt-2">
          <span>Sessions</span>
          <div className="flex items-center gap-2">
            <svg className="w-3 h-3 text-white/30 hover:text-white transition-colors cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <svg className="w-3 h-3 text-white/30 hover:text-white transition-colors cursor-pointer" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            aria-label="Search sessions"
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl py-2.5 pl-9 pr-3 text-sm text-white/80 placeholder:text-white/25 focus:outline-none focus:border-white/25 focus:bg-white/[0.06] transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 text-xs cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Scrollable List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-5 space-y-1">
        {/* Pinned Section */}
        {!isSearching && pinnedSessions.length > 0 && (
          <div className="mb-4">
            <p className="text-[10px] font-semibold tracking-[0.15em] text-white/25 uppercase mb-2 px-1 flex items-center gap-1.5">
              <Pin className="w-3 h-3" />
              Pinned
            </p>
            <div className="space-y-1">
              {pinnedSessions.map((session) => (
                <SessionItem
                  key={session.id}
                  session={session}
                  isActive={activeSessionId === session.id}
                  onActivate={() => setActiveSessionId(session.id)}
                  onDelete={() => deleteSession(session.id)}
                  onTogglePin={() => togglePinSession(session.id)}
                  onRename={(newTitle) => renameSession(session.id, newTitle)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Grouped Sessions */}
        {(['today', 'yesterday', 'older'] as const).map((group) => {
          const items = grouped[group];
          if (!items || items.length === 0) return null;

          const isExpanded = expandedGroups.has(group);
          const GroupIcon = groupLabels[group].icon;

          return (
            <div key={group} className="mb-2">
              <button
                onClick={() => toggleGroup(group)}
                aria-expanded={isExpanded}
                className="w-full flex items-center justify-between px-1 py-2 text-[10px] font-semibold tracking-[0.15em] text-white/25 uppercase hover:text-white/40 transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <GroupIcon className="w-3 h-3" />
                  {groupLabels[group].label}
                  <span className="text-white/15 ml-0.5">({items.length})</span>
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </button>

              <div
                className={cn(
                  'space-y-1 overflow-hidden transition-all duration-300',
                  isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                )}
              >
                {items.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={activeSessionId === session.id}
                    onActivate={() => setActiveSessionId(session.id)}
                    onDelete={() => deleteSession(session.id)}
                    onTogglePin={() => togglePinSession(session.id)}
                    onRename={(newTitle) => renameSession(session.id, newTitle)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {sessions.length === 0 && (
          <div className="py-14 text-center">
            <MessageSquare className="w-8 h-8 text-white/10 mx-auto mb-3" />
            <p className="text-sm text-white/30 font-medium">No sessions yet</p>
            <p className="text-xs text-white/20 mt-1">Start a new chat to begin</p>
          </div>
        )}

        {isSearching && filteredSessions.length === 0 && (
          <div className="py-10 text-center">
            <Search className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/30">No sessions found</p>
            <p className="text-xs text-white/20 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Upgrade Card */}
      <div className="p-5 pt-2 shrink-0">
        <div className="rounded-2xl p-4 relative overflow-hidden bg-white/[0.02] border border-white/10 group hover:border-white/20 transition-all duration-500">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors duration-500" />
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/10 shrink-0">
              <span className="material-symbols-outlined text-white text-lg">crown</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-semibold text-white/90">Upgrade to Premium</p>
              <p className="text-white/40 text-[11px] mt-1 leading-relaxed">
                Unlock higher limits, priority access, and more.
              </p>
              <button className="mt-3 text-[11px] font-semibold text-white/90 flex items-center gap-1 hover:gap-2 transition-all hover:text-white cursor-pointer bg-white/[0.06] hover:bg-white/[0.12] border border-white/10 rounded-lg px-2.5 py-1.5 w-max">
                <span>View Plans</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar Ad placement */}
      <div className="p-5 pt-0 shrink-0">
        <AdBanner layout="sidebar" />
      </div>
    </aside>
  );
}

interface SessionItemProps {
  session: Session;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
  onRename: (newTitle: string) => void;
}

function SessionItem({
  session,
  isActive,
  onActivate,
  onDelete,
  onTogglePin,
  onRename,
}: SessionItemProps) {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(session.title);

  const handleSaveRename = (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const trimmed = editTitle.trim();
    if (trimmed && trimmed !== session.title) {
      onRename(trimmed);
    } else {
      setEditTitle(session.title);
    }
    setIsEditing(false);
  };

  const handleCancelRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditTitle(session.title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSaveRename();
    } else if (e.key === 'Escape') {
      setEditTitle(session.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      onClick={!isEditing ? onActivate : undefined}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative cursor-pointer rounded-lg px-3 py-2.5 transition-all duration-200 border',
        isActive
          ? 'bg-white/[0.06] border-white/10'
          : 'border-transparent hover:bg-white/[0.02]'
      )}
    >
      <div className="flex items-center min-w-0">
        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            {isEditing ? (
              <div
                className="flex items-center gap-1 w-full"
                onClick={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-black/40 border border-white/40 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none focus:border-white w-full"
                />
                <button
                  type="button"
                  onClick={handleSaveRename}
                  className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleCancelRename}
                  className="p-0.5 rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 cursor-pointer"
                >
                  <CloseIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-baseline justify-between w-full min-w-0 gap-2">
                <p
                  className={cn(
                    'text-[13px] tracking-tight truncate transition-colors duration-200 flex-1 min-w-0',
                    isActive
                      ? 'font-semibold text-white'
                      : 'font-medium text-white/50 group-hover:text-white/80'
                  )}
                >
                  {session.title}
                </p>
                <span className="text-[10px] text-white/30 font-medium whitespace-nowrap shrink-0">
                  {session.timestamp === 'Just now' ? '2m ago' : session.timestamp}
                </span>
                {session.isPinned && (
                  <Pin className="w-2.5 h-2.5 text-white/50 shrink-0 rotate-45 ml-1" />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover actions */}
      {!isEditing && (
        <div
          className={cn(
            'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-[#0a0a0a]/90 backdrop-blur-sm rounded-lg px-1 py-1 border border-white/5 transition-all duration-200',
            showActions || isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
          )}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
            title="Rename"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onTogglePin();
            }}
            className="p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
            title={session.isPinned ? 'Unpin' : 'Pin'}
          >
            <Pin className={cn('w-3 h-3', session.isPinned && 'rotate-45')} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
}
