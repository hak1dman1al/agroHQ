"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  Sparkles,
  FileText,
  Wand2,
  Layout as LayoutIcon,
  Loader2,
  Presentation,
  Zap,
  Globe,
  FileCode,
  ChevronRight,
} from "lucide-react"
import Link from "next/link"

const templates = [
  {
    id: "monthly-update",
    title: "Monthly Update",
    description: "Share progress, KPIs, and updates with stakeholders",
    icon: "📊",
    preview: ["Cover", "KPIs", "Progress", "Financials", "Next Steps"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "investor-pitch",
    title: "Investor Pitch",
    description: "Compelling pitch deck for funding rounds",
    icon: "💼",
    preview: ["Cover", "Problem", "Solution", "Market", "Traction", "Team", "Ask"],
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "quarterly-review",
    title: "Quarterly Review",
    description: "Comprehensive business performance review",
    icon: "📈",
    preview: ["Cover", "Executive Summary", "KPIs", "Financials", "Wins", "Challenges", "Q Outlook"],
    color: "from-green-500 to-emerald-500",
  },
  {
    id: "strategy-deck",
    title: "Strategy Deck",
    description: "Strategic planning and roadmap presentation",
    icon: "🎯",
    preview: ["Cover", "Vision", "Mission", "Strategy", "Roadmap", "Milestones"],
    color: "from-orange-500 to-red-500",
  },
  {
    id: "board-meeting",
    title: "Board Meeting",
    description: "Formal board meeting presentation",
    icon: "🏛️",
    preview: ["Cover", "Agenda", "Financials", "KPIs", "Decisions", "Q&A"],
    color: "from-indigo-500 to-purple-500",
  },
  {
    id: "blank",
    title: "Blank Deck",
    description: "Start from scratch with a clean canvas",
    icon: "✨",
    preview: ["Cover"],
    color: "from-gray-500 to-gray-700",
  },
]

export function NewPresentationPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [mode, setMode] = useState<"select" | "ai" | "blank" | "template">("select")
  const [loading, setLoading] = useState(false)

  // AI generation state
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiType, setAiType] = useState<"general" | "monthly_update" | "investor" | "strategy">("general")

  // Blank form state
  const [title, setTitle] = useState("")
  const [theme, setTheme] = useState("executive")

  // Selected template
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  async function createBlank() {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme }),
      })
      if (!res.ok) throw new Error("Failed")
      const pres = await res.json()
      router.push(`/presentations/${pres.id}/edit`)
    } catch {
      toast({ title: "Failed to create", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function createFromTemplate(templateId: string) {
    if (!title.trim()) {
      toast({ title: "Title required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      // Create presentation
      const res = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, theme }),
      })
      if (!res.ok) throw new Error("Failed")
      const pres = await res.json()

      // Generate slides from template
      const templateRes = await fetch("/api/presentations/generate-template", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateId, presentationId: pres.id }),
      })
      if (!templateRes.ok) throw new Error("Failed to generate")

      router.push(`/presentations/${pres.id}/edit`)
    } catch {
      toast({ title: "Failed to create from template", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function generateWithAI() {
    if (!aiPrompt.trim()) {
      toast({ title: "Please enter some content", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      // First create a presentation
      const titleFromContent = aiPrompt.split("\n")[0].substring(0, 50) || "AI Generated"
      const createRes = await fetch("/api/presentations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: titleFromContent, theme }),
      })
      if (!createRes.ok) throw new Error("Failed to create")
      const pres = await createRes.json()

      // Then generate slides
      const genRes = await fetch("/api/presentations/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: aiPrompt,
          presentationId: pres.id,
          type: aiType,
        }),
      })
      if (!genRes.ok) throw new Error("Failed to generate")

      const data = await genRes.json()
      toast({
        title: "Success!",
        description: `Generated ${data.slides?.length || 0} slides`,
      })
      router.push(`/presentations/${pres.id}/edit`)
    } catch {
      toast({ title: "Generation failed", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  // AI MODE
  if (mode === "ai") {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMode("select")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Generate with AI</h1>
            <p className="text-sm text-muted-foreground">
              Paste your content and AI will create a beautiful presentation
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Presentation Type</Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[
                  { value: "general", label: "General", icon: "📄" },
                  { value: "monthly_update", label: "Monthly Update", icon: "📊" },
                  { value: "investor", label: "Investor Pitch", icon: "💼" },
                  { value: "strategy", label: "Strategy", icon: "🎯" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setAiType(t.value as any)}
                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                      aiType === t.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="text-2xl mb-1">{t.icon}</div>
                    <div className="text-sm font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Your Content</Label>
              <Textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Paste your content here... Examples:&#10;&#10;• Meeting notes from June 2026&#10;• Revenue: $1.2M, Growth: +15%&#10;• Key wins: Launched new product, Hired 3 engineers&#10;• Next: Expand to Singapore, Raise Series A&#10;&#10;Or paste a URL, article, or any business content..."
                rows={12}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                💡 Tip: Include numbers, dates, achievements, and plans for best results
              </p>
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: "executive", label: "Executive", color: "bg-forest-800" },
                  { value: "modern", label: "Modern", color: "bg-blue-800" },
                  { value: "minimal", label: "Minimal", color: "bg-gray-800" },
                  { value: "bold", label: "Bold", color: "bg-gold-700" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === t.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-full h-8 rounded ${t.color} mb-1`} />
                    <div className="text-xs font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setMode("select")}>
                Cancel
              </Button>
              <Button onClick={generateWithAI} disabled={loading || !aiPrompt.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating slides...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Presentation
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // TEMPLATE MODE
  if (mode === "template") {
    return (
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMode("select")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Choose a Template</h1>
            <p className="text-sm text-muted-foreground">
              Start with a professionally designed template
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Presentation Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Monthly Update - June 2026"
            />
          </div>

          <div className="space-y-2">
            <Label>Theme</Label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: "executive", label: "Executive", color: "bg-forest-800" },
                { value: "modern", label: "Modern", color: "bg-blue-800" },
                { value: "minimal", label: "Minimal", color: "bg-gray-800" },
                { value: "bold", label: "Bold", color: "bg-gold-700" },
              ].map((t) => (
                <button
                  key={t.value}
                  onClick={() => setTheme(t.value)}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    theme === t.value
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className={`w-full h-8 rounded ${t.color} mb-1`} />
                  <div className="text-xs font-medium">{t.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={`text-left p-4 rounded-lg border-2 transition-all ${
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                }`}
              >
                <div
                  className={`aspect-video rounded-lg bg-gradient-to-br ${template.color} flex items-center justify-center text-6xl mb-3`}
                >
                  {template.icon}
                </div>
                <h3 className="font-semibold text-sm mb-1">{template.title}</h3>
                <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                <div className="flex flex-wrap gap-1">
                  {template.preview.slice(0, 3).map((s) => (
                    <Badge key={s} variant="secondary" className="text-xs">
                      {s}
                    </Badge>
                  ))}
                  {template.preview.length > 3 && (
                    <Badge variant="secondary" className="text-xs">
                      +{template.preview.length - 3}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <Button variant="outline" onClick={() => setMode("select")}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedTemplate && createFromTemplate(selectedTemplate)}
              disabled={loading || !title.trim() || !selectedTemplate}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <LayoutIcon className="mr-2 h-4 w-4" />
                  Create from Template
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // BLANK MODE
  if (mode === "blank") {
    return (
      <div className="max-w-2xl mx-auto p-6 space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setMode("select")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Create Blank Presentation</h1>
            <p className="text-sm text-muted-foreground">
              Start with a clean canvas
            </p>
          </div>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Presentation"
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "executive", label: "Executive", color: "bg-forest-800" },
                  { value: "modern", label: "Modern", color: "bg-blue-800" },
                  { value: "minimal", label: "Minimal", color: "bg-gray-800" },
                  { value: "bold", label: "Bold", color: "bg-gold-700" },
                ].map((t) => (
                  <button
                    key={t.value}
                    onClick={() => setTheme(t.value)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      theme === t.value
                        ? "border-primary bg-primary/10"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className={`w-full h-12 rounded ${t.color} mb-1`} />
                    <div className="text-xs font-medium">{t.label}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t">
              <Button variant="outline" onClick={() => setMode("select")}>
                Cancel
              </Button>
              <Button onClick={createBlank} disabled={loading || !title.trim()}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create"
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // SELECT MODE (main screen)
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link href="/presentations">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Presentation</h1>
          <p className="text-muted-foreground">Choose how you'd like to start</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* AI Generation */}
        <button
          onClick={() => setMode("ai")}
          className="text-left p-6 rounded-xl border-2 border-border hover:border-primary transition-all group bg-gradient-to-br from-primary/5 to-primary/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Generate with AI</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Paste your content, notes, or ideas. AI will create a complete presentation for you.
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">⚡ Fastest</Badge>
            <Badge variant="secondary" className="text-xs">Smart</Badge>
            <Badge variant="secondary" className="text-xs">Recommended</Badge>
          </div>
        </button>

        {/* Templates */}
        <button
          onClick={() => setMode("template")}
          className="text-left p-6 rounded-xl border-2 border-border hover:border-primary transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <LayoutIcon className="h-6 w-6 text-blue-500" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Start with a professionally designed template. Pre-built for common use cases.
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">6 templates</Badge>
            <Badge variant="secondary" className="text-xs">Quick start</Badge>
          </div>
        </button>

        {/* From Notes */}
        <button
          onClick={() => setMode("ai")}
          className="text-left p-6 rounded-xl border-2 border-border hover:border-primary transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <FileText className="h-6 w-6 text-purple-500" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">From Meeting Notes</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Paste meeting minutes, discussion notes, or decisions. AI will structure them.
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">Structured</Badge>
            <Badge variant="secondary" className="text-xs">Action items</Badge>
          </div>
        </button>

        {/* Blank */}
        <button
          onClick={() => setMode("blank")}
          className="text-left p-6 rounded-xl border-2 border-border hover:border-primary transition-all group"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="w-12 h-12 rounded-lg bg-gray-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Presentation className="h-6 w-6 text-gray-500" />
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
          </div>
          <h3 className="text-lg font-semibold mb-2">Blank Presentation</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Start from scratch with a clean canvas. Add slides manually.
          </p>
          <div className="flex flex-wrap gap-1">
            <Badge variant="secondary" className="text-xs">Full control</Badge>
            <Badge variant="secondary" className="text-xs">From zero</Badge>
          </div>
        </button>
      </div>

      <div className="bg-muted/50 rounded-lg p-4 border border-border">
        <div className="flex items-start gap-3">
          <Zap className="h-5 w-5 text-gold-400 mt-0.5" />
          <div>
            <p className="text-sm font-medium">Pro Tip</p>
            <p className="text-xs text-muted-foreground">
              For best AI results, include specific numbers, dates, achievements, and plans. 
              Example: "Revenue $1.2M (+15% MoM), launched in 3 states, hired 5 engineers, planning Series A in Q3"
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
