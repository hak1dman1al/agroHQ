"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/components/providers/auth-provider"
import { Target, Eye, Compass, Heart, Rocket, Edit3, Save, Loader2, Plus } from "lucide-react"

interface Section {
  id: string
  title: string
  content: string
  type: string
  orderIndex: number
}

const sectionConfig = [
  { type: "why_agro", label: "Why Agro", icon: Compass, color: "text-forest-400" },
  { type: "mission", label: "Our Mission", icon: Target, color: "text-primary" },
  { type: "vision", label: "Our Vision", icon: Eye, color: "text-gold-400" },
  { type: "core_values", label: "Core Values", icon: Heart, color: "text-red-400" },
  { type: "long_term_goals", label: "Long-term Goals", icon: Rocket, color: "text-blue-400" },
]

export function VisionPage({ sections }: { sections: Section[] }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editTitle, setEditTitle] = useState("")
  const [loading, setLoading] = useState(false)
  const [addingType, setAddingType] = useState<string | null>(null)
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = session?.user?.role === "admin"

  function getSection(type: string) {
    return sections.find((s) => s.type === type)
  }

  function startEdit(section: Section) {
    setEditingId(section.id)
    setEditTitle(section.title)
    setEditContent(section.content)
  }

  async function saveEdit(id: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/vision/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      })
      if (!res.ok) throw new Error("Failed to save")
      setEditingId(null)
      router.refresh()
      toast({ title: "Section updated" })
    } catch {
      toast({ title: "Failed to update", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function addSection(type: string) {
    setLoading(true)
    try {
      const config = sectionConfig.find((c) => c.type === type)
      const res = await fetch("/api/vision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: config?.label || type,
          content: "Click edit to add content...",
          type,
        }),
      })
      if (!res.ok) throw new Error("Failed to create")
      setAddingType(null)
      router.refresh()
      toast({ title: "Section created" })
    } catch {
      toast({ title: "Failed to create section", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Vision & Mission</h2>
        <p className="text-muted-foreground">
          Our company philosophy and strategic direction
        </p>
      </div>

      <div className="space-y-6">
        {sectionConfig.map((config) => {
          const section = getSection(config.type)
          const Icon = config.icon
          const isEditing = editingId === section?.id

          if (!section) {
            return (
              <Card key={config.type} className="border-dashed border-border/50">
                <CardContent className="flex items-center justify-center py-12">
                  {isAdmin ? (
                    <Button
                      variant="outline"
                      onClick={() => addSection(config.type)}
                      disabled={loading}
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Plus className="mr-2 h-4 w-4" />
                      )}
                      Add {config.label}
                    </Button>
                  ) : (
                    <p className="text-muted-foreground">{config.label} not yet defined</p>
                  )}
                </CardContent>
              </Card>
            )
          }

          return (
            <Card key={config.type} className="border-border/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className={`h-5 w-5 ${config.color}`} />
                    </div>
                    {isEditing ? (
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="text-xl font-semibold h-8 w-64"
                      />
                    ) : (
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                    )}
                  </div>
                  {isAdmin && (
                    <div>
                      {isEditing ? (
                        <Button
                          size="sm"
                          onClick={() => saveEdit(section.id)}
                          disabled={loading}
                        >
                          {loading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          ) : (
                            <Save className="mr-2 h-4 w-4" />
                          )}
                          Save
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => startEdit(section)}
                        >
                          <Edit3 className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={8}
                    className="text-sm"
                  />
                ) : (
                  <div className="text-foreground whitespace-pre-wrap leading-relaxed">
                    {section.content}
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
