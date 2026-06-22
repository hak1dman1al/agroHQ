"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { SlideRenderer } from "@/components/presentations/slide-renderer"
import {
  ArrowLeft,
  Plus,
  Play,
  Loader2,
  Save,
  Trash2,
  GripVertical,
  Sparkles,
  Eye,
} from "lucide-react"
import Link from "next/link"

interface Slide {
  id: string
  presentationId: string
  type: string
  layout: string
  title: string | null
  subtitle: string | null
  mainMessage: string | null
  contentJson: any
  orderIndex: number
}

interface Presentation {
  id: string
  title: string
  theme: string
  slides: Slide[]
}

const slideTypes = [
  { value: "cover", label: "Cover" },
  { value: "section", label: "Section Divider" },
  { value: "text", label: "Text" },
  { value: "bullet", label: "Bullet Points" },
  { value: "kpi", label: "KPI Dashboard" },
  { value: "timeline", label: "Timeline" },
  { value: "roadmap", label: "Roadmap" },
  { value: "organization", label: "Organization" },
  { value: "comparison", label: "Comparison" },
  { value: "cards", label: "Cards" },
  { value: "quote", label: "Quote" },
  { value: "image", label: "Image" },
  { value: "table", label: "Table" },
  { value: "financial", label: "Financial" },
  { value: "action_plan", label: "Action Plan" },
  { value: "meeting_summary", label: "Meeting Summary" },
  { value: "decision", label: "Decision" },
  { value: "risk", label: "Risk" },
  { value: "thank_you", label: "Thank You" },
]

