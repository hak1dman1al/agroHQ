"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Map,
  Calendar,
  FileText,
  DollarSign,
  Presentation,
  BarChart3,
  Settings,
  Target,
  Megaphone,
  Search,
} from "lucide-react"

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const commands = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, category: "Navigation" },
  { title: "Organization", href: "/organization", icon: Users, category: "Navigation" },
  { title: "Tasks", href: "/tasks", icon: CheckSquare, category: "Navigation" },
  { title: "Vision & Mission", href: "/vision", icon: Target, category: "Navigation" },
  { title: "Roadmap", href: "/roadmap", icon: Map, category: "Navigation" },
  { title: "Meetings", href: "/meetings", icon: Calendar, category: "Navigation" },
  { title: "Progress Updates", href: "/updates", icon: Megaphone, category: "Navigation" },
  { title: "Documents", href: "/documents", icon: FileText, category: "Navigation" },
  { title: "Financial", href: "/financial", icon: DollarSign, category: "Navigation" },
  { title: "Presentations", href: "/presentations", icon: Presentation, category: "Navigation" },
  { title: "Reports", href: "/reports", icon: BarChart3, category: "Navigation" },
  { title: "Settings", href: "/settings", icon: Settings, category: "Navigation" },
]

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    if (open) {
      inputRef.current?.focus()
    }
  }, [open])

  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
      if (e.key === "Escape") {
        onOpenChange(false)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [open, onOpenChange])

  function handleSelect(href: string) {
    router.push(href)
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm" onClick={() => onOpenChange(false)}>
      <div className="fixed left-1/2 top-[20%] w-full max-w-lg -translate-x-1/2" onClick={(e) => e.stopPropagation()}>
        <Command className="rounded-lg border border-border bg-background shadow-2xl">
          <div className="flex items-center border-b border-border px-3">
            <Search className="mr-2 h-4 w-4 text-muted-foreground" />
            <Command.Input
              ref={inputRef}
              placeholder="Type a command or search..."
              className="flex h-11 w-full bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found
            </Command.Empty>
            <Command.Group heading="Navigation" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              {commands.map((cmd) => {
                const Icon = cmd.icon
                return (
                  <Command.Item
                    key={cmd.href}
                    onSelect={() => handleSelect(cmd.href)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span>{cmd.title}</span>
                  </Command.Item>
                )
              })}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  )
}
