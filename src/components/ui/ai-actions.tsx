import { useState, useRef, useCallback, useEffect, type ReactNode, type KeyboardEvent } from "react"
import {
  CopyIcon,
  RefreshCcwIcon,
  ShareIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
  ImageIcon,
  FileUp,
  MonitorIcon,
  CircleUserRound,
  Paperclip,
  PlusIcon,
  ArrowUpIcon,
  Wand2,
  Sparkles,
  Edit3,
  ChevronDown,
  ChevronRight,
  Settings
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { isConfigured, streamChatMessage } from "@/lib/openrouter"
import { useSessions, ChatMessage } from "../../context/SessionContext"
import AdBanner from "../AdBanner"
import { MODELS } from "../SettingsSidebar"
import { MarkdownRenderer } from "./markdown-renderer"

// ── auto-resize hook ──────────────────────────────────────────────────────────
function useAutoResizeTextarea({
  minHeight,
  maxHeight,
}: {
  minHeight: number
  maxHeight?: number
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const adjustHeight = useCallback(
    (reset?: boolean) => {
      const el = textareaRef.current
      if (!el) return
      if (reset) { el.style.height = `${minHeight}px`; return }
      el.style.height = `${minHeight}px`
      const next = Math.max(minHeight, Math.min(el.scrollHeight, maxHeight ?? Infinity))
      el.style.height = `${next}px`
    },
    [minHeight, maxHeight],
  )

  useEffect(() => {
    if (textareaRef.current) textareaRef.current.style.height = `${minHeight}px`
  }, [minHeight])

  useEffect(() => {
    const onResize = () => adjustHeight()
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [adjustHeight])

  return { textareaRef, adjustHeight }
}

// ── action pill button ────────────────────────────────────────────────────────
interface ActionButtonProps {
  icon: ReactNode
  label: string
  onClick?: () => void
}

function ActionButton({ icon, label, onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/50 hover:text-white/90 transition-colors cursor-pointer"
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  )
}

// ── props interface ───────────────────────────────────────────────────────────
interface ExampleProps {
  selectedModel: string;
  setSelectedModel: (m: string) => void;
  temperature: number;
  setTemperature: (t: number) => void;
  contextLength: number;
  setContextLength: (c: number) => void;
  showSettings: boolean;
  setShowSettings: (s: boolean) => void;
}

const Example = ({
  selectedModel,
  setSelectedModel,
  temperature,
  setTemperature,
  contextLength,
  setContextLength,
  showSettings,
  setShowSettings,
}: ExampleProps) => {
  const {
    sessions,
    activeSessionId,
    createSession,
    addMessageToSession,
    updateSessionMessages,
  } = useSessions();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession ? activeSession.messages : [];

  const [isGenerating, setIsGenerating] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [configError, setConfigError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 200 })

  // Auto scroll to bottom when message streaming
  useEffect(() => {
    const el = scrollContainerRef.current
    if (el) {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [messages.length, isGenerating])

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    if (!isConfigured()) {
      setConfigError("OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your env variables.")
      return
    }
    setConfigError(null)

    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `assistant-${Date.now()}`

    const userMsg: ChatMessage = {
      id: userMsgId,
      from: "user",
      content: text.trim(),
      avatar: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&q=80",
      name: "You",
    }

    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      from: "assistant",
      content: "",
      avatar: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=200&h=200&fit=crop&q=80",
      name: "AI Assistant",
    }

    setIsGenerating(true)

    let targetSessionId = activeSessionId
    if (!targetSessionId) {
      targetSessionId = createSession(userMsg)
    } else {
      addMessageToSession(targetSessionId, userMsg)
    }

    addMessageToSession(targetSessionId, assistantMsg)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const history = messages.map((m) => ({
        role: m.from as 'user' | 'assistant',
        content: m.content,
      }))
      history.push({ role: 'user' as const, content: text.trim() })

      let accumulated = ''
      for await (const chunk of streamChatMessage(
        history, 
        { model: selectedModel, temperature, max_tokens: contextLength * 1000 }, 
        abortController.signal
      )) {
        accumulated += chunk
        updateSessionMessages(targetSessionId, (prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulated } : m,
          ),
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      updateSessionMessages(targetSessionId, (prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.' }
            : m,
        ),
      )
    } finally {
      setIsGenerating(false)
      abortRef.current = null
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (inputValue.trim() && !isGenerating) {
        sendMessage(inputValue)
        setInputValue("")
        adjustHeight(true)
      }
    }
  }

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const quickActions = [
    { icon: <ImageIcon className="w-3.5 h-3.5 text-white/50" />, label: "Clone a Screenshot" },
    { icon: <Wand2 className="w-3.5 h-3.5 text-white/50" />, label: "Import from Figma" },
    { icon: <FileUp className="w-3.5 h-3.5 text-white/50" />, label: "Upload a Project" },
    { icon: <MonitorIcon className="w-3.5 h-3.5 text-white/50" />, label: "Landing Page" },
  ]

  // ── EMPTY STATE — v0-style landing ──────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex flex-col flex-1 min-h-0 w-full bg-black overflow-y-auto">
        <div className="flex flex-col items-center justify-center flex-1 w-full px-6 py-12 max-w-2xl mx-auto fade-in-up">

          <h1 className="text-[28px] md:text-[32px] font-bold text-white mb-2 tracking-tight text-center font-sans">
            How can I help you today?
          </h1>
          <p className="text-[13px] text-white/40 text-center max-w-md mb-8 leading-relaxed font-sans">
            Ask me anything about AI infrastructure, LLMs, deployment, scaling, or best practices.
          </p>

          {/* Input card */}
          <div className="w-full space-y-5">
            <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md hover:border-white/15 focus-within:border-white/20 transition-all">
              <div className="overflow-y-auto">
                <Textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={(e) => { setInputValue(e.target.value); adjustHeight() }}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className={cn(
                    "w-full px-5 py-4",
                    "resize-none bg-transparent border-none",
                    "text-white text-[15px]",
                    "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                    "placeholder:text-white/30",
                    "min-h-[52px]",
                  )}
                  style={{ overflow: "hidden" }}
                />
              </div>

              {/* Bottom bar */}
              <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                    title="Attach files"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                    title="Web Search"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"/></svg>
                  </button>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/5 text-white/50 text-[11px] font-medium hover:bg-white/[0.08] cursor-pointer transition-colors">
                    <span>{MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { if (inputValue.trim()) { sendMessage(inputValue); setInputValue(""); adjustHeight(true) } }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                      inputValue.trim()
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-white/10 text-white/30 cursor-not-allowed",
                    )}
                  >
                    <ArrowUpIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick-action pills */}
            <div className="flex flex-wrap items-center justify-center gap-2">
              {quickActions.map((a) => (
                <ActionButton
                  key={a.label}
                  icon={a.icon}
                  label={a.label}
                  onClick={() => { sendMessage(a.label); }}
                />
              ))}
            </div>

            {/* In-feed Ad banner in empty state */}
            <div className="pt-4 w-full">
              <AdBanner layout="in-feed" />
            </div>

            {configError && (
              <p className="text-xs text-red-400 text-center max-w-md mx-auto">
                {configError}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  // ── CONVERSATION STATE ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col flex-1 min-h-0 w-full bg-black overflow-hidden">
      {/* Center Panel Header */}
      <div className="shrink-0 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black text-white z-10">
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-semibold tracking-tight text-white truncate max-w-[200px] sm:max-w-xs">
              {activeSession?.title || "AI Infra Architecture"}
            </h2>
            <button className="text-white/30 hover:text-white transition-colors cursor-pointer p-1 rounded hover:bg-white/5">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-white/40 mt-0.5">
            <span>{MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}</span>
            <ChevronDown className="w-3 h-3 text-white/30" />
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer hover:bg-white/[0.08]" title="Share">
            <ShareIcon className="w-3.5 h-3.5" />
          </button>
          <button className="p-2 rounded-lg bg-white/[0.04] border border-white/10 text-white/60 hover:text-white transition-all cursor-pointer hover:bg-white/[0.08]" title="Embed Code">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5"/></svg>
          </button>
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className={cn("p-2 rounded-lg border transition-all cursor-pointer", showSettings ? "bg-white border-white text-black" : "bg-white/[0.04] border-white/10 text-white/60 hover:text-white hover:bg-white/[0.08]")}
            title="Toggle Parameters"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Messages viewport */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="max-w-2xl mx-auto w-full space-y-6">
          {messages.map((message, idx) => {
            if (message.from === "user") {
              return (
                <div key={message.id} className="w-full bg-[#121212] border border-white/5 rounded-2xl p-5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white/60">You</span>
                    <span className="text-[10px] text-white/30 font-medium">10:42 AM</span>
                  </div>
                  <p className="text-[14px] text-white/90 leading-relaxed font-sans">{message.content}</p>
                </div>
              )
            } else {
              return (
                <div key={message.id} className="w-full flex flex-col gap-2">
                  <div className="w-full space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-white/[0.08] flex items-center justify-center border border-white/10">
                          <Sparkles className="w-3 h-3 text-white/80" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">
                          {MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">10:43 AM</span>
                    </div>

                    {/* Content */}
                    <div className="text-[14px] text-white/80 leading-relaxed font-sans space-y-2">
                      <MarkdownRenderer content={message.content} />
                    </div>

                    {/* Flowchart architecture visual fallback */}
                    {message.content && (message.content.toLowerCase().includes("architecture") || message.content.toLowerCase().includes("infrastructure")) && (
                      <div className="mt-4 bg-black/60 border border-white/5 rounded-xl p-5 overflow-x-auto">
                        <div className="flex items-center justify-center gap-3 font-mono text-[10px] text-white/80 py-1.5">
                          <div className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg shadow-sm">User</div>
                          <div className="text-white/30">➔</div>
                          <div className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg shadow-sm">API Gateway</div>
                          <div className="text-white/30">➔</div>
                          <div className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg shadow-sm">Load Balancer</div>
                          <div className="text-white/30">➔</div>
                          <div className="px-2.5 py-1.5 bg-white/[0.06] border border-white/15 rounded-lg shadow-sm font-semibold">Model Inference (LLM Serving)</div>
                          <div className="text-white/30">➔</div>
                          <div className="px-2.5 py-1.5 bg-white/[0.04] border border-white/10 rounded-lg shadow-sm">Cache (Redis)</div>
                        </div>
                      </div>
                    )}

                    {/* Actions bar */}
                    <div className="flex items-center gap-1.5 mt-2 text-white/30">
                      <button className="p-1.5 rounded hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer" title="Like">
                        <ThumbsUpIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer" title="Dislike">
                        <ThumbsDownIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer" title="Copy">
                        <CopyIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer" title="Retry">
                        <RefreshCcwIcon className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded hover:bg-white/5 hover:text-white/60 transition-colors cursor-pointer" title="Share">
                        <ShareIcon className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {idx === 1 && (
                    <div className="w-full py-2">
                      <AdBanner layout="in-feed" />
                    </div>
                  )}
                </div>
              )
            }
          })}

        </div>
      </div>

      {/* Input container at bottom */}
      <div className="border-t border-white/10 bg-black/80 backdrop-blur-md px-6 py-4 shrink-0">
        <div className="max-w-2xl mx-auto w-full">
          <div className="relative bg-white/[0.03] border border-white/10 rounded-2xl backdrop-blur-md hover:border-white/15 focus-within:border-white/20 transition-all">
            <div className="overflow-y-auto">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); adjustHeight() }}
                onKeyDown={handleKeyDown}
                placeholder="Ask anything..."
                className={cn(
                  "w-full px-5 py-4",
                  "resize-none bg-transparent border-none",
                  "text-white text-[15px]",
                  "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-white/30",
                  "min-h-[52px] max-h-[160px]",
                )}
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                  title="Attach files"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                  title="Web Search"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-.778.099-1.533.284-2.253"/></svg>
                </button>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/5 text-white/50 text-[11px] font-medium hover:bg-white/[0.08] cursor-pointer transition-colors">
                  <span>{MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isGenerating ? (
                  <button
                    type="button"
                    onClick={stopGenerating}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs transition-colors cursor-pointer"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                    Stop
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (inputValue.trim()) {
                        sendMessage(inputValue);
                        setInputValue("");
                        adjustHeight(true);
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                      inputValue.trim()
                        ? "bg-white text-black hover:bg-neutral-200"
                        : "bg-white/10 text-white/30 cursor-not-allowed"
                    )}
                  >
                    <ArrowUpIcon className="w-4 h-4 stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Example }
