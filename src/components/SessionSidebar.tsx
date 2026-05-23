import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Plus,
  Search,
  MessageSquare,
  MoreHorizontal,
  Pin,
  Trash2,
  Edit3,
  Sparkles,
  Clock,
  Calendar,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';

interface Session {
  id: string;
  title: string;
  timestamp: string;
  group: 'today' | 'yesterday' | 'older';
  messageCount: number;
  isPinned?: boolean;
  icon?: string;
}

const initialSessions: Session[] = [
  {
    id: 's-1',
    title: 'Evening Reflection',
    timestamp: '2 hours ago',
    group: 'today',
    messageCount: 12,
    isPinned: true,
    icon: 'self_improvement',
  },
  {
    id: 's-2',
    title: 'Morning Focus Plan',
    timestamp: '4 hours ago',
    group: 'today',
    messageCount: 8,
    icon: 'wb_sunny',
  },
  {
    id: 's-3',
    title: 'Creative Flow State',
    timestamp: 'Yesterday',
    group: 'yesterday',
    messageCount: 24,
    icon: 'palette',
  },
  {
    id: 's-4',
    title: 'Strategic Planning',
    timestamp: 'Oct 24',
    group: 'older',
    messageCount: 18,
    icon: 'strategy',
  },
  {
    id: 's-5',
    title: 'Deep Work Session',
    timestamp: 'Oct 22',
    group: 'older',
    messageCount: 31,
    isPinned: true,
    icon: 'psychology',
  },
  {
    id: 's-6',
    title: 'Weekly Review',
    timestamp: 'Oct 20',
    group: 'older',
    messageCount: 15,
    icon: 'calendar_month',
  },
];

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
  const [activeId, setActiveId] = useState('s-1');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(['today', 'yesterday', 'older'])
  );
  const [sessions] = useState<Session[]>(initialSessions);

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
    <aside className={cn(inDrawer ? 'flex' : 'hidden lg:flex', 'flex-col w-[340px] bg-[#0a0a0a] text-white h-full overflow-hidden border-r border-white/10 z-10 relative shrink-0')}>
      {/* Top Section */}
      <div className="p-5 pb-3 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold tracking-[0.2em] text-white/40 uppercase flex items-center gap-3">
            <span className="w-4 h-px bg-white/20" />
            Mindful Sessions
          </p>
          <span className="text-[10px] font-medium text-white/25 bg-white/[0.06] px-2 py-0.5 rounded-full">
            {sessions.length}
          </span>
        </div>

        {/* New Session Button */}
        <button className="w-full py-2.5 px-4 rounded-xl bg-white/[0.06] border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 text-sm font-medium text-white/80 hover:text-white group cursor-pointer">
          <Plus className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity group-hover:rotate-90 duration-300" />
          <span>New Session</span>
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />            <input
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
              {                  pinnedSessions.map((session) => (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={activeId === session.id}
                    onActivate={() => setActiveId(session.id)}
                  />
                ))}
            </div>
          </div>
        )}

        {/* Grouped Sessions */}
        {(['today', 'yesterday', 'older'] as const).map((group) => {
          const items = grouped[group];
          if (items.length === 0) return null;

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
                    isActive={activeId === session.id}
                    onActivate={() => setActiveId(session.id)}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {isSearching && filteredSessions.length === 0 && (
          <div className="py-10 text-center">
            <Search className="w-8 h-8 text-white/15 mx-auto mb-3" />
            <p className="text-sm text-white/30">No sessions found</p>
            <p className="text-xs text-white/20 mt-1">Try a different search term</p>
          </div>
        )}
      </div>

      {/* Quote Card */}
      <div className="p-5 pt-2 shrink-0">
        <div className="rounded-2xl p-5 relative overflow-hidden bg-gradient-to-br from-[#7b8e5c]/15 via-white/[0.04] to-transparent border border-white/[0.08] group hover:border-[#7b8e5c]/30 transition-all duration-500">
          <div className="absolute -top-6 -right-6 w-20 h-20 bg-[#7b8e5c]/10 rounded-full blur-2xl group-hover:bg-[#7b8e5c]/20 transition-colors duration-500" />
          <span className="material-symbols-outlined text-[#7b8e5c]/60 text-xl mb-3 block group-hover:text-[#7b8e5c] transition-colors duration-500">
            self_improvement
          </span>
          <p className="text-white/70 text-[13px] leading-relaxed italic font-serif group-hover:text-white/90 transition-colors duration-500">
            &ldquo;Quiet the mind, and the soul will speak.&rdquo;
          </p>
          <p className="text-white/30 text-[10px] mt-3 tracking-wider uppercase font-medium group-hover:text-white/40 transition-colors duration-500">
            — Mahatma Gandhi
          </p>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */
// Single session row
function SessionItem({
  session,
  isActive,
  onActivate,
}: {
  key?: string;
  session: Session;
  isActive: boolean;
  onActivate: () => void;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      onClick={onActivate}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
      className={cn(
        'group relative cursor-pointer rounded-xl p-3 transition-all duration-300',
        isActive
          ? 'bg-white/[0.08] border border-white/10'
          : 'border border-transparent hover:bg-white/[0.04]'
      )}
    >
      {/* Active indicator */}
      <div
        className={cn(
          'absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full transition-all duration-300',
          isActive ? 'bg-[#7b8e5c] opacity-100' : 'bg-white/20 opacity-0 group-hover:opacity-100'
        )}
      />

      <div className="flex items-start gap-3 pl-1">
        {/* Icon */}
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all duration-300',
            isActive
              ? 'bg-[#7b8e5c]/20 text-[#7b8e5c]'
              : 'bg-white/[0.06] text-white/40 group-hover:text-white/60 group-hover:bg-white/[0.08]'
          )}
        >
          <SessionIcon icon={session.icon} className="text-[15px]" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p
              className={cn(
                'text-[14px] tracking-tight truncate transition-colors duration-200',
                isActive
                  ? 'font-semibold text-white'
                  : 'font-medium text-white/70 group-hover:text-white/90'
              )}
            >
              {session.title}
            </p>
            {session.isPinned && (
              <Pin className="w-3 h-3 text-white/20 shrink-0 rotate-45" />
            )}
          </div>

          <div className="flex items-center justify-between mt-1">
            <p className="text-[11px] text-white/30 font-medium tracking-wider uppercase">
              {session.timestamp}
            </p>
            <div className="flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3 text-white/20" />
              <span className="text-[10px] text-white/25 font-medium">{session.messageCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Hover actions */}
      <div
        className={cn(
          'absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 bg-[#0a0a0a]/90 backdrop-blur-sm rounded-lg px-1 py-1 border border-white/5 transition-all duration-200',
          showActions || isActive ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2 pointer-events-none'
        )}
      >
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
          title="Rename"
        >
          <Edit3 className="w-3 h-3" />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors cursor-pointer"
          title={session.isPinned ? 'Unpin' : 'Pin'}
        >
          <Pin className={cn('w-3 h-3', session.isPinned && 'rotate-45')} />
        </button>
        <button
          type="button"
          className="p-1.5 rounded-md hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors cursor-pointer"
          title="Delete"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
