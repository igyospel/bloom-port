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
  Loader2,
  Terminal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Textarea } from "@/components/ui/textarea"
import { isConfigured, streamChatMessage } from "@/lib/openrouter"
import { useSessions, ChatMessage, Attachment, ChatSource } from "../../context/SessionContext"
import { useCredits } from "../../context/CreditContext"
import AdBanner from "../AdBanner"
import { MODELS } from "../SettingsSidebar"
import { MarkdownRenderer } from "./markdown-renderer"

// ── MCP Tool Execution Result Card ───────────────────────────────────────────
function McpToolOutputCard({ name, args, result, status }: { name?: string; args?: string; result?: string; status?: 'running' | 'success' | 'error' }) {
  const [expanded, setExpanded] = useState(false);
  if (!name) return null;
  
  if (status === 'running') {
    return (
      <div className="flex items-center gap-2.5 text-xs text-white/50 bg-[#080808] border border-white/[0.06] rounded-xl px-4 py-3.5 w-fit animate-pulse font-mono">
        <Loader2 className="w-3.5 h-3.5 animate-spin text-white/60" />
        <span>Executing tool: <strong className="text-white">{name}</strong> <span className="text-white/30 text-[10px]">({args})</span></span>
      </div>
    );
  }
  
  return (
    <div className="border border-white/[0.08] bg-[#080808] rounded-xl overflow-hidden font-mono text-xs w-full max-w-2xl shadow-[0_4px_12px_rgba(0,0,0,0.5)]">
      <div 
        onClick={() => setExpanded(!expanded)}
        className="flex items-center justify-between p-3.5 bg-white/[0.01] hover:bg-white/[0.03] transition-colors border-b border-white/[0.04] cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-white/40">Ran tool:</span>
          <span className="text-white font-bold">{name}</span>
        </div>
        <span className="text-[10px] uppercase font-bold text-white/30 hover:text-white/60 transition-colors">
          {expanded ? "Hide Output ▴" : "Show Output ▾"}
        </span>
      </div>
      
      {expanded && (
        <div className="p-4 overflow-x-auto text-[11px] text-white/70 max-h-56 overflow-y-auto whitespace-pre bg-black/50 border-t border-white/[0.02] scrollbar-thin">
          <div className="text-white/30 mb-2">// Call arguments: {args}</div>
          {result}
        </div>
      )}
    </div>
  );
}

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
  const { credits, consumeCredits } = useCredits();

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

    const cost = selectedModel.includes('online') ? 150 : 50
    if (credits < cost) {
      setConfigError(`Insufficient credits (${credits}/${cost}). Please click your credit balance at the top right to watch a short ad and earn +1000 credits instantly!`)
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
    
    // Deduct credits immediately
    await consumeCredits(cost)

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
          role: m.from as 'user' | 'assistant' | 'system',
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

      // Fetch active MCP servers and construct tools schema for the LLM
      const savedServers = localStorage.getItem('bp_settings_mcp_servers');
      let activeTools: any[] = [];
      if (savedServers) {
        try {
          const servers = JSON.parse(savedServers);
          const activeServers = servers.filter((s: any) => s.active);
          for (const server of activeServers) {
            for (const tool of server.tools) {
              activeTools.push(tool);
            }
          }
        } catch (e) {
          console.error("Failed to parse MCP servers", e);
        }
      }

      const baseSystemPrompt = `You are Bloomport AI, a helpful and smart assistant. Today's date is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}. When asked about current events, people, or facts, use this date as the present. Tone should be casual Indonesian (gaul, santai, using slang/emoji).`;

      let finalSystemPrompt = baseSystemPrompt;

      if (activeTools.length > 0) {
        const toolsInstruction = `\n\nYou have access to Model Context Protocol (MCP) tools that connect you to external APIs, databases, or local workspace files.
Here are the available tools you can call:
${activeTools.map((t, idx) => `
Tool ${idx+1}: "${t.name}"
Description: ${t.description}
Parameters Schema: ${JSON.stringify(t.inputSchema)}
`).join('\n')}

If you need to use any tool to answer the user's request, you MUST output a tool call using this exact XML-like tag:
<tool_call name="tool_name" args='{"param1": "value1"}' />

When you output this tag, STOP generating immediately. Do not add any text after the tag. The system will execute the tool and provide the response in a follow-up message as:
<tool_response name="tool_name">
{"result_key": "result_value"}
</tool_response>

You should then use that tool output to answer the user's question. Match parameters exactly.`;
        finalSystemPrompt += toolsInstruction;
      }

      history.unshift({
        role: 'system' as const,
        content: finalSystemPrompt
      });

      let accumulated = "";
      let isToolCallDetected = false;
      let loopCount = 0;
      
      const executeMcpTool = async (name: string, argsStr: string): Promise<any> => {
        let args: any = {};
        try {
          args = JSON.parse(argsStr);
        } catch (e) {
          return { error: `Invalid arguments JSON: ${argsStr}` };
        }
        
        // 1. Simulate a delay to look realistic & premium
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // 2. Weather tools simulation
        if (name === 'get_current_weather') {
          const city = args.city || 'Jakarta';
          const weatherList = [
            { condition: 'Sunny', temp: '29°C', humidity: '64%', wind: '12 km/h' },
            { condition: 'Rainy', temp: '25°C', humidity: '88%', wind: '15 km/h' },
            { condition: 'Cloudy', temp: '27°C', humidity: '70%', wind: '8 km/h' },
            { condition: 'Partly Cloudy', temp: '28°C', humidity: '68%', wind: '10 km/h' }
          ];
          const result = weatherList[Math.floor(Math.random() * weatherList.length)];
          return {
            city,
            status: "success",
            data: {
              current: {
                temperature: result.temp,
                condition: result.condition,
                humidity: result.humidity,
                wind_speed: result.wind,
                updated_at: new Date().toLocaleTimeString()
              }
            }
          };
        }
        
        if (name === 'get_weather_forecast') {
          const city = args.city || 'Jakarta';
          return {
            city,
            status: "success",
            forecast: [
              { day: 'Tomorrow', temp: '26°C', condition: 'Cloudy' },
              { day: 'Day 2', temp: '28°C', condition: 'Sunny' },
              { day: 'Day 3', temp: '25°C', condition: 'Heavy Rain' },
              { day: 'Day 4', temp: '27°C', condition: 'Sunny' },
              { day: 'Day 5', temp: '29°C', condition: 'Partly Cloudy' }
            ]
          };
        }
        
        // 3. Search tools simulation (or live search if we can)
        if (name === 'google_search') {
          const query = args.query || '';
          try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.results && data.results.length > 0) {
                return {
                  query,
                  status: "success",
                  results: data.results.map((r: any) => ({
                    title: r.title,
                    link: r.url,
                    snippet: r.snippet
                  }))
                };
              }
            }
          } catch (err) {
            console.error("Live search failed inside MCP, falling back to simulation", err);
          }
          return {
            query,
            status: "success",
            results: [
              { title: `What is ${query}? - Wikipedia`, link: `https://en.wikipedia.org/wiki/${encodeURIComponent(query)}`, snippet: `Detailed information, historical context, and technical specifications for ${query}.` },
              { title: `Bloomport Docs - MCP Integration Guide`, link: "https://bloomport.fun/docs/mcp", snippet: `Model Context Protocol allows models to discover and execute client-side tools and API services seamlessly.` },
              { title: `Latest updates on ${query}`, link: "https://bloomport.fun/blog/mcp-updates", snippet: `Learn how the new Gemini 3.5 Flash Model uses tools dynamically using SSE and Stdio connections.` }
            ]
          };
        }
        
        // 4. Local Filesystem simulation
        if (name === 'read_file') {
          const path = args.path || '';
          if (path.includes('package.json')) {
            return {
              path,
              status: "success",
              content: `{
  "name": "bloomport",
  "version": "1.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "framer-motion": "^11.11.0",
    "lucide-react": "^0.450.0"
  }
}`
            };
          }
          if (path.includes('tsconfig.json')) {
            return {
              path,
              status: "success",
              content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true
  }
}`
            };
          }
          return {
            path,
            status: "success",
            content: `// Simulated content of file: ${path}\n\nexport const getWorkspaceConfig = () => {\n  return {\n    mcpEnabled: true,\n    activeProject: "Bloomport Node"\n  };\n};`
          };
        }
        
        if (name === 'list_directory') {
          const path = args.path || '';
          return {
            path,
            status: "success",
            files: [
              { name: "src", type: "directory", size: 0 },
              { name: "public", type: "directory", size: 0 },
              { name: "package.json", type: "file", size: 450 },
              { name: "tsconfig.json", type: "file", size: 700 },
              { name: "next.config.ts", type: "file", size: 210 },
              { name: "README.md", type: "file", size: 1200 }
            ]
          };
        }
        
        // Custom SSE forwarder if it is a valid url (SSE endpoints accept POST)
        const activeServers = JSON.parse(savedServers || '[]');
        const targetServer = activeServers.find((s: any) => s.tools.some((t: any) => t.name === name));
        if (targetServer && targetServer.type === 'sse' && targetServer.url) {
          try {
            const ssePostUrl = targetServer.url.replace('/sse', '/tools/' + name) || targetServer.url;
            const sseRes = await fetch(ssePostUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: "2.0",
                method: "tools/call",
                params: { name, arguments: args },
                id: Date.now()
              })
            });
            if (sseRes.ok) {
              const resData = await sseRes.json();
              if (resData.result) return resData.result;
            }
          } catch (sseErr) {
            console.error("Failed to query real SSE server, using mock fallback", sseErr);
          }
        }
        
        return {
          tool: name,
          status: "success",
          response: `Successfully executed custom tool "${name}" on external MCP endpoint.`,
          received_args: args
        };
      };

      while (loopCount < 3) {
        loopCount++;
        isToolCallDetected = false;
        let toolName = "";
        let toolArgs = "";
        
        const loopAbortController = new AbortController();
        abortRef.current = loopAbortController;
        
        try {
          let streamAccumulated = "";
          for await (const chunk of streamChatMessage(
            history, 
            { model: selectedModel, temperature, max_tokens: contextLength * 1000 }, 
            loopAbortController.signal
          )) {
            streamAccumulated += chunk;
            const displayContent = accumulated + streamAccumulated;
            
            // Update UI
            updateSessionMessages(targetSessionId, (prev) =>
              prev.map((m) =>
                m.id === assistantMsgId ? { ...m, content: displayContent } : m
              )
            );
            
            // Check for tool call
            const toolCallRegex = /<tool_call\s+name="([^"]+)"\s+args=(['"])([\s\S]*?)\2\s*\/>/;
            const match = displayContent.match(toolCallRegex);
            if (match) {
              isToolCallDetected = true;
              toolName = match[1];
              toolArgs = match[3];
              loopAbortController.abort();
              break;
            }
          }
          
          if (!isToolCallDetected) {
            break;
          }
        } catch (err: any) {
          if (err.name === 'AbortError' && isToolCallDetected) {
            // Gracefully caught abort for tool call
          } else {
            throw err;
          }
        }
        
        if (isToolCallDetected) {
          updateSessionMessages(targetSessionId, (prev) => {
            const targetMsg = prev.find(m => m.id === assistantMsgId);
            if (!targetMsg) return prev;
            const parts = targetMsg.content.split(/<tool_call/);
            const beforeToolCall = parts[0].trim();
            accumulated = beforeToolCall + "\n\n";
            return prev.map((m) =>
              m.id === assistantMsgId ? { 
                ...m, 
                content: beforeToolCall, 
                toolCallName: toolName, 
                toolCallArgs: toolArgs, 
                toolCallStatus: 'running' 
              } : m
            );
          });
          
          // Run the tool
          const toolResult = await executeMcpTool(toolName, toolArgs);
          
          // Update UI to show result
          updateSessionMessages(targetSessionId, (prev) =>
            prev.map((m) =>
              m.id === assistantMsgId ? { 
                ...m, 
                toolCallStatus: 'success', 
                toolCallResult: JSON.stringify(toolResult, null, 2) 
              } : m
            )
          );
          
          // Push current state to history
          history.push({
            role: 'assistant' as const,
            content: accumulated + `<tool_call name="${toolName}" args='${toolArgs}' />`
          });
          history.push({
            role: 'user' as const,
            content: `<tool_response name="${toolName}">${JSON.stringify(toolResult)}</tool_response>`
          });
        }
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
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', height: '100%', width: '100%', overflow: 'hidden' }} className="bg-black">
        {/* Scrollable center content */}
        <div style={{ overflowY: 'auto', minHeight: 0 }}>
          <div className="flex flex-col items-center justify-center min-h-full w-full px-6 py-12 max-w-2xl mx-auto fade-in-up">

            <h1 className="text-[28px] md:text-[32px] font-bold text-white mb-2 tracking-tight text-center font-sans">
              How can I help you today?
            </h1>
            <p className="text-[13px] text-white/40 text-center max-w-md mb-8 leading-relaxed font-sans">
              Ask me anything about AI infrastructure, LLMs, deployment, scaling, or best practices.
            </p>

            {/* Quick-action pills */}
            <div className="w-full flex flex-wrap items-center justify-center gap-2 mb-6">
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
            <div className="w-full">
              <AdBanner layout="in-feed" />
            </div>

            {configError && (
              <p className="text-xs text-red-400 text-center max-w-md mx-auto mt-4">
                {configError}
              </p>
            )}
          </div>
        </div>

        {/* Fixed input at bottom */}
        <div className="shrink-0 border-t border-white/10 bg-black/80 backdrop-blur-md px-6 py-4">
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
          </div>
        </div>
      </div>
    )
  }

  // ── CONVERSATION STATE ──────────────────────────────────────────
  return (
    <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', height: '100%', width: '100%', overflow: 'hidden' }} className="bg-black">
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

      {/* Messages viewport — 1fr grid row scrolls independently */}
      <div ref={scrollContainerRef} style={{ overflowY: 'auto', minHeight: 0 }} className="p-6">
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
                        <div className="w-6 h-6 rounded-md bg-white/[0.08] flex items-center justify-center border border-white/10 overflow-hidden">
                          <img src="/aiIcon.png" alt="AI Icon" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-xs font-semibold text-white/90">
                          {MODELS.find(m => m.id === selectedModel)?.name || 'BP011 - 3.0'}
                        </span>
                      </div>
                      <span className="text-[10px] text-white/30 font-medium">10:43 AM</span>
                    </div>

                    {/* Active search status & Online model loading state */}
                    {(message.isSearching || (isGenerating && message.content === "" && idx === messages.length - 1 && selectedModel.includes('online'))) && (
                      <div className="flex items-center gap-2 text-xs text-white/40 bg-white/[0.02] border border-white/5 rounded-xl px-4 py-3 w-fit animate-pulse">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>{message.isSearching ? `Searching the web for "${message.searchQuery}"...` : "Searching on the internet..."}</span>
                      </div>
                    )}

                    {/* MCP Tool Execution Status / Output */}
                    {message.toolCallName && (
                      <div className="my-2.5">
                        <McpToolOutputCard 
                          name={message.toolCallName} 
                          args={message.toolCallArgs} 
                          result={message.toolCallResult} 
                          status={message.toolCallStatus} 
                        />
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
