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
  Settings,
  X,
  Globe,
  Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { isConfigured, streamChatMessage } from "@/lib/openrouter"
import { useSessions, ChatMessage, Attachment, ChatSource } from "../../context/SessionContext"
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

  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [uploadQueue, setUploadQueue] = useState<string[]>([])
  const [webSearchEnabled, setWebSearchEnabled] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFile = async (file: File): Promise<Attachment | undefined> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        resolve({
          url: reader.result as string,
          name: file.name,
          contentType: file.type || 'application/octet-stream',
          size: file.size
        });
      };
      reader.onerror = () => {
        resolve(undefined);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploadQueue((q) => [...q, ...files.map((f) => f.name)]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const MAX = 10 * 1024 * 1024;
    const valid = files.filter((f) => f.size <= MAX);
    const invalid = files.filter((f) => f.size > MAX);
    if (invalid.length) {
      alert("File size exceeds 10MB limit: " + invalid.map(f => f.name).join(", "));
      setUploadQueue((q) => q.filter((n) => !invalid.some((f) => f.name === n)));
    }
    const results = await Promise.all(valid.map(uploadFile));
    setAttachments((cur) => [...cur, ...results.filter((a): a is Attachment => !!a)]);
    setUploadQueue((q) => q.filter((n) => !valid.some((f) => f.name === n)));
  };

  const handleRemoveAttachment = (att: Attachment) => {
    setAttachments((cur) => cur.filter((a) => a.url !== att.url || a.name !== att.name));
  };

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
      attachments: [...attachments],
    }

    const assistantMsg: ChatMessage = {
      id: assistantMsgId,
      from: "assistant",
      content: "",
      avatar: "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=200&h=200&fit=crop&q=80",
      name: "AI Assistant",
      isSearching: webSearchEnabled,
      searchQuery: webSearchEnabled ? text.trim() : undefined,
    }

    setIsGenerating(true)

    let targetSessionId = activeSessionId
    if (!targetSessionId) {
      targetSessionId = createSession(userMsg)
    } else {
      addMessageToSession(targetSessionId, userMsg)
    }

    addMessageToSession(targetSessionId, assistantMsg)
    
    // Clear attachments locally
    setAttachments([])

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      let searchContext = ""
      let sourcesList: ChatSource[] = []

      if (webSearchEnabled) {
        try {
          const searchRes = await fetch(`/api/search?q=${encodeURIComponent(text.trim())}`)
          if (searchRes.ok) {
            const searchData = await searchRes.json()
            if (searchData.results && searchData.results.length > 0) {
              sourcesList = searchData.results.map((r: any) => ({
                url: r.url,
                title: r.title,
                snippet: r.snippet
              }))

              searchContext = `Here are the Google/DuckDuckGo web search results for the query "${text.trim()}":\n\n` +
                sourcesList.map((s, idx) => `[Source ${idx + 1}]: ${s.title} (${s.url})\nSnippet: ${s.snippet}\n`).join("\n") +
                `\nUsing the above search results, answer the user's query. Use markdown. Cite the sources by appending [1], [2], etc. inside your text where relevant. Tone should be casual Indonesian (gaul, santai, using slang/emoji).\n\nUser Question: `;
            }
          }
        } catch (searchErr) {
          console.error("Web search failed:", searchErr)
        }
      }

      // Update assistant message state
      updateSessionMessages(targetSessionId, (prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? { ...m, isSearching: false, sources: sourcesList }
            : m,
        ),
      )

      // Map prior messages to OpenAI format (role and content as string or array of content blocks)
      const history = messages.map((m) => {
        let mContent: any = m.content
        if (m.attachments && m.attachments.length > 0) {
          const contents: any[] = [{ type: "text", text: m.content }]
          for (const att of m.attachments) {
            if (att.contentType.startsWith("image/")) {
              contents.push({
                type: "image_url",
                image_url: { url: att.url }
              })
            } else {
              contents[0].text += `\n[Attached File: ${att.name}]`
            }
          }
          mContent = contents
        }
        return {
          role: m.from as 'user' | 'assistant',
          content: mContent,
        }
      })

      // Add last user message
      let finalUserContent: any = text.trim()
      if (searchContext) {
        finalUserContent = searchContext + finalUserContent
      }

      if (userMsg.attachments && userMsg.attachments.length > 0) {
        const contents: any[] = [{ type: "text", text: finalUserContent }]
        for (const att of userMsg.attachments) {
          if (att.contentType.startsWith("image/")) {
            contents.push({
              type: "image_url",
              image_url: { url: att.url }
            })
          } else {
            contents[0].text += `\n[Attached File: ${att.name}]`
          }
        }
        finalUserContent = contents
      }

      history.push({ role: 'user' as const, content: finalUserContent })

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
            ? { ...m, isSearching: false, content: 'Sorry, I encountered an error. Please try again.' }
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
              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                multiple
                onChange={handleFileChange}
                className="hidden"
                accept="image/*,video/*,audio/*,.pdf"
              />

              {/* Attachment Previews */}
              {(attachments.length > 0 || uploadQueue.length > 0) && (
                <div className="flex flex-row gap-3 overflow-x-auto items-end p-4 pb-2 border-b border-white/5">
                  {attachments.map((att) => (
                    <div key={att.url || att.name} className="relative group flex-shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden flex items-center justify-center">
                        {att.contentType.startsWith('image/') ? (
                          <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="text-[10px] font-mono font-semibold text-white/50 text-center p-1 truncate max-w-full">
                            {att.name.split('.').pop()?.toUpperCase() || 'FILE'}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveAttachment(att)}
                        className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center cursor-pointer shadow-sm z-10"
                      >
                        <X className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                  {uploadQueue.map((filename, idx) => (
                    <div key={idx} className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                      <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    </div>
                  ))}
                </div>
              )}

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
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                    title="Attach files"
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                    className={cn(
                      "p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent",
                      webSearchEnabled
                        ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                        : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                    )}
                    title="Web Search"
                  >
                    <Globe className="w-4 h-4" />
                  </button>
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/[0.05] border border-white/5 text-white/50 text-[11px] font-medium hover:bg-white/[0.08] cursor-pointer transition-colors">
                    <span>{MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-white/30" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { if (inputValue.trim() || attachments.length) { sendMessage(inputValue); setInputValue(""); adjustHeight(true) } }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                      (inputValue.trim() || attachments.length)
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
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto p-6 space-y-6">
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

                  {/* Attachments rendering inside user message */}
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 mt-3 pt-3 border-t border-white/5">
                      {message.attachments.map((att, i) => (
                        <div key={i} className="flex-shrink-0">
                          {att.contentType.startsWith("image/") ? (
                            <div className="rounded-xl border border-white/10 overflow-hidden max-w-[240px] max-h-[160px] bg-white/[0.02]">
                              <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 px-3 py-2 bg-white/[0.04] border border-white/10 rounded-xl text-xs text-white/70">
                              <Paperclip className="w-3.5 h-3.5 text-white/40" />
                              <span className="truncate max-w-[150px]">{att.name}</span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
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

                    {/* Active search status */}
                    {message.isSearching && (
                      <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 w-fit animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching the web for "{message.searchQuery}"...</span>
                      </div>
                    )}

                    {/* Search sources display */}
                    {message.sources && message.sources.length > 0 && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold tracking-wider text-white/30 uppercase">
                          <Globe className="w-3 h-3" />
                          <span>Sources</span>
                        </div>
                        <div className="flex flex-row gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
                          {message.sources.map((src, i) => {
                            let hostname = "";
                            try {
                              hostname = new URL(src.url).hostname;
                            } catch {
                              hostname = "Web page";
                            }
                            return (
                              <a
                                key={i}
                                href={src.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-shrink-0 w-44 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/20 p-3 transition-all cursor-pointer flex flex-col justify-between gap-2"
                              >
                                <span className="text-[11px] font-medium text-white/80 line-clamp-2 leading-snug">{src.title}</span>
                                <span className="text-[9px] font-mono text-white/40 truncate">{hostname}</span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}

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
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept="image/*,video/*,audio/*,.pdf"
            />

            {/* Attachment Previews */}
            {(attachments.length > 0 || uploadQueue.length > 0) && (
              <div className="flex flex-row gap-3 overflow-x-auto items-end p-4 pb-2 border-b border-white/5">
                {attachments.map((att) => (
                  <div key={att.url || att.name} className="relative group flex-shrink-0">
                    <div className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden flex items-center justify-center">
                      {att.contentType.startsWith('image/') ? (
                        <img src={att.url} alt={att.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-[10px] font-mono font-semibold text-white/50 text-center p-1 truncate max-w-full">
                          {att.name.split('.').pop()?.toUpperCase() || 'FILE'}
                        </div>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(att)}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-white text-black hover:bg-neutral-200 flex items-center justify-center cursor-pointer shadow-sm z-10"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
                {uploadQueue.map((filename, idx) => (
                  <div key={idx} className="w-16 h-16 rounded-xl bg-white/[0.04] border border-white/10 relative overflow-hidden flex items-center justify-center flex-shrink-0">
                    <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                  </div>
                ))}
              </div>
            )}

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
                  onClick={() => fileInputRef.current?.click()}
                  className="p-1.5 hover:bg-white/[0.06] rounded-lg transition-colors text-white/40 hover:text-white/80 cursor-pointer"
                  title="Attach files"
                >
                  <PlusIcon className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setWebSearchEnabled(!webSearchEnabled)}
                  className={cn(
                    "p-1.5 rounded-lg transition-colors cursor-pointer border border-transparent",
                    webSearchEnabled
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25"
                      : "text-white/40 hover:text-white/80 hover:bg-white/[0.06]"
                  )}
                  title="Web Search"
                >
                  <Globe className="w-4 h-4" />
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
                      if (inputValue.trim() || attachments.length) {
                        sendMessage(inputValue);
                        setInputValue("");
                        adjustHeight(true);
                      }
                    }}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md",
                      (inputValue.trim() || attachments.length)
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
