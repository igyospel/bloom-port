import React, { createContext, useContext, useState } from 'react';

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
}

export interface Session {
  id: string;
  title: string;
  messages: ChatMessage[];
  isPinned: boolean;
  icon: string;
  timestamp: string;
  group: 'today' | 'yesterday' | 'older';
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

export function SessionProvider({ children }: { children: React.ReactNode }) {
  // Always start with empty sessions
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  const createSession = (initialMessage?: ChatMessage) => {
    const id = `session-${Date.now()}`;
    const title = initialMessage
      ? initialMessage.content.slice(0, 30) + (initialMessage.content.length > 30 ? '...' : '')
      : 'New Chat';

    const newSession: Session = {
      id,
      title,
      messages: initialMessage ? [initialMessage] : [],
      isPinned: false,
      icon: 'message',
      timestamp: 'Just now',
      group: 'today',
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