export function PresentationEditor({ presentation }: { presentation: Presentation }) {
  const [slides, setSlides] = useState<Slide[]>(presentation.slides)
  const [selectedSlide, setSelectedSlide] = useState<string | null>(
    presentation.slides[0]?.id || null
  )
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [newSlideType, setNewSlideType] = useState("cover")
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [aiDialogOpen, setAiDialogOpen] = useState(false)
  const [aiContent, setAiContent] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  const currentSlide = slides.find((s) => s.id === selectedSlide)

  async function addSlide(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch(`/api/presentations/${presentation.id}/slides`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newSlideType,
          layout: "center",
          title: "",
          subtitle: "",
          mainMessage: "",
          contentJson: {},
          orderIndex: slides.length,
        }),
      })
      if (!res.ok) throw new Error("Failed")

      const newSlide = await res.json()
      setSlides([...slides, newSlide])
      setSelectedSlide(newSlide.id)
      setAddDialogOpen(false)
      toast({ title: "Slide added" })
    } catch {
      toast({ title: "Failed to add slide", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function updateSlide(slideId: string, updates: Partial<Slide>) {
    setSlides(slides.map((s) => (s.id === slideId ? { ...s, ...updates } : s)))

    try {
      await fetch(`/api/presentations/slides/${slideId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      })
    } catch {
      toast({ title: "Failed to save slide", variant: "destructive" })
    }
  }

  async function deleteSlide(slideId: string) {
    if (!confirm("Delete this slide?")) return

    try {
      await fetch(`/api/presentations/slides/${slideId}`, {
        method: "DELETE",
      })
      setSlides(slides.filter((s) => s.id !== slideId))
      if (selectedSlide === slideId) {
        setSelectedSlide(slides[0]?.id || null)
      }
      toast({ title: "Slide deleted" })
    } catch {
      toast({ title: "Failed to delete slide", variant: "destructive" })
    }
  }

  async function generateWithAI(e: React.FormEvent) {
    e.preventDefault()
    if (!aiContent.trim()) return

    setLoading(true)
    try {
      const res = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiContent,
          presentationId: presentation.id,
          currentSlideCount: slides.length,
        }),
      })
      if (!res.ok) throw new Error("Failed")

      const data = await res.json()
      if (data.slides && data.slides.length > 0) {
        setSlides([...slides, ...data.slides])
        toast({ title: `${data.slides.length} slides generated` })
      }
      setAiDialogOpen(false)
      setAiContent("")
    } catch {
      toast({ title: "AI generation failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon">
            <Link href="/presentations">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-lg font-semibold">{presentation.title}</h1>
          <Badge variant="outline">{slides.length} slides</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Generate
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Generate Slides with AI</DialogTitle>
              </DialogHeader>
              <form onSubmit={generateWithAI} className="space-y-4">
                <div className="space-y-2">
                  <Label>Paste your content</Label>
                  <Textarea
                    value={aiContent}
                    onChange={(e) => setAiContent(e.target.value)}
                    placeholder="Paste meeting notes, KPIs, business updates, or any content. AI will transform it into beautiful slides..."
                    rows={8}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  AI will analyze your content and generate appropriate slides (cover, KPIs, timelines, etc.)
                </p>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAiDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Slides
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <Button asChild variant="outline" size="sm">
            <Link href={`/presentations/${presentation.id}/present`}>
              <Play className="mr-2 h-4 w-4" />
              Present
            </Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Slide List */}
        <div className="w-56 border-r border-border overflow-y-auto p-3 space-y-2">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              onClick={() => setSelectedSlide(slide.id)}
              className={cn(
                "w-full text-left p-2 rounded-lg border transition-colors",
                selectedSlide === slide.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-primary/50"
              )}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{index + 1}</span>
                <span className="text-xs font-medium truncate flex-1">
                  {slide.title || slideTypes.find((t) => t.value === slide.type)?.label || "Untitled"}
                </span>
              </div>
              <div className="mt-1 aspect-video bg-muted rounded flex items-center justify-center">
                <span className="text-[10px] text-muted-foreground">{slide.type}</span>
              </div>
            </button>
          ))}

          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <button className="w-full p-2 rounded-lg border border-dashed border-border hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-center gap-2 py-2">
                  <Plus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add Slide</span>
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Slide</DialogTitle>
              </DialogHeader>
              <form onSubmit={addSlide} className="space-y-4">
                <div className="space-y-2">
                  <Label>Slide Type</Label>
                  <Select value={newSlideType} onValueChange={setNewSlideType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slideTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Add"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Slide Preview & Editor */}
        <div className="flex-1 flex overflow-hidden">
          {/* Preview */}
          <div className="flex-1 p-6 overflow-y-auto">
            {currentSlide ? (
              <div className="aspect-video bg-card border border-border rounded-lg overflow-hidden shadow-lg">
                <SlideRenderer slide={currentSlide} theme={presentation.theme} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground">Select a slide to preview</p>
              </div>
            )}
          </div>

          {/* Editor Panel */}
          {currentSlide && (
            <div className="w-80 border-l border-border overflow-y-auto p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">Slide Properties</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSlide(currentSlide.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-400" />
                </Button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <Label className="text-xs">Type</Label>
                  <Select
                    value={currentSlide.type}
                    onValueChange={(v) => updateSlide(currentSlide.id, { type: v })}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slideTypes.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Title</Label>
                  <Input
                    value={currentSlide.title || ""}
                    onChange={(e) => updateSlide(currentSlide.id, { title: e.target.value })}
                    placeholder="Slide title"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={currentSlide.subtitle || ""}
                    onChange={(e) => updateSlide(currentSlide.id, { subtitle: e.target.value })}
                    placeholder="Subtitle"
                    className="h-8 text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Main Message</Label>
                  <Textarea
                    value={currentSlide.mainMessage || ""}
                    onChange={(e) => updateSlide(currentSlide.id, { mainMessage: e.target.value })}
                    placeholder="Key message for this slide"
                    rows={3}
                    className="text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <Label className="text-xs">Content (JSON)</Label>
                  <Textarea
                    value={JSON.stringify(currentSlide.contentJson || {}, null, 2)}
                    onChange={(e) => {
                      try {
                        const json = JSON.parse(e.target.value)
                        updateSlide(currentSlide.id, { contentJson: json })
                      } catch {}
                    }}
                    rows={6}
                    className="text-xs font-mono"
                    placeholder='{"components": [...]}'
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
