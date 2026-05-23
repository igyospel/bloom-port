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
import { useSolanaWallet } from "@/hooks/useSolanaWallet"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type WalletDropdownProps = {
  variant: "landing" | "app"
}

export function WalletDropdown({ variant }: WalletDropdownProps) {
  const { connected, publicKey, shortAddress, connect, disconnect } = useSolanaWallet()
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
    if (!publicKey) return
    try {
      await navigator.clipboard.writeText(publicKey.toBase58())
      setCopied(true)
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      console.warn("Failed to copy address")
    }
  }, [publicKey])

  const fullAddress = publicKey?.toBase58() ?? ""

  // ── Profile Picture (persisted in localStorage per wallet) ──────────
  const [pfpUrl, setPfpUrl] = useState<string | null>(() => {
    if (!publicKey) return null
    const key = `bloomport-pfp-${publicKey.toBase58()}`
    return localStorage.getItem(key)
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Re-sync pfpUrl if publicKey changes
  useEffect(() => {
    if (!publicKey) {
      setPfpUrl(null)
      return
    }
    const key = `bloomport-pfp-${publicKey.toBase58()}`
    setPfpUrl(localStorage.getItem(key))
  }, [publicKey])

  const handlePfpUpload = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !publicKey) return

    const reader = new FileReader()
    reader.onload = () => {
      const url = reader.result as string
      const key = `bloomport-pfp-${publicKey.toBase58()}`
      localStorage.setItem(key, url)
      setPfpUrl(url)
    }
    reader.readAsDataURL(file)
    e.target.value = ""
  }, [publicKey])

  const triggerPfpUpload = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const isLanding = variant === "landing"

  // ── NOT CONNECTED ─────────────────────────────────────────────────────
  if (!connected || !shortAddress) {
    return (
      <ConnectButton connect={connect} isLanding={isLanding} />
    )
  }

  // ── CONNECTED ─────────────────────────────────────────────────────────
  return (
    <div className="relative" ref={dropdownRef}>
      <ConnectedTrigger
        open={open}
        onToggle={() => setOpen(!open)}
        isLanding={isLanding}
        shortAddress={shortAddress}
        pfpUrl={pfpUrl}
      />

      {open && (
        <ConnectedDropdown
          isLanding={isLanding}
          shortAddress={shortAddress}
          fullAddress={fullAddress}
          pfpUrl={pfpUrl}
          copied={copied}
          onCopy={handleCopy}
          onPfpUpload={triggerPfpUpload}
          onRemovePfp={() => {
            if (!publicKey) return
            const key = `bloomport-pfp-${publicKey.toBase58()}`
            localStorage.removeItem(key)
            setPfpUrl(null)
          }}
          onProfile={() => setOpen(false)}
          onDisconnect={() => {
            setOpen(false)
            disconnect()
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
// CONNECT BUTTON (not connected)
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
            ? "bg-gradient-to-r from-[#7b8e5c] via-[#a3b882] to-[#7b8e5c]"
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
            ? 'linear-gradient(90deg, transparent, rgba(123,142,92,0.15), transparent)'
            : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 2s infinite',
        }}
      />

      {/* Glow effect */}
      <div
        className={cn(
          "absolute inset-0 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10",
          isLanding ? "bg-[#7b8e5c]/30" : "bg-white/10"
        )}
      />

      {/* Content */}
      <span className="relative z-10 flex items-center gap-2.5">
        <span
          className={cn(
            "relative flex items-center justify-center w-5 h-5 rounded-full transition-transform duration-300 group-hover:scale-110",
            isLanding ? "bg-[#7b8e5c]/20" : "bg-white/10"
          )}
        >
          <Wallet className={cn("w-3 h-3", isLanding ? "text-[#a3b882]" : "text-white/70")} />
          {/* Pulse dot */}
          <span
            className={cn(
              "absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full animate-ping",
              isLanding ? "bg-[#a3b882]" : "bg-white/50"
            )}
          />
        </span>
        <span>Connect</span>
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
          ? "bg-white border border-gray-200 hover:shadow-md hover:border-gray-300"
          : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.10] hover:border-white/20"
      )}
    >
      {/* Avatar with status ring */}
      <div className="relative">
        <Avatar
          className={cn(
            "h-7 w-7 ring-2 transition-all duration-300",
            isLanding ? "ring-[#7b8e5c]/30" : "ring-white/15",
            open && (isLanding ? "ring-[#7b8e5c]/60" : "ring-white/30")
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
        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#7b8e5c] ring-2 ring-[#0a0a0a]" />
      </div>

      {/* Address */}
      <span
        className={cn(
          "font-mono text-[13px] tracking-tight transition-colors duration-200",
          isLanding ? "text-gray-800" : "text-white/80"
        )}
      >
        {shortAddress}
      </span>

      {/* Chevron */}
      <ChevronDown
        className={cn(
          "w-3.5 h-3.5 transition-transform duration-300",
          isLanding ? "text-gray-400" : "text-white/30",
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
  return (
    <div
      className={cn(
        "absolute right-0 top-full mt-2.5 w-60 rounded-2xl py-2 z-50",
        "animate-in fade-in-0 zoom-in-95 duration-200",
        isLanding
          ? "bg-white border border-gray-200 shadow-xl shadow-black/10"
          : "bg-[#111111] border border-white/10 shadow-xl shadow-black/40"
      )}
    >
      {/* Wallet identity header */}
      <div
        className={cn(
          "px-4 py-4",
          isLanding ? "border-b border-gray-100" : "border-b border-white/[0.06]"
        )}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar
              className={cn(
                "h-11 w-11 ring-2 transition-all duration-300",
                isLanding ? "ring-gray-200" : "ring-white/10"
              )}
            >
              {pfpUrl ? <AvatarImage src={pfpUrl} alt="Profile" /> : null}
              <AvatarFallback
                className={cn(
                  isLanding ? "bg-gray-100 text-gray-400" : "bg-white/10 text-white/40"
                )}
              >
                <CircleUserRound className="h-5 w-5" />
              </AvatarFallback>
            </Avatar>
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#7b8e5c] ring-2 ring-[#111111]" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <p
                className={cn(
                  "text-sm font-semibold tracking-tight truncate",
                  isLanding ? "text-gray-900" : "text-white"
                )}
              >
                {shortAddress}
              </p>
              <span
                className={cn(
                  "text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                  isLanding
                    ? "bg-green-50 text-green-600 border border-green-200"
                    : "bg-[#7b8e5c]/15 text-[#a3b882] border border-[#7b8e5c]/20"
                )}
              >
                Active
              </span>
            </div>
            <p
              className={cn(
                "text-[10px] font-mono mt-0.5 truncate",
                isLanding ? "text-gray-400" : "text-white/25"
              )}
            >
              {fullAddress}
            </p>
          </div>
        </div>

        {/* PFP actions */}
        <div className="flex items-center gap-3 mt-3">
          <button
            onClick={onPfpUpload}
            className={cn(
              "flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer",
              isLanding
                ? "text-gray-500 hover:text-gray-700"
                : "text-white/30 hover:text-white/60"
            )}
          >
            <CameraIcon className="h-3 w-3" />
            Change photo
          </button>
          {pfpUrl && (
            <button
              onClick={onRemovePfp}
              className={cn(
                "text-[11px] font-medium transition-colors cursor-pointer",
                isLanding ? "text-red-400 hover:text-red-600" : "text-red-400/70 hover:text-red-400"
              )}
            >
              Remove
            </button>
          )}
        </div>
      </div>

      {/* Menu items */}
      <div className="py-1">
        <DropdownItem
          isLanding={isLanding}
          onClick={onProfile}
          icon={<UserIcon className="h-4 w-4" />}
          label="Your Profile"
        />
        <DropdownItem
          isLanding={isLanding}
          onClick={onCopy}
          icon={
            copied ? (
              <CheckIcon className="h-4 w-4 text-[#7b8e5c]" />
            ) : (
              <CopyIcon className="h-4 w-4" />
            )
          }
          label={copied ? "Copied!" : "Copy Address"}
          highlight={copied}
        />
      </div>

      {/* Separator */}
      <div
        className={cn(
          "mx-3 my-1 h-px",
          isLanding ? "bg-gray-100" : "bg-white/[0.06]"
        )}
      />

      {/* Disconnect */}
      <div className="py-1">
        <DropdownItem
          isLanding={isLanding}
          onClick={onDisconnect}
          icon={<Unplug className="h-4 w-4" />}
          label="Disconnect"
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
              ? "text-[#7b8e5c]"
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
          highlight && !danger && "text-[#7b8e5c]"
        )}
      >
        {label}
      </span>
    </button>
  )
}

