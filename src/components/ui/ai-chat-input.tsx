"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Command, CommandInput, CommandList, CommandItem, CommandGroup } from "@/components/ui/command"
import {
  Send,
  StopCircle,
  Smile,
  Trash2,
  Wand2,
  Languages,
  BookOpen,
} from "lucide-react"

const COMMANDS = [
  { id: "summarize", label: "Summarize", icon: <Wand2 className="h-3.5 w-3.5" /> },
  { id: "translate", label: "Translate", icon: <Languages className="h-3.5 w-3.5" /> },
  { id: "explain", label: "Explain", icon: <BookOpen className="h-3.5 w-3.5" /> },
]

const EMOJIS = ["😀", "🚀", "🔥", "✨", "❤️", "👍", "🤔", "🎉"]

export default function AiChatInput({
  onSendMessage,
  isLoading = false,
}: {
  onSendMessage: (message: string) => void
  isLoading?: boolean
}) {
  const [input, setInput] = useState("")
  const [selectedCommands, setSelectedCommands] = useState<string[]>([])
  const [emojiOpen, setEmojiOpen] = useState(false)
  const [commandOpen, setCommandOpen] = useState(false)

  const handleSubmit = () => {
    if (!input.trim() && selectedCommands.length === 0) return
    const finalMessage =
      (selectedCommands.map((cmd) => `/${cmd}`).join(" ") + " " + input).trim()
    onSendMessage(finalMessage)
    setInput("")
    setSelectedCommands([])
    setCommandOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
    if (e.key === "/" && !commandOpen) {
      e.preventDefault()
      setCommandOpen(true)
    }
  }

  const addCommand = (cmd: string) => {
    if (!selectedCommands.includes(cmd)) {
      setSelectedCommands((prev) => [...prev, cmd])
    }
    setCommandOpen(false)
  }

  const removeCommand = (cmd: string) => {
    setSelectedCommands((prev) => prev.filter((c) => c !== cmd))
  }

  const addEmoji = (emoji: string) => {
    setInput((prev) => prev + emoji)
    setEmojiOpen(false)
  }

  return (
    <div className="w-full bg-transparent rounded-b-2xl">
      <div className="flex items-center justify-center gap-2 p-3">
        {/* Input & Commands */}
        <div className="flex flex-col flex-1 gap-2">
          {/* Selected Commands as tags */}
          {selectedCommands.length > 0 && (
            <div className="flex flex-wrap gap-1 px-1">
              {selectedCommands.map((cmd) => {
                const c = COMMANDS.find((c) => c.id === cmd)
                return (
                  <Badge
                    key={cmd}
                    variant="secondary"
                    className="flex items-center gap-1 cursor-pointer"
                    onClick={() => removeCommand(cmd)}
                  >
                    {c?.icon} {c?.label}
                  </Badge>
                )
              })}
            </div>
          )}

          {/* Text Input with Slash Command Popover */}
          <Popover open={commandOpen} onOpenChange={setCommandOpen}>
            <PopoverTrigger asChild>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message... (press '/' for commands)"
                className="resize-none min-h-[44px] max-h-[200px] rounded-xl px-4 py-3 text-sm border-0 focus-visible:ring-0 shadow-none bg-white/5 text-white placeholder:text-white/40"
              />
            </PopoverTrigger>
            <PopoverContent className="p-0 w-56 border-white/10 bg-neutral-900 text-white shadow-xl">
              <Command className="bg-transparent">
                <CommandInput placeholder="Search command..." className="border-white/10 text-white placeholder:text-white/40" />
                <CommandList>
                  <CommandGroup heading="Commands" className="text-white/50 [&_[cmdk-group-heading]]:text-white/50">
                    {COMMANDS.map((cmd) => (
                      <CommandItem
                        key={cmd.id}
                        onSelect={() => addCommand(cmd.id)}
                        className="data-[selected=true]:bg-white/10 data-[selected=true]:text-white cursor-pointer"
                      >
                        {cmd.icon} {cmd.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Extra Actions */}
        <div className="flex items-center gap-1">
          {/* Emoji Picker */}
          <Popover open={emojiOpen} onOpenChange={setEmojiOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Smile className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="grid grid-cols-4 gap-2 w-40 p-2 border-white/10 bg-neutral-900 shadow-xl rounded-xl">
              {EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addEmoji(emoji)}
                  className="text-lg hover:scale-110 transition cursor-pointer"
                >
                  {emoji}
                </button>
              ))}
            </PopoverContent>
          </Popover>

          {/* Clear Input */}
          {input && (
            <Button variant="ghost" size="icon" onClick={() => setInput("")} className="text-muted-foreground hover:text-foreground">
              <Trash2 className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Send / Stop */}
        <Button
          onClick={handleSubmit}
          disabled={!input.trim() && selectedCommands.length === 0 && !isLoading}
          size="icon"
          className="rounded-full bg-white text-black hover:bg-neutral-200 shrink-0"
        >
          {isLoading ? <StopCircle className="h-5 w-5" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  )
}
