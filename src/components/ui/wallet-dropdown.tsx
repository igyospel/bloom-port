import { useState, useCallback, useRef, useEffect, type ChangeEvent, type ReactNode } from "react"
import {
  CopyIcon,
  CheckIcon,
  LogOutIcon,
  UserIcon,
  CircleUserRound,
  ArrowRightIcon,
  CameraIcon,
  Wallet,
  ChevronDown,
  Unplug,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type WalletDropdownProps = {
  variant: "landing" | "app"
}

export function WalletDropdown({ variant }: WalletDropdownProps) {
  const { user, logout, updateUserPfp } = useAuth()
  const connected = !!user
  const shortAddress = user ? user.name : null
  const fullAddress = user ? user.email : ""
  
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Cleanup copy timeout on unmount
  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    }
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  const handleCopy = useCallback(async () => {
    if (!user) return
    try {
      await navigator.clipboard.writeText(user.email)
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      console.warn("Failed to copy email")
    }
  }, [user])

  const connect = useCallback(() => {
    window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'signin' }));
  }, [])

  const fileInputRef = useRef<HTMLInputElement>(null)

  const handlePfpUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user) return

    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      updateUserPfp(url)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }, [user, updateUserPfp])

  const triggerPfpUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const isLanding = variant === "landing"

  // ── NOT CONNECTED ─────────────────────────────────────────────────────
  if (!connected || !shortAddress) {
    return null
  }

  // ── CONNECTED ─────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      <ConnectedTrigger
        open={open}
        onToggle={() => setOpen(!open)}
        isLanding={isLanding}
        shortAddress={shortAddress}
        pfpUrl={user ? user.avatarUrl : null}
      />

      {open && (
        <ConnectedDropdown
          isLanding={isLanding}
          shortAddress={shortAddress}
          fullAddress={fullAddress}
          pfpUrl={user ? user.avatarUrl : null}
          copied={copied}
          onCopy={handleCopy}
          onPfpUpload={triggerPfpUpload}
          onRemovePfp={() => {
            if (!user) return
            // Revert to default pfp
            updateUserPfp("https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&q=80")
          }}
          onProfile={() => setOpen(false)}
          onDisconnect={() => {
            setOpen(false)
            logout()
            window.dispatchEvent(new CustomEvent('bloomport-navigate', { detail: 'landing' }));
          }}
        />
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/gif"
        onChange={handlePfpUpload}
        className="hidden"
        aria-hidden
      />
    </div>
  )
}

/* ================================================================== */
// CONNECT/LOGIN BUTTON (not connected)
function ConnectButton({ connect, isLanding }: { connect: () => void; isLanding: boolean }) {
  return (
    <button
      onClick={connect}
      className={cn(
        "group relative overflow-hidden rounded-full px-5 py-2.5 sm:px-6 sm:py-3",
        "flex items-center gap-2.5 text-sm font-semibold tracking-tight",
        "transition-all duration-300 cursor-pointer",
        isLanding
          ? "text-white"
          : "text-white"
      )}
    >
      {/* Animated gradient border */}
      <div
        className={cn(
          "absolute inset-0 rounded-full opacity-100 transition-opacity duration-300",
          isLanding
            ? "bg-gradient-to-r from-black via-zinc-500 to-black"
            : "bg-gradient-to-r from-white/30 via-white/60 to-white/30"
        )}
        style={{ padding: '1.5px' }}
      >
        <div className={cn(
          "w-full h-full rounded-full",
          isLanding ? "bg-brand-dark" : "bg-[#0a0a0a]"
        )} />
      </div>

      {/* Shimmer animation overlay */}
      <div
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: isLanding
            ? 'linear-gradient(90deg, transparent, rgba(0,0,0,0.08), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      />

      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
          isLanding ? "bg-black/10" : "bg-white/10"
        )}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2.5">
        <span
          className={cn(
            "relative flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 group-hover:scale-110",
            isLanding ? "bg-black/10" : "bg-white/10"
          )}
        >
          <CircleUserRound className={cn("w-3.5 h-3.5", isLanding ? "text-zinc-800" : "text-white/70")} />
        </span>
        <span>Log In</span>
        <ArrowRightIcon
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-0.5",
            isLanding ? "text-white/70" : "text-white/50"
          )}
        />
      </span>
    </button>
  )
}

