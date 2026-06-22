"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
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
import { useAuth } from "@/components/providers/auth-provider"
import { formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import {
  Map,
  Plus,
  Loader2,
  CheckCircle2,
  Circle,
  Calendar,
  Target,
  Edit3,
} from "lucide-react"

interface Milestone {
  id: string
  roadmapId: string
  title: string
  description: string | null
  isCompleted: boolean
  orderIndex: number
}

interface Roadmap {
  id: string
  title: string
  description: string | null
  startDate: Date | null
  endDate: Date | null
  status: string
  completionPercentage: number
  orderIndex: number
  milestones: Milestone[]
}

const statusColors: Record<string, string> = {
  planned: "bg-muted text-muted-foreground",
  in_progress: "bg-primary/10 text-primary",
  completed: "bg-green-500/10 text-green-500",
  delayed: "bg-red-500/10 text-red-500",
}

export function RoadmapPage({ roadmaps }: { roadmaps: Roadmap[] }) {
  const [roadmapDialogOpen, setRoadmapDialogOpen] = useState(false)
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false)
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const { session } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isAdmin = session?.user?.role === "admin"

  // Roadmap form
  const [rmTitle, setRmTitle] = useState("")
  const [rmDesc, setRmDesc] = useState("")
  const [rmStart, setRmStart] = useState("")
  const [rmEnd, setRmEnd] = useState("")
  const [rmStatus, setRmStatus] = useState("planned")

  // Milestone form
  const [msTitle, setMsTitle] = useState("")
  const [msDesc, setMsDesc] = useState("")

  async function createRoadmap(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: rmTitle,
          description: rmDesc,
          startDate: rmStart || null,
          endDate: rmEnd || null,
          status: rmStatus,
        }),
      })
      if (!res.ok) throw new Error("Failed")

      setRoadmapDialogOpen(false)
      setRmTitle("")
      setRmDesc("")
      setRmStart("")
      setRmEnd("")
      router.refresh()
      toast({ title: "Roadmap phase created" })
    } catch {
      toast({ title: "Failed to create roadmap", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function addMilestone(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedRoadmap) return
    setLoading(true)
    try {
      const res = await fetch(`/api/roadmaps/${selectedRoadmap}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: msTitle, description: msDesc }),
      })
      if (!res.ok) throw new Error("Failed")

      setMilestoneDialogOpen(false)
      setMsTitle("")
      setMsDesc("")
      router.refresh()
      toast({ title: "Milestone added" })
    } catch {
      toast({ title: "Failed to add milestone", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  async function toggleMilestone(milestoneId: string, isCompleted: boolean) {
    try {
      await fetch(`/api/roadmaps/milestones/${milestoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: !isCompleted }),
      })
      router.refresh()
    } catch {
      toast({ title: "Failed to update milestone", variant: "destructive" })
    }
  }

  async function updateRoadmapStatus(roadmapId: string, status: string) {
    try {
      await fetch(`/api/roadmaps/${roadmapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      router.refresh()
    } catch {
      toast({ title: "Failed to update status", variant: "destructive" })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Roadmap</h2>
          <p className="text-muted-foreground">
            Company journey timeline with milestones and progress
          </p>
        </div>
        {isAdmin && (
          <Dialog open={roadmapDialogOpen} onOpenChange={setRoadmapDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Phase
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Roadmap Phase</DialogTitle>
              </DialogHeader>
              <form onSubmit={createRoadmap} className="space-y-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={rmTitle}
                    onChange={(e) => setRmTitle(e.target.value)}
                    placeholder="e.g., Startup Phase, Growth Phase"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={rmDesc}
                    onChange={(e) => setRmDesc(e.target.value)}
                    placeholder="Phase description..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input type="date" value={rmStart} onChange={(e) => setRmStart(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input type="date" value={rmEnd} onChange={(e) => setRmEnd(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={rmStatus} onValueChange={setRmStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="planned">Planned</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="delayed">Delayed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setRoadmapDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Create"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Timeline */}
      {roadmaps.length > 0 ? (
        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

          <div className="space-y-8">
            {roadmaps.map((roadmap, index) => (
              <div key={roadmap.id} className="relative pl-16">
                {/* Timeline dot */}
                <div
                  className={cn(
                    "absolute left-4 w-5 h-5 rounded-full border-2 border-background",
                    roadmap.status === "completed"
                      ? "bg-green-500"
                      : roadmap.status === "in_progress"
                      ? "bg-primary"
                      : roadmap.status === "delayed"
                      ? "bg-red-500"
                      : "bg-muted"
                  )}
                />

                <Card className="border-border/50">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl">{roadmap.title}</CardTitle>
                        <div className="flex items-center gap-3 mt-2">
                          {(roadmap.startDate || roadmap.endDate) && (
                            <span className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {roadmap.startDate ? formatDate(roadmap.startDate) : "?"}
                              {" - "}
                              {roadmap.endDate ? formatDate(roadmap.endDate) : "?"}
                            </span>
                          )}
                          <Badge className={cn("text-xs", statusColors[roadmap.status])}>
                            {roadmap.status.replace("_", " ")}
                          </Badge>
                        </div>
                      </div>
                      {isAdmin && (
                        <Select
                          value={roadmap.status}
                          onValueChange={(v) => updateRoadmapStatus(roadmap.id, v)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="delayed">Delayed</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    {roadmap.description && (
                      <p className="text-sm text-muted-foreground mt-2">
                        {roadmap.description}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{roadmap.completionPercentage}%</span>
                      </div>
                      <Progress value={roadmap.completionPercentage} />
                    </div>

                    {/* Milestones */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Milestones ({roadmap.milestones.filter((m) => m.isCompleted).length}/{roadmap.milestones.length})
                        </h4>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRoadmap(roadmap.id)
                              setMilestoneDialogOpen(true)
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      {roadmap.milestones.length > 0 ? (
                        <div className="space-y-2">
                          {roadmap.milestones.map((milestone) => (
                            <button
                              key={milestone.id}
                              onClick={() => isAdmin && toggleMilestone(milestone.id, milestone.isCompleted)}
                              className={cn(
                                "w-full flex items-center gap-3 p-2 rounded-md text-left transition-colors",
                                isAdmin && "hover:bg-muted",
                                milestone.isCompleted && "opacity-60"
                              )}
                            >
                              {milestone.isCompleted ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                              )}
                              <div>
                                <p
                                  className={cn(
                                    "text-sm",
                                    milestone.isCompleted && "line-through"
                                  )}
                                >
                                  {milestone.title}
                                </p>
                                {milestone.description && (
                                  <p className="text-xs text-muted-foreground">
                                    {milestone.description}
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No milestones yet</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Map className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
            <p className="text-muted-foreground">
              No roadmap phases yet. Add your first phase to visualize the company journey.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <form onSubmit={addMilestone} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={msTitle}
                onChange={(e) => setMsTitle(e.target.value)}
                placeholder="e.g., Land acquisition complete"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input
                value={msDesc}
                onChange={(e) => setMsDesc(e.target.value)}
                placeholder="Optional description"
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
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
  )
}
