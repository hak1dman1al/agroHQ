"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { formatDate } from "@/lib/utils"
import {
  Presentation,
  Plus,
  Loader2,
  Layers,
  Eye,
  Edit3,
  Share2,
  Lock,
  Globe,
} from "lucide-react"
import Link from "next/link"

interface PresItem {
  id: string
  title: string
  theme: string
  isPublic: boolean
  shareToken: string | null
  createdBy: string
  creatorName: string
  createdAt: Date
  updatedAt: Date
  slideCount: number
}

const themes = [
  { value: "executive", label: "Executive", color: "bg-forest-800" },
  { value: "modern", label: "Modern", color: "bg-blue-800" },
  { value: "minimal", label: "Minimal", color: "bg-gray-800" },
  { value: "bold", label: "Bold", color: "bg-gold-700" },
]

export function PresentationsPage({ presentations }: { presentations: PresItem[] }) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState("executive")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme }),
      })
      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      setOpen(false)
      setTitle("")
      router.push(`/presentations/${data.id}/edit`)
      toast({ title: "Presentation created" })
    } catch {
      toast({ title: "Failed to create presentation", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Presentations</h2>
          <p className="text-muted-foreground">
            Create and manage presentations for meetings and investors
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Presentation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Presentation</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Monthly Update - June 2026"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {themes.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded ${t.color}`} />
                          {t.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {presentations.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {presentations.map((pres) => {
            const themeConfig = themes.find((t) => t.value === pres.theme) || themes[0]
            return (
              <Card key={pres.id} className="border-border/50 hover:border-primary/20 transition-colors group">
                <CardHeader className="pb-0">
                  <div className={`aspect-video rounded-t-lg ${themeConfig.color} flex items-center justify-center`}>
                    <Presentation className="h-12 w-12 text-white/50" />
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  <h3 className="font-semibold text-foreground truncate">{pres.title}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      <Layers className="mr-1 h-3 w-3" />
                      {pres.slideCount} slides
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {pres.isPublic ? (
                        <><Globe className="mr-1 h-3 w-3" /> Public</>
                      ) : (
                        <><Lock className="mr-1 h-3 w-3" /> Private</>
                      )}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    {pres.creatorName} • Updated {formatDate(pres.updatedAt)}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/presentations/${pres.id}/edit`}>
                        <Edit3 className="mr-1 h-3 w-3" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/presentations/${pres.id}/present`}>
                        <Eye className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Presentation className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No presentations yet. Create your first presentation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