/* ================================================================== */
// CONNECTED TRIGGER BUTTON
function ConnectedTrigger({
  open,
  onToggle,
  isLanding,
  shortAddress,
  pfpUrl,
}: {
  open: boolean
  onToggle: () => void
  isLanding: boolean
  shortAddress: string
  pfpUrl: string | null
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-full pl-1.5 pr-3.5 py-1.5",
        "transition-all duration-300 cursor-pointer",
        isLanding
          ? "bg-transparent hover:opacity-80"
          : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] hover:border-white/20"
      )}
    >
      {/* Avatar with status ring */}
      <div className="relative">
        <Avatar
          className={cn(
            "h-7 w-7 ring-2 transition-all duration-300",
            isLanding ? "ring-black/15" : "ring-white/15",
            open && (isLanding ? "ring-black/30" : "ring-white/30")
          )}
        >
          {pfpUrl ? <AvatarImage src={pfpUrl} alt="Profile" /> : null}
          <AvatarFallback
            className={cn(
              "text-[10px] font-bold",
              isLanding ? "bg-gray-100 text-gray-500" : "bg-white/10 text-white/50"
            )}
          >
            <CircleUserRound className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        {/* Online dot */}
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0a0a0a]" />
      </div>

      {/* Display Name */}
      {/* Chevron */}
      <ChevronDown
        className={cn(
          "w-3.5 h-3.5 transition-transform duration-300",
          isLanding ? "text-black/60" : "text-white/30",
          open && "rotate-180"
        )}
      />
    </button>
  )
}

/* ================================================================== */
// CONNECTED DROPDOWN MENU
function ConnectedDropdown({
  isLanding,
  shortAddress,
  fullAddress,
  pfpUrl,
  copied,
  onCopy,
  onPfpUpload,
  onRemovePfp,
  onProfile,
  onDisconnect,
}: {
  isLanding: boolean
  shortAddress: string
  fullAddress: string
  pfpUrl: string | null
  copied: boolean
  onCopy: () => void
  onPfpUpload: () => void
  onRemovePfp: () => void
  onProfile: () => void
  onDisconnect: () => void
}) {
  // Always use the sleek dark theme card style to match the website design
  const cardIsLanding = false;

  return (
    <div
      className={cn(
        "absolute right-0 top-full mt-2.5 w-60 rounded-2xl py-2 z-50",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        "bg-[#111111] border border-white/10 shadow-xl shadow-black/40"
      )}
    >
      {/* Identity header */}
      <div className="px-4 py-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <div className="relative animate-element">
            <Avatar className="h-11 w-11 ring-2 ring-white/10">
              {pfpUrl ? <AvatarImage src={pfpUrl} alt="Profile" /> : null}
              <AvatarFallback className="bg-white/10 text-white/40">
                <CircleUserRound className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-[#111111]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="text-sm font-semibold tracking-tight truncate text-white">
                {shortAddress}
              </p>
              <span className="bg-white/10 text-white border border-white/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Online
              </span>
            </div>
            <p className="text-[10px] mt-0.5 truncate text-left text-white/25">
              {fullAddress}
            </p>
          </div>
        </div>

        {/* PFP actions */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onPfpUpload}
            className="flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer text-white/30 hover:text-white/60"
          >
            <CameraIcon className="h-3 w-3" />
            Change photo
          </button>
          {pfpUrl && (
            <button
              onClick={onRemovePfp}
              className="text-[11px] font-medium transition-colors cursor-pointer text-red-400/70 hover:text-red-400"
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <DropdownItem
          isLanding={cardIsLanding}
          onClick={onProfile}
          icon={<UserIcon className="h-4 w-4" />}
          label="Your Profile"
        />
        <DropdownItem
          isLanding={cardIsLanding}
          onClick={onCopy}
          icon={
            copied ? (
              <CheckIcon className="h-4 w-4 text-white" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )
          }
          label={copied ? "Copied!" : "Copy Email"}
          highlight={copied}
        />
      </div>

      {/* Separator */}
      <div className="mx-3 my-1 h-px bg-white/[0.06]" />

      {/* Log Out */}
      <div className="py-1">
        <DropdownItem
          isLanding={cardIsLanding}
          onClick={onDisconnect}
          icon={<LogOutIcon className="h-4 w-4" />}
          label="Log Out"
          danger
        />
      </div>
    </div>
  )
}

/* ================================================================== */
// DROPDOWN ITEM
function DropdownItem({
  isLanding,
  onClick,
  icon,
  label,
  danger,
  highlight,
}: {
  isLanding: boolean
  onClick: () => void
  icon: ReactNode
  label: string
  danger?: boolean
  highlight?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium",
        "transition-all duration-200 cursor-pointer",
        isLanding
          ? danger
          : "text-gray-700 hover:bg-gray-50"
          ? danger
            ? "text-red-500 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-50"
          : danger
            ? "text-red-400 hover:bg-red-500/10"
            : "text-white/70 hover:bg-white/[0.06]"
      )}
    >
      <span
        className={cn(
          "transition-colors duration-200",
          danger
            ? isLanding
              ? "text-red-400"
              : "text-red-400/70"
            : highlight
              ? (isLanding ? "text-zinc-950" : "text-white")
              : isLanding
                ? "text-gray-400"
                : "text-white/30"
        )}
      >
        {icon}
      </span>
      <span
        className={cn(
          "transition-colors duration-200",
          highlight && !danger && (isLanding ? "text-zinc-950" : "text-white")
        )}
      >
        {label}
      </span>
    </button>
  )
}
