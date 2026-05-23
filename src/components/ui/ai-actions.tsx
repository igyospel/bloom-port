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
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { Action, Actions } from "@/components/ui/actions"
import {
  Conversation,
  ConversationContent,
} from "@/components/ui/conversation"
import { Message, MessageContent } from "@/components/ui/message"
import { PureMultimodalInput, type Attachment } from "./multimodal-ai-chat-input"
import { isConfigured, streamChatMessage } from "@/lib/openrouter"

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
      className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-full border border-white/10 text-white/50 hover:text-white/90 transition-colors"
    >
      {icon}
      <span className="text-xs">{label}</span>
    </button>
  )
}

// ── message types ─────────────────────────────────────────────────────────────
type ChatMessage = {
  id: string
  from: "user" | "assistant"
  content: string
  avatar: string
  name: string
}

// ── main component ────────────────────────────────────────────────────────────
const Example = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [landingValue, setLandingValue] = useState("")
  const [configError, setConfigError] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 60, maxHeight: 200 })

  const sendMessage = async (text: string) => {
    if (!text.trim()) return

    if (!isConfigured()) {
      setConfigError("OpenRouter API key not configured. Add VITE_OPENROUTER_API_KEY to your .env file.")
      return
    }
    setConfigError(null)

    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `assistant-${Date.now()}`

    setIsGenerating(true)
    setMessages((prev) => [
      ...prev,
      {
        id: userMsgId,
        from: "user",
        content: text.trim(),
        avatar:
          "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=200&h=200&fit=crop&q=80",
        name: "User",
      },
      {
        id: assistantMsgId,
        from: "assistant",
        content: "",
        avatar:
          "https://images.unsplash.com/photo-1544256718-3bcf237f3974?w=200&h=200&fit=crop&q=80",
        name: "AI Assistant",
      },
    ])

    const abortController = new AbortController()
    abortRef.current = abortController

    try {
      // Build message history for context
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

  const handleLandingKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (landingValue.trim()) {
        sendMessage(landingValue)
        setLandingValue("")
        adjustHeight(true)
      }
    }
  }

  const stopGenerating = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  const messageActions = [
    { icon: RefreshCcwIcon, label: "Retry" },
    { icon: ThumbsUpIcon, label: "Like" },
    { icon: ThumbsDownIcon, label: "Dislike" },
    { icon: CopyIcon, label: "Copy" },
    { icon: ShareIcon, label: "Share" },
  ]

  const quickActions = [
    { icon: <ImageIcon className="w-4 h-4" />, label: "Clone a Screenshot" },
    { icon: <Wand2 className="w-4 h-4" />, label: "Import from Figma" },
    { icon: <FileUp className="w-4 h-4" />, label: "Upload a Project" },
    { icon: <MonitorIcon className="w-4 h-4" />, label: "Landing Page" },
    { icon: <CircleUserRound className="w-4 h-4" />, label: "Sign Up Form" },
  ]

  // ── EMPTY STATE — v0-style landing ──────────────────────────────────────────
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 w-full px-4 py-12 fade-in-up">
        <h1 className="font-display text-[42px] md:text-[52px] font-bold text-white mb-10 tracking-tight leading-[1.1] text-center">
          Agentic Chat
        </h1>

        {/* Input card */}
        <div className="w-full max-w-2xl">
          <div className="relative bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="overflow-y-auto">
              <Textarea
                ref={textareaRef}
                value={landingValue}
                onChange={(e) => { setLandingValue(e.target.value); adjustHeight() }}
                onKeyDown={handleLandingKeyDown}
                placeholder="Ask anything..."
                className={cn(
                  "w-full px-5 py-4",
                  "resize-none bg-transparent border-none",
                  "text-white text-[15px]",
                  "focus:outline-none focus-visible:ring-0 focus-visible:ring-offset-0",
                  "placeholder:text-white/30",
                  "min-h-[60px]",
                )}
                style={{ overflow: "hidden" }}
              />
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-white/5">
              <button
                type="button"
                className="group p-2 hover:bg-white/10 rounded-lg transition-colors flex items-center gap-1 text-white/40 hover:text-white/80"
              >
                <Paperclip className="w-4 h-4" />
                <span className="text-xs hidden group-hover:inline transition-opacity">Attach</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="px-2 py-1 rounded-lg text-sm text-white/40 border border-dashed border-white/20 hover:border-white/40 hover:bg-white/5 flex items-center gap-1 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  Project
                </button>
                <button
                  type="button"
                  onClick={() => { sendMessage(landingValue); setLandingValue(""); adjustHeight(true) }}
                  className={cn(
                    "p-1.5 rounded-lg border transition-colors flex items-center justify-center",
                    landingValue.trim()
                      ? "bg-[#FAE3B9] border-[#FAE3B9] text-black hover:bg-[#FAE3B9]/90"
                      : "border-white/20 text-white/30 cursor-not-allowed",
                  )}
                >
                  <ArrowUpIcon className="w-4 h-4" />
                  <span className="sr-only">Send</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick-action pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {quickActions.map((a) => (
              <ActionButton
                key={a.label}
                icon={a.icon}
                label={a.label}
                onClick={() => { sendMessage(a.label); }}
              />
            ))}
          </div>

          {configError && (
            <p className="mt-3 text-xs text-red-400 text-center max-w-md mx-auto">
              {configError}
            </p>
          )}
        </div>
      </div>
    )
  }

  // ── CONVERSATION STATE ───────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      <Conversation className="relative w-full flex-grow">
        <ConversationContent className="max-w-2xl mx-auto w-full">
          {messages.map((message) => (
            <Message
              className={`flex flex-col gap-2 ${message.from === "assistant" ? "items-start" : "items-end"}`}
              from={message.from}
              key={message.id}
            >
              <img
                src={message.avatar}
                alt={message.name}
                width={32}
                height={32}
                className="h-8 w-8 rounded-full object-cover shadow-sm border border-white/10"
              />
              <MessageContent>{message.content}</MessageContent>
              {message.from === "assistant" && (
                <Actions className="mt-2">
                  {messageActions.map((action) => (
                    <Action key={action.label} label={action.label}>
                      <action.icon className="size-4" />
                    </Action>
                  ))}
                </Actions>
              )}
            </Message>
          ))}
        </ConversationContent>
      </Conversation>

      <div className="border-t border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-2xl mx-auto w-full px-4 py-4">
          <PureMultimodalInput
            chatId="bloomport-chat"
            messages={messages.map((m) => ({ id: m.id, content: m.content, role: m.from }))}
            attachments={attachments}
            setAttachments={setAttachments}
            onSendMessage={({ input }) => sendMessage(input)}
            onStopGenerating={stopGenerating}
            isGenerating={isGenerating}
            canSend={true}
            selectedVisibilityType="private"
          />
        </div>
      </div>
    </div>
  )
}

export { Example }
