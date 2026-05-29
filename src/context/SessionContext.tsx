import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Attachment {
  url: string;
  name: string;
  contentType: string;
  size: number;
}

export interface ChatSource {
  url: string;
  title: string;
  snippet: string;
}

export interface ChatMessage {
  id: string;
  from: 'user' | 'assistant';
  content: string;
  avatar: string;
  name: string;
  attachments?: Attachment[];
  sources?: ChatSource[];
  searchQuery?: string;
  isSearching?: boolean;
  toolCallName?: string;
  toolCallArgs?: string;
  toolCallStatus?: 'running' | 'success' | 'error';
  toolCallResult?: string;
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  icon: string;
  timestamp: string;
  group: 'today' | 'yesterday' | 'older';
  createdAt: number; // Unix timestamp in ms
}

interface SessionContextType {
  sessions: Session[];
  activeSessionId: string | null;
  setActiveSessionId: (id: string | null) => void;
  createSession: (initialMessage?: ChatMessage) => string;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  togglePinSession: (id: string) => void;
  addMessageToSession: (sessionId: string, message: ChatMessage) => void;
  updateSessionMessages: (sessionId: string, updateFn: (prev: ChatMessage[]) => ChatMessage[]) => void;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

const STORAGE_KEY = 'bloomport_sessions';
const ACTIVE_KEY = 'bloomport_active_session';

// ── Helpers ───────────────────────────────────────────────────────────────────

function getStartOfDay(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function getGroup(createdAt: number): 'today' | 'yesterday' | 'older' {
  const now = new Date();
  const todayStart = getStartOfDay(now);
  const yesterdayStart = todayStart - 86_400_000; // 24h in ms

  if (createdAt >= todayStart) return 'today';
  if (createdAt >= yesterdayStart) return 'yesterday';
  return 'older';
}

function formatTimestamp(createdAt: number): string {
  const now = Date.now();
  const diff = now - createdAt;
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  const date = new Date(createdAt);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Remove sessions older than yesterday UNLESS they are pinned.
 * Returns the pruned list.
 */
function pruneOldSessions(sessions: Session[]): Session[] {
  const now = new Date();
  const yesterdayStart = getStartOfDay(now) - 86_400_000;
  return sessions.filter((s) => s.isPinned || s.createdAt >= yesterdayStart);
}

/**
 * Re-compute dynamic fields (group, timestamp) based on current time.
 */
function rehydrateSessions(sessions: Session[]): Session[] {
  return sessions.map((s) => ({
    ...s,
    group: getGroup(s.createdAt),
    timestamp: formatTimestamp(s.createdAt),
  }));
}

function loadFromStorage(): Session[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: Session[] = JSON.parse(raw);
    // Ensure all sessions have createdAt (backwards compat)
    const withTimestamps = parsed.map((s) => ({
      ...s,
      createdAt: s.createdAt ?? Date.now(),
    }));
    const pruned = pruneOldSessions(withTimestamps);
    return rehydrateSessions(pruned);
  } catch {
    return [];
  }
}

function saveToStorage(sessions: Session[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    // Storage might be full — silently fail
  }
}

function loadActiveSession(): string | null {
  try {
    return localStorage.getItem(ACTIVE_KEY);
  } catch {
    return null;
  }
}

function saveActiveSession(id: string | null) {
  try {
    if (id) localStorage.setItem(ACTIVE_KEY, id);
    else localStorage.removeItem(ACTIVE_KEY);
  } catch {}
}

// ── Provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionIdState] = useState<string | null>(null);

  // Load from storage after mounting (SSR safe)
  useEffect(() => {
    const loaded = loadFromStorage();
    setSessions(loaded);
    
    const stored = loadActiveSession();
    if (loaded.some((s) => s.id === stored)) {
      setActiveSessionIdState(stored);
    }
  }, []);

  // Persist sessions to localStorage whenever they change
  useEffect(() => {
    saveToStorage(sessions);
  }, [sessions]);

  // Refresh timestamps every minute so "2m ago" etc. stays current
  useEffect(() => {
    const interval = setInterval(() => {
      setSessions((prev) => rehydrateSessions(prev));
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Prune old (non-pinned) sessions once on mount and then at midnight
  useEffect(() => {
    setSessions((prev) => {
      const pruned = pruneOldSessions(prev);
      return pruned.length !== prev.length ? rehydrateSessions(pruned) : prev;
    });
  }, []);

  const setActiveSessionId = (id: string | null) => {
    setActiveSessionIdState(id);
    saveActiveSession(id);
  };

  const createSession = (initialMessage?: ChatMessage) => {
    const id = `session-${Date.now()}`;
    const title = initialMessage
      ? initialMessage.content.slice(0, 40) + (initialMessage.content.length > 40 ? '…' : '')
      : 'New Chat';

    const now = Date.now();
    const newSession: Session = {
      id,
      title,
      messages: initialMessage ? [initialMessage] : [],
      isPinned: false,
      icon: 'message',
      timestamp: formatTimestamp(now),
      group: 'today',
      createdAt: now,
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(id);
    return id;
  };

  const deleteSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (activeSessionId === id) {
      setActiveSessionId(null);
    }
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const togglePinSession = (id: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isPinned: !s.isPinned } : s))
    );
  };

  const addMessageToSession = (sessionId: string, message: ChatMessage) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: [...s.messages, message] }
          : s
      )
    );
  };

  const updateSessionMessages = (
    sessionId: string,
    updateFn: (prev: ChatMessage[]) => ChatMessage[]
  ) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? { ...s, messages: updateFn(s.messages) }
          : s
      )
    );
  };

  return (
    <SessionContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        createSession,
        deleteSession,
        renameSession,
        togglePinSession,
        addMessageToSession,
        updateSessionMessages,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSessions() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSessions must be used within SessionProvider');
  }
  return context;
}
