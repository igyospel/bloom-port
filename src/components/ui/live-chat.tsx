import { useState, useRef, useCallback, useEffect, type KeyboardEvent } from "react"
import { ArrowUpIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { isConfigured, streamChatMessage } from "@/lib/openrouter"
import { MarkdownRenderer } from "@/components/ui/markdown-renderer"

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

// ── message types ─────────────────────────────────────────────────────────────
type LiveMessage = {
  id: string
  from: "user" | "assistant"
  content: string
}

// ── LiveChat: simple anonymous chat for the landing page ──────────────────────
function LiveChat() {
  const [messages, setMessages] = useState<LiveMessage[]>([])
  const [inputValue, setInputValue] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [configError, setConfigError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 160 })

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    if (!isConfigured()) {
      setConfigError("OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your .env file.")
      return
    }
    setConfigError(null)

    setIsGenerating(true)
    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `assistant-${Date.now()}`

    setMessages((prev) => [
      ...prev,
      { id: userMsgId, from: "user", content: text.trim() },
      { id: assistantMsgId, from: "assistant", content: "" },
    ])
    setInputValue("")
    adjustHeight(true)

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      const history = messages.map((m) => ({
        role: m.from as 'user' | 'assistant',
        content: m.content,
      }))
      history.push({ role: 'user' as const, content: text.trim() })

      let accumulated = ''
      for await (const chunk of streamChatMessage(history, abortController.signal)) {
        accumulated += chunk
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsgId ? { ...m, content: accumulated } : m,
          ),
        )
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return
      setMessages((prev) =>
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
      if (inputValue.trim()) sendMessage(inputValue)
    }
  }

  // ── EMPTY STATE ─────────────────────────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-8">
        <h2 className="text-2xl sm:text-[28px] font-bold text-white mb-6 tracking-tight text-center">
          live chat bro
        </h2>          <p className="text-sm text-white/40 mb-8 text-center max-w-sm">
            Send a message anonymously. No accounts, no tracking — just a moment of connection.
          </p>

          {configError && (
            <p className="mb-4 text-xs text-red-400 text-center max-w-lg mx-auto">
              {configError}
            </p>
          )}

          <div className="w-full max-w-lg">
          <div className="relative bg-white/5 rounded-xl border border-white/10 backdrop-blur-md">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => { setInputValue(e.target.value); adjustHeight() }}
              onKeyDown={handleKeyDown}
              placeholder="Type a message..."
              className={cn(
                "w-full px-4 py-3",
                "resize-none bg-transparent border-none",
                "text-white text-[15px]",
                "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                "placeholder:text-white/30",
                "min-h-[52px]",
              )}
              style={{ overflow: "hidden" }}
            />
            <div className="flex items-center justify-end px-3 py-2 border-t border-white/5">
              <button
                type="button"
                onClick={() => sendMessage(inputValue)}
                className={cn(
                  "p-1.5 rounded-lg border transition-colors flex items-center justify-center",
                  inputValue.trim()
                    ? "bg-white border-white text-black hover:bg-neutral-200"
                    : "border-white/20 text-white/30 cursor-not-allowed",
                )}
              >
                <ArrowUpIcon className="w-4 h-4" />
                <span className="sr-only">Send</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── CONVERSATION STATE ──────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex flex-col gap-1 max-w-[85%]",
              msg.from === "user" ? "ml-auto items-end" : "items-start",
            )}
          >
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30">
              {msg.from === "user" ? "You" : "Bloomport"}
            </span>
            <div
              className={cn(
                "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                msg.from === "user"
                  ? "bg-white/10 text-white rounded-br-md"
                  : "bg-white/5 text-white/90 rounded-bl-md border border-white/10",
              )}
            >
              <MarkdownRenderer content={msg.content} />
            </div>
          </div>
        ))}
        {isGenerating && (
          <div className="flex items-start gap-2 max-w-[85%]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-white/30 mt-1">
              Bloomport
            </span>
            <div className="bg-white/5 rounded-2xl rounded-bl-md border border-white/10 px-4 py-2.5">
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 rounded-full bg-white/40 animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 px-4 py-3">
        <div className="relative bg-white/5 rounded-xl border border-white/10">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); adjustHeight() }}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className={cn(
              "w-full px-4 py-3 pr-12",
              "resize-none bg-transparent border-none",
              "text-white text-[15px]",
              "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
              "placeholder:text-white/30",
              "min-h-[52px]",
            )}
            style={{ overflow: "hidden" }}
          />
          <button
            type="button"
            onClick={() => sendMessage(inputValue)}
            className={cn(
              "absolute right-2 bottom-2 p-1.5 rounded-lg border transition-colors flex items-center justify-center",
              inputValue.trim()
                ? "bg-white border-white text-black hover:bg-neutral-200"
                : "border-white/20 text-white/30 cursor-not-allowed",
            )}
          >
            <ArrowUpIcon className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export { LiveChat }
