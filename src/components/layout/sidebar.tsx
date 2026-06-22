"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
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
  Leaf,
  ChevronLeft,
  Target,
  Megaphone,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
}

const mainNav: NavItem[] = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Organization", href: "/organization", icon: Users },
  { title: "Tasks", href: "/tasks", icon: CheckSquare },
]

const contentNav: NavItem[] = [
  { title: "Vision & Mission", href: "/vision", icon: Target },
  { title: "Roadmap", href: "/roadmap", icon: Map },
  { title: "Meetings", href: "/meetings", icon: Calendar },
  { title: "Progress Updates", href: "/updates", icon: Megaphone },
]

const resourcesNav: NavItem[] = [
  { title: "Documents", href: "/documents", icon: FileText },
  { title: "Financial", href: "/financial", icon: DollarSign },
  { title: "Presentations", href: "/presentations", icon: Presentation },
  { title: "Reports", href: "/reports", icon: BarChart3 },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname()

  function NavSection({ title, items }: { title: string; items: NavItem[] }) {
    return (
      <div className="space-y-1">
        {!collapsed && (
          <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {title}
          </h3>
        )}
        {items.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "hover:bg-accent hover:text-accent-foreground",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{item.title}</span>}
              {!collapsed && item.badge && (
                <Badge variant="secondary" className="ml-auto text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 h-screen border-r border-border bg-background transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-primary" />
            </div>
            {!collapsed && (
              <span className="text-lg font-bold text-foreground">Agro HQ</span>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronLeft
              className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )}
            />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-6">
          <NavSection title="Main" items={mainNav} />
          <Separator />
          <NavSection title="Content" items={contentNav} />
          <Separator />
          <NavSection title="Resources" items={resourcesNav} />
        </nav>

        {/* Footer */}
        <div className="border-t border-border p-3">
          <Link
            href="/settings"
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              pathname === "/settings"
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground"
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  )
}
